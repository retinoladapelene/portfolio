import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
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
            cookiesToSet.forEach(({ name, value, options }: { name: string, value: string, options: CookieOptions }) => 
              cookieStore.set(name, value, options)
            )
          } catch {}
        },
      },
    }
  );

  const { data: { user } } = await supabaseAuth.auth.getUser();

  if (!user) {
    return NextResponse.json({ success: false, error: 'Authentication required' }, { status: 401 });
  }

  try {
    const { id, note, images, stage = 'sketch' } = await request.json();

    if (!id || (!note && (!images || images.length === 0))) {
      return NextResponse.json({ success: false, error: 'Missing ID or revision content' }, { status: 400 });
    }

    // Process images if any
    const uploadedPaths: string[] = [];
    if (images && images.length > 0) {
      for (let i = 0; i < images.length; i++) {
        const img = images[i];
        const match = img.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (!match) continue;

        const contentType = match[1];
        const base64Data = match[2];
        const extension = contentType.split('/')[1];
        const fileName = `rev-${stage}-${id}-${Date.now()}-${i}.${extension}`;
        const filePath = `revisions/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('portfolio')
          .upload(filePath, Buffer.from(base64Data, 'base64'), {
            contentType,
            upsert: true
          });

        if (!uploadError) {
          uploadedPaths.push(filePath);
        }
      }
    }

    // Update the database based on stage
    const updateData: any = {};
    let stageName = "Rough Sketch";
    if (stage === 'wip') {
      updateData.wip_status = 'revision';
      updateData.wip_feedback = note;
      stageName = "Mid-Production (WIP)";
    } else if (stage === 'final') {
      updateData.final_status = 'revision';
      updateData.final_feedback = note;
      stageName = "Final Preview";
    } else {
      updateData.sketch_status = 'revision';
      updateData.client_note = note;
      updateData.sketch_revision_images = uploadedPaths;
    }

    const { data, error } = await supabaseAdmin
      .from('commissions')
      .update(updateData)
      .eq('id', id)
      .eq('client_email', user.email) // CRITICAL SECURITY CHECK
      .select('client_name, client_email, commission_type')
      .single();

    if (error) {
      console.error('DB Update Error:', error);
      throw error;
    }

    // Send email to admin
    try {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin`;
      
      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL || 'pbsn290704@gmail.com',
        subject: `📝 ${stage.toUpperCase()} Feedback from ${data.client_name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #E9D5FF; border-radius: 24px; background: #FAF5FF;">
            <h2 style="color: #7E22CE;">New Feedback Received</h2>
            <p><strong>${data.client_name}</strong> has provided feedback on the <strong>${stageName}</strong> stage for their <strong>${data.commission_type}</strong>.</p>
            <div style="background: white; padding: 20px; border-radius: 16px; border: 1px solid #E9D5FF; margin: 20px 0;">
              <p style="margin: 0; color: #4B5563; font-style: italic;">"${note || 'No text provided'}"</p>
            </div>
            ${uploadedPaths.length > 0 ? `<p style="font-size: 12px; color: #6B7280;">${uploadedPaths.length} reference images were attached.</p>` : ''}
            <a href="${dashboardUrl}" style="display: inline-block; background: #7E22CE; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 10px;">Open Admin Dashboard</a>
          </div>
        `
      });
    } catch (emailError) {
      console.error('Failed to send admin notification:', emailError);
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Revision Note API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
