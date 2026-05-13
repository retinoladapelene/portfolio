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
    const { id, previewBase64 } = await request.json();
    if (!id || !previewBase64) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const match = previewBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) return NextResponse.json({ error: 'Invalid image' }, { status: 400 });

    const contentType = match[1];
    const base64Data = match[2];
    const fileName = `preview-${id}-${Date.now()}.${contentType.split('/')[1]}`;
    const filePath = `sketches/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('portfolio')
      .upload(filePath, Buffer.from(base64Data, 'base64'), { contentType, upsert: true });

    if (uploadError) throw uploadError;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update({ 
        final_preview_url: filePath, 
        final_status: 'sent',
        final_feedback: null
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    const { transformCommission } = await import('@/utils/storage');
    const finalData = await transformCommission(updated);

    // Send notification email to client
    try {
      const resend = new (await import('resend')).Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: updated.client_email,
        subject: `✨ Final Preview: Your ${updated.commission_type} is Ready for Review!`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <style>
                @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
              </style>
            </head>
            <body style="margin: 0; padding: 0; background-color: #FDFCFE;">
              <div style="font-family: 'Inter', sans-serif; padding: 40px 20px;">
                <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(168,85,247,0.1); border: 1px solid #F3E8FF;">
                  <div style="background: linear-gradient(135deg, #059669 0%, #34D399 100%); padding: 48px 40px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0;">Moonchaery Studio</p>
                    <h1 style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">Final Review!</h1>
                  </div>
                  <div style="padding: 48px 40px; text-align: center;">
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                      Hi <strong>${updated.client_name}</strong>,<br><br>
                      Great news! The final version of your <strong>${updated.commission_type}</strong> is now ready for your review. 
                      I'm excited to hear what you think of the finished piece!
                    </p>
                    <div style="margin-top: 32px;">
                      <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}?openMessages=true" style="display: inline-block; background: #1A1F2B; color: white; padding: 18px 40px; border-radius: 18px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        Review Final Artwork
                      </a>
                    </div>
                    <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #F3F4F6;">
                      <p style="color: #9CA3AF; font-size: 12px; margin: 0;">Stay inspired,<br>Moonchaery Studio</p>
                    </div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send Final Preview notification email:', emailErr);
    }

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
