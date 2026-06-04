import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSignedUrlIfNeeded, getSignedUrlsBatch } from '@/utils/storage';
import { rateLimit } from '@/utils/rate-limit';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }: { name: string, value: string, options: CookieOptions }) => 
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  );
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  // We allow public check if searching by orderId ONLY (limited data or requires knowing ID)
  // But if searching by EMAIL, we MUST verify the user is logged in as that email.
  
  // 0. Rate Limiting (5 requests per minute)
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const limiter = rateLimit(ip, 10, 60000);
  
  if (!limiter.success) {
    return NextResponse.json({ 
      success: false, 
      error: 'Too many requests. Please wait a minute.',
      retryAfter: Math.ceil((limiter.reset - Date.now()) / 1000)
    }, { 
      status: 429,
      headers: {
        'Retry-After': Math.ceil((limiter.reset - Date.now()) / 1000).toString()
      }
    });
  }

  try {
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('orderId');
    const email = searchParams.get('email');

    if (!orderId && !email) {
      return NextResponse.json({ active: false, orders: [] });
    }

    // --- SECURITY: VERIFY OWNERSHIP IF SEARCHING BY EMAIL ---
    if (email && (!user || user.email !== email.toLowerCase().trim())) {
      return NextResponse.json({ 
        active: false, 
        orders: [], 
        error: 'Authentication required to view history for this email.' 
      }, { status: 401 });
    }

    // --- SECURITY: IF SEARCHING BY ID, STILL REQUIRE LOGIN (Optional but safer) ---
    if (orderId && !user) {
      return NextResponse.json({ 
        active: false, 
        orders: [], 
        error: 'Please login to track your order.' 
      }, { status: 401 });
    }

    // Fetch ONLY IDs of active commissions to calculate queue position safely
    const { data: allActive, error: queueError } = await supabaseAdmin
      .from('commissions')
      .select('id, client_note')
      .neq('status', 'done')
      .order('created_at', { ascending: true });

    if (queueError) throw queueError;

    // Fetch the specific order (active or history)
    let query = supabaseAdmin
      .from('commissions')
      .select(`
        id, status, created_at, client_email, client_name, 
        commission_type, art_style, description, reference_images, 
        rough_sketch_url, wip_artwork_url, final_artwork_url, final_preview_url,
        sketch_status, wip_status, final_status, dp_status, 
        payment_75_status, payment_100_status,
        payment_75_proof_url, payment_100_proof_url,
        dp_proof_url,
        wip_feedback, final_feedback,
        client_note, sketch_revision_images,
        price, is_couple, has_background, payment_method
      `);

    if (orderId) {
      // SECURITY: If searching by ID, it MUST belong to the logged-in user
      query = query.eq('id', orderId).eq('client_email', user?.email);
    } else if (email) {
      query = query.eq('client_email', email).order('created_at', { ascending: false });
    }

    const { data: orderData, error: orderError } = await query;

    if (orderError) {
        console.error('[Track API] Database error:', orderError);
        throw orderError;
    }

    if (!orderData || (Array.isArray(orderData) && orderData.length === 0)) {
        return NextResponse.json({ active: false, orders: [] });
    }

    const orders = (Array.isArray(orderData) ? orderData : [orderData]).filter(o => 
      o.client_note?.includes('[ARCHIVED_AT:') ? false : !o.client_note?.includes('[PURGED_AT:')
    );
    
    // Filter queue to exclude any that might be archived or purged but not done
    const activeInQueue = allActive?.filter(o => 
      !o.client_note?.includes('[ARCHIVED_AT:') && 
      !o.client_note?.includes('[PURGED_AT:')
    ) || [];

    const transformedOrders = await Promise.all(orders.map(async (order) => {
      const isDone = order.status === 'done';
      const queuePos = isDone ? 0 : (activeInQueue.findIndex(c => c.id === order.id) + 1 || 0);
      
      // Secure Signed URLs for all possible image/file fields
      return {
        ...order,
        reference_images: await getSignedUrlsBatch((order as any).reference_images),
        rough_sketch_url: await getSignedUrlIfNeeded(order.rough_sketch_url),
        dp_proof_url: await getSignedUrlIfNeeded(order.dp_proof_url),
        wip_artwork_url: await getSignedUrlIfNeeded(order.wip_artwork_url),
        final_artwork_url: await getSignedUrlIfNeeded(order.final_artwork_url),
        final_preview_url: await getSignedUrlIfNeeded(order.final_preview_url),
        payment_75_proof_url: await getSignedUrlIfNeeded(order.payment_75_proof_url),
        payment_100_proof_url: await getSignedUrlIfNeeded(order.payment_100_proof_url),
        
        // Metadata
        queuePosition: queuePos,
        totalQueue: allActive?.length || 0
      };
    }));

    return NextResponse.json({ 
      active: transformedOrders.some(o => o.status !== 'done'),
      orders: transformedOrders
    });
  } catch (error: any) {
    console.error('Track Status API Error:', error);
    return NextResponse.json({ 
      active: false, 
      orders: [], 
      error: error.message || 'Internal Server Error'
    }, { status: 500 });
  }
}
