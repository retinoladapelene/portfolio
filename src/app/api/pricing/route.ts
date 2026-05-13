import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET: Fetch all pricing configuration
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('pricing_config')
      .select('*')
      .order('order_index', { ascending: true });

    if (error) {
      // If table doesn't exist yet, return empty array to prevent crash
      if (error.code === '42P01') {
        console.warn('[API/Pricing] Table "pricing_config" not found. Using defaults.');
        return NextResponse.json({ success: true, data: [] });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/Pricing] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Upsert pricing config (Admin only)
export async function POST(request: Request) {
  // 1. Auth Check
  const cookieStore = await cookies();
  const supabaseAuth = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',');
  
  if (!user || !allowedEmails.includes(user.email!)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    // Expecting array of configs or a single config
    const configs = Array.isArray(body) ? body : [body];

    const { data, error } = await supabaseAdmin
      .from('pricing_config')
      .upsert(configs, { onConflict: 'key' })
      .select();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/Pricing] POST Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
