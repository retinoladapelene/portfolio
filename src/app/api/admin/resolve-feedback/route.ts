import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

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
  if (!user || !allowedEmails.includes(user.email!)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, stage } = await request.json();
    if (!id || !stage) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const updateData: any = {};
    if (stage === 'sketch') {
      updateData.sketch_status = 'sent';
      updateData.client_note = null;
    } else if (stage === 'wip') {
      updateData.wip_status = 'sent';
      updateData.wip_feedback = null;
    } else if (stage === 'final') {
      updateData.final_status = 'sent';
      updateData.final_feedback = null;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    const { transformCommission } = await import('@/utils/storage');
    const finalData = await transformCommission(updated);

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
