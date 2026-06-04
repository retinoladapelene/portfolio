import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { transformCommission } from '@/utils/storage';
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
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { id, stage, isApproved, reason } = await request.json();
    if (!id || !stage) return NextResponse.json({ error: 'Missing data' }, { status: 400 });

    const updates: any = {};
    const statusValue = isApproved ? 'APPROVED' : 'REJECTED';

    if (stage === 'dp') updates.dp_status = statusValue;
    else if (stage === '75') updates.payment_75_status = statusValue;
    else if (stage === '100') updates.payment_100_status = statusValue;

    const { data: updated, error: updateError } = await supabaseAdmin
      .from('commissions')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (updateError) throw updateError;

    // TRANSFORM: Generate Signed URLs for the updated record before returning
    const transformed = await transformCommission(updated);

    // Send notification email to client
    try {
      const resend = new (await import('resend')).Resend(process.env.RESEND_API_KEY);
      const stageName = stage === 'dp' ? '50% Down Payment' : stage === '75' ? '75% Progress Payment' : '100% Final Payment';
      
      if (!isApproved) {
        await resend.emails.send({
          from: 'Moonchaery Studio <onboarding@resend.dev>',
          to: updated.client_email,
          subject: `❌ Action Required: Payment Verification for ${updated.commission_type}`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #FEE2E2; border-radius: 24px; background: #FFFBFB;">
              <h2 style="color: #DC2626;">Payment Verification Required</h2>
              <p>Hi ${updated.client_name},</p>
              <p>The verification for your <strong>${stageName}</strong> has been declined.</p>
              <div style="background: #FEF2F2; padding: 15px; border-radius: 12px; border-left: 4px solid #DC2626; margin: 20px 0;">
                <p style="margin: 0; color: #991B1B;"><strong>Reason:</strong> ${reason || 'Invalid or unclear proof of transfer. Please ensure the screenshot clearly shows the recipient, amount, and reference ID.'}</p>
              </div>
              <p>Please log in to the website and re-upload a clear proof of transfer to proceed with your commission.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" style="display: inline-block; background: #DC2626; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Re-upload Proof</a>
            </div>
          `
        });
      } else {
        // Approval Email
        await resend.emails.send({
          from: 'Moonchaery Studio <onboarding@resend.dev>',
          to: updated.client_email,
          subject: `✅ Payment Verified: ${stageName} Received!`,
          html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ECFDF5; border-radius: 24px; background: #F9FAF9;">
              <h2 style="color: #059669;">Payment Successfully Verified</h2>
              <p>Hi ${updated.client_name},</p>
              <p>Great news! Your <strong>${stageName}</strong> has been successfully verified.</p>
              <p>The production of your <strong>${updated.commission_type}</strong> is now moving forward. You can track the progress and see any new updates on your dashboard.</p>
              <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}" style="display: inline-block; background: #1A1F2B; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Go to My Dashboard</a>
              <p style="color: #6B7280; font-size: 12px; margin-top: 20px;">Stay inspired,<br>Moonchaery Studio</p>
            </div>
          `
        });
      }
    } catch (emailErr) {
      console.error('Failed to send notification email:', emailErr);
    }

    return NextResponse.json({ success: true, data: transformed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
