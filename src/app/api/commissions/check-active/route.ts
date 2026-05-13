import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSignedUrlIfNeeded, getSignedUrlsBatch } from '@/utils/storage';
import { rateLimit } from '@/utils/rate-limit';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
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
      query = query.eq('id', orderId);
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
