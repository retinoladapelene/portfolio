import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';

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
            cookiesToSet.forEach(({ name, value, options }: { name: string, value: string, options: CookieOptions }) => 
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  );
  
  const { data: { user } } = await supabaseAuth.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const { id } = await request.json();
    if (!id) return NextResponse.json({ error: 'Missing ID' }, { status: 400 });

    // Verify ownership
    const { data: commission } = await supabaseAdmin
      .from('commissions')
      .select('client_email')
      .eq('id', id)
      .single();

    if (!commission || commission.client_email !== user.email) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date().toISOString();
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .update({ downloaded_at: now })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      if (error.code === '42703') {
        console.warn('[Track Download] downloaded_at column is missing in Supabase. Skipping download tracking.');
        return NextResponse.json({ 
          success: true, 
          warning: 'downloaded_at column is missing in Supabase. Please add it to your database.' 
        });
      }
      throw error;
    }

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
