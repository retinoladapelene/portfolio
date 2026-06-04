import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

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
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, imageBase64 } = body;

    if (!id || !imageBase64) {
      return NextResponse.json({ success: false, error: 'Missing ID or image data' }, { status: 400 });
    }

    // 1. Fetch commission info
    const { data: commission, error: fetchError } = await supabaseAdmin
      .from('commissions')
      .select('client_name, client_email')
      .eq('id', id)
      .single();

    if (fetchError || !commission) {
      return NextResponse.json({ success: false, error: 'Commission not found' }, { status: 404 });
    }

    // 2. Upload to Supabase Storage
    const match = imageBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid image format' }, { status: 400 });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const extension = contentType.split('/')[1];
    const fileName = `final-${id}-${Date.now()}.${extension}`;
    const filePath = `results/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('portfolio')
      .upload(filePath, Buffer.from(base64Data, 'base64'), {
        contentType,
        upsert: true
      });

    if (uploadError) {
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    // 3. Update DB
    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update({
        final_artwork_url: filePath,
        status: 'done'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 4. Send Email Notification
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: commission.client_email,
        subject: "✨ Your Commission is Finished!",
        html: `
          <div style="font-family: sans-serif; padding: 20px; color: #333;">
            <h1 style="color: #9333EA;">Success!</h1>
            <p>Hi ${commission.client_name}, your artwork is ready!</p>
            <p>You can view and download the high-quality file on the tracking page:</p>
            <a href="${siteUrl}/track?orderId=${id}" style="display: inline-block; padding: 12px 24px; background: #9333EA; color: white; text-decoration: none; border-radius: 8px;">View & Download Artwork</a>
          </div>
        `
      });
    } catch (e) { console.error('Email error:', e); }

    // 5. Transform for UI (Signed URLs)
    const { getSignedUrlIfNeeded } = await import('@/utils/storage');
    const finalData = {
      ...updatedRecord,
      final_artwork_url: await getSignedUrlIfNeeded(updatedRecord.final_artwork_url)
    };

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
