import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { id, paymentBase64, stage } = body; // stage: '75' or '100'

    if (!id || !paymentBase64 || !stage) {
      return NextResponse.json({ success: false, error: 'Missing required data' }, { status: 400 });
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
    const match = paymentBase64.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
    if (!match) {
      return NextResponse.json({ success: false, error: 'Invalid image format' }, { status: 400 });
    }

    const contentType = match[1];
    const base64Data = match[2];
    const extension = contentType.split('/')[1];
    const fileName = `payment-${stage}-${id}-${Date.now()}.${extension}`;
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

    // 3. Update DB
    const updateData: any = {};
    if (stage === '75') {
      updateData.payment_75_proof_url = filePath;
      updateData.payment_75_status = 'paid';
    } else if (stage === '100') {
      updateData.payment_100_proof_url = filePath;
      updateData.payment_100_status = 'paid';
    }

    const { data: updatedRecord, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (updateError) {
      return NextResponse.json({ success: false, error: updateError.message }, { status: 500 });
    }

    // 4. Send Email Notification to Admin
    try {
      const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',');
      const adminEmail = allowedEmails[0];

      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: adminEmail,
        subject: `💰 ${stage}% Payment Proof Received from ${commission.client_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #10B981; border-radius: 24px; background: #ECFDF5;">
            <h2 style="color: #10B981;">${stage}% Payment Uploaded</h2>
            <p><strong>${commission.client_name}</strong> has just uploaded their ${stage}% progress payment proof.</p>
            <p>Please check the admin dashboard to verify and proceed.</p>
            <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" style="display: inline-block; background: #10B981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Go to Admin Dashboard</a>
          </div>
        `
      });
    } catch (emailErr) {
      console.error('Failed to send admin payment email', emailErr);
    }

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
