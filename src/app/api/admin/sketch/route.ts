import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSignedUrlIfNeeded, getSignedUrlsBatch, transformCommission } from '@/utils/storage';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // REDUNDANT AUTH CHECK
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
    const { id, sketchBase64 } = body;

    if (!id || !sketchBase64) {
      return NextResponse.json({ success: false, error: 'Missing ID or sketch data' }, { status: 400 });
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
    const match = sketchBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid image format' }, { status: 400 });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const extension = contentType.split('/')[1];
    const fileName = `sketch-${id}-${Date.now()}.${extension}`;
    const filePath = `sketches/${fileName}`;

    const { error: uploadError } = await supabaseAdmin.storage
      .from('portfolio')
      .upload(filePath, Buffer.from(base64Data, 'base64'), {
        contentType,
        upsert: true
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      return NextResponse.json({ success: false, error: uploadError.message }, { status: 500 });
    }

    // 3. Update DB with PATH instead of Public URL
    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update({
        rough_sketch_url: filePath,
        sketch_status: 'sent'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 4. Send Email Notification to Client
    try {
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      // Pass order id in URL or just direct to track/main page
      const actionUrl = `${siteUrl}?openMessages=true`;

      const emailStyles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
          @media only screen and (max-width: 600px) {
            .container { padding: 20px 10px !important; }
            .card { border-radius: 24px !important; }
            .header { padding: 32px 24px !important; }
            .content { padding: 32px 24px !important; }
            .button { width: 100% !important; padding: 18px 20px !important; box-sizing: border-box !important; }
            .headline { font-size: 26px !important; }
          }
        </style>
      `;

      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: commission.client_email,
        subject: "🎨 Your Rough Sketch is Ready for Review!",
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              ${emailStyles}
            </head>
            <body style="margin: 0; padding: 0; background-color: #FDFCFE;">
              <div class="container" style="font-family: 'Inter', sans-serif; padding: 40px 20px;">
                <div class="card" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(168,85,247,0.1); border: 1px solid #F3E8FF;">
                  <div class="header" style="background: linear-gradient(135deg, #9333EA 0%, #D8B4FE 100%); padding: 48px 40px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0;">Moonchaery Studio</p>
                    <h1 class="headline" style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">Sketch Ready!</h1>
                  </div>
                  <div class="content" style="padding: 48px 40px; text-align: center;">
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                      Hi <strong>${commission.client_name}</strong>,<br><br>
                      I have completed the rough sketch for your commission! Please review it to make sure the pose, composition, and overall vibe are correct before I proceed to the final rendering.
                    </p>
                    
                    <div style="margin: 32px 0; padding: 24px; background: #FDF4FF; border-radius: 24px; border: 1px dashed #D8B4FE;">
                       <p style="margin: 0; font-size: 14px; font-weight: 600; color: #581C87;">Please note: A 50% Down Payment (DP) is required to proceed after accepting the sketch.</p>
                    </div>

                    <div style="margin-top: 32px;">
                      <a href="${actionUrl}" class="button" style="display: inline-block; background: #1A1F2B; color: white; padding: 18px 40px; border-radius: 18px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        Review Sketch & Upload DP
                      </a>
                    </div>
                    <p style="color: #6B7280; font-size: 12px; margin-top: 24px;">Click the button above and check the <strong>Message Icon</strong> in the top navigation bar of our website.</p>

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
      console.error('Failed to send sketch email', emailErr);
    }

    // 5. Transform for UI (Signed URLs)
    const finalData = await transformCommission(updatedRecord);

    return NextResponse.json({ success: true, data: finalData });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
