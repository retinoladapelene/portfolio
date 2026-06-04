import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

// GET: Fetch settings
export async function GET() {
  try {
    const { data, error } = await supabaseAdmin
      .from('studio_settings')
      .select('*')
      .single();

    if (error) {
      if (error.code === '42P01') {
        // Table not found
        return NextResponse.json({ success: true, data: { commissions_open: true } });
      }
      if (error.code === 'PGRST116') {
        // No rows found
        return NextResponse.json({ success: true, data: { commissions_open: true } });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/Settings] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// POST: Update settings (Admin only)
export async function POST(request: Request) {
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
  
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // We assume there's only one row for settings
    const { data, error } = await supabaseAdmin
      .from('studio_settings')
      .upsert({ id: body.id || undefined, ...body })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/Settings] POST Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message,
      details: error
    }, { status: 500 });
  }
}
