import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSignedUrlIfNeeded } from '@/utils/storage';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, dpBase64 } = body;

    if (!id || !dpBase64) {
      return NextResponse.json({ success: false, error: 'Missing ID or DP data' }, { status: 400 });
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
    const match = dpBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid image format' }, { status: 400 });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const extension = contentType.split('/')[1];
    const fileName = `dp-proof-${id}-${Date.now()}.${extension}`;
    const filePath = `payments/${fileName}`;

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
        dp_proof_url: filePath,
        dp_status: 'paid'
      })
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 4. Send Email Notification to Admin
    try {
      const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',');
      const adminEmail = allowedEmails[0]; // Send to the primary admin

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

      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
      const actionUrl = `${siteUrl}/admin`;

      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: adminEmail,
        subject: `💰 DP Proof Received from ${commission.client_name}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              ${emailStyles}
            </head>
            <body style="margin: 0; padding: 0; background-color: #FDFCFE;">
              <div class="container" style="font-family: 'Inter', sans-serif; padding: 40px 20px;">
                <div class="card" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(16,185,129,0.1); border: 1px solid #D1FAE5;">
                  <div class="header" style="background: linear-gradient(135deg, #10B981 0%, #6EE7B7 100%); padding: 48px 40px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.8); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0;">Moonchaery Studio Admin</p>
                    <h1 class="headline" style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">DP Payment Uploaded</h1>
                  </div>
                  <div class="content" style="padding: 48px 40px; text-align: center;">
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                      <strong>${commission.client_name}</strong> has just uploaded their 50% Down Payment proof.
                    </p>

                    <div style="margin-top: 32px;">
                      <a href="${actionUrl}" class="button" style="display: inline-block; background: #1A1F2B; color: white; padding: 18px 40px; border-radius: 18px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        Check Dashboard
                      </a>
                    </div>

                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send DP admin email', emailErr);
    }

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
