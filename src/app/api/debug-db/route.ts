import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

export async function GET() {
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
  const allowedEmails = ['pbsn290704@gmail.com'];
  if (!user || !allowedEmails.includes(user.email!)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin.rpc('get_enum_values', { enum_name: 'commission_status' });
    
    // If RPC fails, try raw SQL via a trick (selecting from pg_enum)
    if (error) {
      const { data: enumData, error: enumError } = await supabaseAdmin
        .from('pg_enum')
        .select(`
          enumlabel,
          pg_type!inner(typname)
        `)
        .eq('pg_type.typname', 'commission_status');
      
      if (enumError) throw enumError;
      return NextResponse.json({ success: true, values: enumData.map(e => e.enumlabel) });
    }

    return NextResponse.json({ success: true, values: data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
