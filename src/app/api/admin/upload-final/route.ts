import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { transformCommission } from '@/utils/storage';
import { createServerClient } from '@supabase/ssr';
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
    const { id, artworkBase64 } = await request.json();
    if (!id || !artworkBase64) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const match = artworkBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) return NextResponse.json({ error: 'Invalid image format' }, { status: 400 });

    const contentType = match[1];
    const base64Data = match[2];
    const extension = contentType.split('/')[1];
    const fileName = `final-artwork-${id}-${Date.now()}.${extension}`;
    const buffer = Buffer.from(base64Data, 'base64');

    const { data: uploadData, error: uploadError } = await supabaseAdmin.storage
      .from('portfolio')
      .upload(`results/${fileName}`, buffer, {
        contentType,
        upsert: true
      });

    if (uploadError) throw uploadError;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update({ 
        final_artwork_url: uploadData.path,
        status: 'done'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    const transformed = await transformCommission(updated);
    return NextResponse.json({ success: true, data: transformed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
