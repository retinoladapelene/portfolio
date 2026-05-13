import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { getSignedUrlIfNeeded, getSignedUrlsBatch, transformCommission } from '@/utils/storage';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { Resend } from 'resend';
import { rateLimit } from '@/utils/rate-limit';

const resend = new Resend(process.env.RESEND_API_KEY);

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // 0. Rate Limiting (Prevent Spam: 5 submissions per 15 minutes)
  const ip = request.headers.get('x-forwarded-for') || 'anonymous';
  const limiter = rateLimit(ip, 5, 15 * 60 * 1000);
  
  if (!limiter.success) {
    return NextResponse.json({ 
      success: false, 
      error: 'Too many requests. Please slow down and try again later.' 
    }, { status: 429 });
  }

  try {
    const body = await request.json();
    
    const { 
      name, 
      email, 
      paymentMethod, 
      commissionType, 
      artStyle, 
      background, 
      description,
      references,
      price,
      isCouple,
      hasBackground,
      socialHandle,
      referenceImages
    } = body;
    const cleanEmail = email.toLowerCase().trim();

    // 0. Check if commissions are open
    const { data: settings, error: settingsError } = await supabaseAdmin
      .from('studio_settings')
      .select('commissions_open')
      .single();

    if (!settingsError && settings && !settings.commissions_open) {
      return NextResponse.json(
        { success: false, error: "Commissions are currently resting. Please check back later." },
        { status: 403 }
      );
    }
    
    // 1. Fetch ALL commissions for this email using admin privileges (Case-Insensitive)
    const { data: allComms, error: fetchError } = await supabaseAdmin
      .from('commissions')
      .select('id, status, client_email')
      .ilike('client_email', cleanEmail);

    if (fetchError) {
      console.error('[API] Check Error:', fetchError);
    }

    // 2. Manually filter for active ones in JS (pending, accepted, or in_progress)
    const activeComm = allComms?.find(c => {
      const s = c.status.toLowerCase();
      return s === 'pending' || s === 'accepted' || s === 'in_progress';
    });

    if (activeComm) {
      return NextResponse.json(
        { success: false, error: "System detected an active commission already in progress." },
        { status: 400 }
      );
    }


    // 3. Upload reference images to storage if any
    const uploadedImageUrls: string[] = [];
    if (referenceImages && referenceImages.length > 0) {
      for (let i = 0; i < referenceImages.length; i++) {
        const img = referenceImages[i];
        const match = img.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
        if (!match) continue;
        
        const contentType = match[1];
        const base64Data = match[2];
        const extension = contentType.split('/')[1];
        const fileName = `ref-${Date.now()}-${i}.${extension}`;
        const filePath = `references/${fileName}`;

        const { error: uploadError } = await supabaseAdmin.storage
          .from('portfolio')
          .upload(filePath, Buffer.from(base64Data, 'base64'), {
            contentType,
            upsert: true
          });

        if (!uploadError) {
          // STORE PATH INSTEAD OF PUBLIC URL
          uploadedImageUrls.push(filePath);
        } else {
          console.error(`[API] Upload error for image ${i}:`, uploadError);
        }
      }
    }

    const { data: insertedData, error } = await supabaseAdmin
      .from('commissions')
      .insert([
        { 
          client_name: name, 
          client_email: cleanEmail, 
          payment_method: paymentMethod, 
          commission_type: commissionType, 
          art_style: artStyle, 
          background_req: background, 
          description: description,
          references: references,
          price: price,
          status: 'pending',
          is_couple: isCouple,
          has_background: hasBackground,
          social_media: socialHandle,
          reference_images: uploadedImageUrls
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase Insert Error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    const orderId = insertedData.id;

    // Process attachments for Resend
    const attachments = (referenceImages || []).map((img: string, index: number) => {
      // Extract base64 and content type
      const match = img.match(/^data:(image\/[a-zA-Z]+);base64,(.+)$/);
      if (!match) return null;
      const contentType = match[1];
      const extension = contentType.split('/')[1];
      
      return {
        filename: `ref-${index + 1}.${extension}`,
        content: Buffer.from(match[2], 'base64'),
        cid: `ref_img_${index}`,
        disposition: 'inline'
      };
    }).filter(Boolean);

    // --- COMMON RESPONSIVE STYLES ---
    const emailStyles = `
      <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
        @media only screen and (max-width: 600px) {
          .container { padding: 20px 10px !important; }
          .card { border-radius: 24px !important; }
          .header { padding: 32px 24px !important; }
          .content { padding: 32px 24px !important; }
          .gallery-item { width: 100% !important; margin-right: 0 !important; margin-bottom: 16px !important; height: 200px !important; }
          .stat-table td { display: block !important; width: 100% !important; padding-bottom: 20px !important; }
          .button { width: 100% !important; padding: 18px 20px !important; box-sizing: border-box !important; }
          .headline { font-size: 26px !important; }
        }
      </style>
    `;

    // Send Admin Email Notification
    try {
      const dashboardUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin`;
      
      await resend.emails.send({
        from: 'Artist Portfolio <onboarding@resend.dev>',
        to: process.env.ADMIN_EMAIL || 'pbsn290704@gmail.com',
        subject: `🎨 [Luxury Directive] New Commission from ${name}`,
        attachments: attachments as any,
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
                  <!-- Gradient Header -->
                  <div class="header" style="background: linear-gradient(135deg, #9333EA 0%, #A855F7 100%); padding: 48px 40px; text-align: center;">
                    <p style="color: rgba(255,255,255,0.7); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 16px 0;">New Artwork Directive</p>
                    <h1 class="headline" style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">New Commission Received</h1>
                  </div>

                  <!-- Content Area -->
                  <div class="content" style="padding: 40px;">
                    <!-- Client Profile -->
                    <div style="margin-bottom: 40px; text-align: center;">
                      <h2 style="color: #1A1F2B; font-size: 24px; font-weight: 700; margin: 0 0 4px 0;">${name}</h2>
                      <p style="color: #A855F7; font-size: 14px; font-weight: 600; margin: 0;">${email}</p>
                      <p style="color: #6D28D9; font-size: 13px; font-weight: 700; margin: 4px 0 0 0;">Handle: ${socialHandle || 'None'}</p>
                      <div style="display: inline-block; margin-top: 16px; padding: 6px 16px; background: #F3E8FF; border-radius: 100px; border: 1px solid #E9D5FF;">
                        <p style="color: #7E22CE; font-size: 10px; font-weight: 800; margin: 0; text-transform: uppercase; letter-spacing: 0.1em;">
                          Submitted: ${new Date().toLocaleString('en-US', { dateStyle: 'long', timeStyle: 'short' })}
                        </p>
                      </div>
                    </div>

                    <!-- Order Specifications -->
                    <div style="background: #FDF4FF; border-radius: 24px; padding: 32px; border: 1px solid #FAE8FF; margin-bottom: 40px;">
                      <table class="stat-table" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td style="padding-bottom: 24px;">
                            <p style="color: #A1A1AA; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Package Type</p>
                            <p style="color: #1A1F2B; font-size: 15px; font-weight: 700; margin: 0;">${commissionType}</p>
                          </td>
                          <td style="padding-bottom: 24px;">
                            <p style="color: #A1A1AA; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Art Style</p>
                            <p style="color: #1A1F2B; font-size: 15px; font-weight: 700; margin: 0;">${artStyle}</p>
                          </td>
                        </tr>
                        <tr>
                          <td>
                            <p style="color: #A1A1AA; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Estimated Price</p>
                            <p style="color: #9333EA; font-size: 20px; font-weight: 900; margin: 0;">${price}K <span style="font-size: 11px; font-weight: 500; color: #D8B4FE;">IDR</span></p>
                          </td>
                          <td>
                            <p style="color: #A1A1AA; font-size: 9px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; margin: 0 0 4px 0;">Payment Method</p>
                            <p style="color: #1A1F2B; font-size: 15px; font-weight: 700; margin: 0;">${paymentMethod || 'Not specified'}</p>
                          </td>
                        </tr>
                      </table>
                    </div>

                    <!-- Add-ons / Synergy Flags -->
                    <div style="margin-bottom: 40px;">
                       ${isCouple ? '<span style="display: inline-block; background: #9333EA; color: white; padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-right: 8px; margin-bottom: 8px;">Couple Synergy</span>' : ''}
                       ${hasBackground ? '<span style="display: inline-block; background: #D8B4FE; color: #581C87; padding: 6px 14px; border-radius: 100px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 8px;">Detailed BG</span>' : ''}
                    </div>

                    <!-- Vision Section -->
                    <div style="margin-bottom: 32px;">
                      <h3 style="color: #1A1F2B; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 16px 0; border-left: 3px solid #D8B4FE; padding-left: 12px;">Description & Vision</h3>
                      <div style="color: #4B5563; font-size: 14px; line-height: 1.7; background: #F9FAFB; padding: 24px; border-radius: 20px; border: 1px solid #F3F4F6;">
                        ${description || 'No description provided.'}
                      </div>
                    </div>

                    ${background ? `
                    <div style="margin-bottom: 32px;">
                      <h3 style="color: #1A1F2B; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 16px 0; border-left: 3px solid #D8B4FE; padding-left: 12px;">Background Details</h3>
                      <div style="color: #4B5563; font-size: 14px; line-height: 1.7; background: #F9FAFB; padding: 24px; border-radius: 20px; border: 1px solid #F3F4F6;">
                        ${background}
                      </div>
                    </div>` : ''}

                    ${references ? `
                    <div style="margin-bottom: 40px;">
                      <h3 style="color: #1A1F2B; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 16px 0; border-left: 3px solid #D8B4FE; padding-left: 12px;">Reference Links</h3>
                      <div style="background: #F9FAFB; padding: 16px; border-radius: 12px; border: 1px solid #F3F4F6; word-break: break-all;">
                        <a href="${references.startsWith('http') ? references : `https://${references}`}" style="color: #9333EA; text-decoration: none; font-size: 13px; font-weight: 600;">${references}</a>
                      </div>
                    </div>` : ''}

                    <!-- Visual References Gallery -->
                    ${attachments.length > 0 ? `
                    <div style="margin-bottom: 48px;">
                      <h3 style="color: #1A1F2B; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; margin: 0 0 20px 0; border-left: 3px solid #D8B4FE; padding-left: 12px;">Visual References</h3>
                      <div style="font-size: 0;">
                        ${attachments.map((att: any) => `
                          <div class="gallery-item" style="display: inline-block; width: 30%; margin-right: 3%; margin-bottom: 12px; vertical-align: top;">
                            <div style="border-radius: 16px; overflow: hidden; border: 1px solid #F3E8FF; background: #F9FAFB; height: 120px;">
                              <img src="cid:${att.cid}" style="width: 100%; height: 100%; object-fit: cover;" alt="Ref" />
                            </div>
                          </div>
                        `).join('')}
                      </div>
                    </div>` : ''}

                    <!-- Final Call to Action -->
                    <div style="text-align: center; margin-top: 24px;">
                      <a href="${dashboardUrl}" class="button"
                         style="display: inline-block; background: #1A1F2B; color: white; padding: 18px 48px; border-radius: 18px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.25em; text-decoration: none; box-shadow: 0 10px 30px rgba(168,85,247,0.2);">
                        Access Admin Studio
                      </a>
                    </div>
                  </div>

                  <!-- Footer -->
                  <div style="padding: 40px; border-top: 1px solid #F3F4F6; text-align: center; background: #FAFAFA;">
                    <p style="color: #9CA3AF; font-size: 10px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.15em;">
                      © 2026 Artist Portfolio Studio • Luxury Lilac Editorial Engine
                    </p>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
    }

    // --- CLIENT RECEIPT NOTIFICATION ---
    try {
      // Calculate total active queue count
      const { count: activeQueueCount } = await supabaseAdmin
        .from('commissions')
        .select('*', { count: 'exact', head: true })
        .in('status', ['pending', 'accepted', 'in_progress']);
        
      const trackUrl = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/track`;

      await resend.emails.send({
        from: 'Moonchaery Studio <onboarding@resend.dev>',
        to: email,
        subject: "✨ We've received your Commission Request!",
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
                    <h1 class="headline" style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">Canvas Received!</h1>
                  </div>
                  <div class="content" style="padding: 48px 40px; text-align: center;">
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                      Hi <strong>${name}</strong>,<br><br>
                      Thank you for sharing your vision with me! I have received your commission request for a <strong>${commissionType}</strong>. 
                      I will review the details and contact you very soon with the next steps.
                    </p>
                    
                    <div style="margin: 32px 0; padding: 24px; background: #FDF4FF; border-radius: 24px; border: 1px dashed #D8B4FE;">
                       <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 900; color: #9333EA; text-transform: uppercase; letter-spacing: 0.2em;">Order Identification</p>
                       <p style="margin: 0; font-size: 16px; font-weight: 800; color: #581C87; word-break: break-all;">${orderId}</p>
                       <p style="margin: 8px 0 0 0; font-size: 9px; color: #A855F7;">Please keep this ID safe to track your order progress.</p>
                    </div>

                    <div style="margin: 32px 0; padding: 24px; background: #F9FAFB; border-radius: 24px; border: 1px solid #F3F4F6;">
                       <p style="margin: 0 0 8px 0; font-size: 10px; font-weight: 900; color: #6B7280; text-transform: uppercase; letter-spacing: 0.2em;">Current Position</p>
                       <p style="margin: 0; font-size: 24px; font-weight: 800; color: #1A1F2B;">Queue #${activeQueueCount || 1}</p>
                    </div>

                    <div style="margin-top: 32px;">
                      <a href="${trackUrl}" class="button" style="display: inline-block; background: #1A1F2B; color: white; padding: 18px 40px; border-radius: 18px; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.2em; text-decoration: none; box-shadow: 0 10px 25px rgba(0,0,0,0.1);">
                        Track My Order
                      </a>
                    </div>

                    <div style="margin-top: 48px; border-top: 1px solid #F3F4F6; padding-top: 32px;">
                      <p style="margin: 0 0 20px 0; font-size: 10px; font-weight: 900; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.2em;">Open Discussion</p>
                      <table class="button-group" width="100%" cellpadding="0" cellspacing="0">
                        <tr>
                          <td align="center" style="padding: 0 10px;">
                            <a href="https://ig.me/m/cuancapital.id" class="button" style="display: inline-block; background: #9333EA; color: white; padding: 14px 20px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                              Instagram DM
                            </a>
                          </td>
                          <td align="center" style="padding: 0 10px;">
                            <a href="https://x.com/Zarry_linilo" class="button" style="display: inline-block; background: #1A1F2B; color: white; padding: 14px 20px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                              X / Twitter
                            </a>
                          </td>
                        </tr>
                      </table>
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
    } catch (clientEmailError) {
      console.error('Client receipt email failed:', clientEmailError);
    }

    return NextResponse.json({ success: true, data: insertedData, id: orderId });
  } catch (error: any) {
    console.error('API Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // REDUNDANT AUTH CHECK (Defense in depth)
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
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // TRANSFORM: Generate Signed URLs for private assets
    const transformedData = await Promise.all(data.map(async (commission: any) => {
      return await transformCommission(commission);
    }));

    return NextResponse.json({ success: true, data: transformedData });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
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
    const { id, status } = body;
    
    if (!id || !status) {
      return NextResponse.json({ success: false, error: 'Missing ID or status' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin client offline' }, { status: 500 });
    }

    // Fetch current record to strip archive tag if exists
    const { data: currentRecord } = await supabaseAdmin
      .from('commissions')
      .select('client_note')
      .eq('id', id)
      .single();

    let newNote = currentRecord?.client_note || "";
    if (newNote.includes('[ARCHIVED_AT:')) {
      newNote = newNote.replace(/\n?\[ARCHIVED_AT:.+?\]/, '').trim();
    }

    const { data, error } = await supabaseAdmin
      .from('commissions')
      .update({ 
        status,
        client_note: newNote
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('[Supabase Error]', error);
      return NextResponse.json({ 
        success: false, 
        error: error.message || "Database rejected update",
        code: error.code
      }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    const updatedRecord = data[0];

    // --- CLIENT NOTIFICATION LOGIC ---
    try {
      const clientEmail = updatedRecord.client_email;
      const clientName = updatedRecord.client_name;
      
      let subject = "";
      let headline = "";
      let message = "";
      let accentColor = "#9333EA";

      const emailStyles = `
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
          @media only screen and (max-width: 600px) {
            .container { padding: 20px 10px !important; }
            .card { border-radius: 24px !important; }
            .header { padding: 32px 24px !important; }
            .content { padding: 32px 24px !important; }
            .status-badge { width: 100% !important; padding: 16px 20px !important; box-sizing: border-box !important; }
            .headline { font-size: 26px !important; }
          }
        </style>
      `;

      switch (status) {
        case 'accepted':
          subject = "🎨 Your Commission Request has been Accepted!";
          headline = "Vision Accepted";
          message = "Great news! I've reviewed your vision and decided to take on your project. I'm excited to bring this masterpiece to life!";
          break;
        case 'in_progress':
          subject = "🖌️ Your Masterpiece is Now Underway";
          headline = "Artist at Work";
          message = "The magic is happening! I have officially started working on your artwork. Stay tuned for further updates.";
          accentColor = "#A855F7";
          break;
        case 'done':
          subject = "✨ Your Artwork is Ready!";
          headline = "Creation Complete";
          message = "The final touches are done. Your masterpiece is now complete and ready for you to enjoy!";
          accentColor = "#7C3AED";
          break;
      }

      if (subject) {
        await resend.emails.send({
          from: 'Moonchaery Studio <onboarding@resend.dev>',
          to: clientEmail,
          subject: subject,
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
                    <div class="header" style="background: linear-gradient(135deg, ${accentColor} 0%, #D8B4FE 100%); padding: 48px 40px; text-align: center;">
                      <p style="color: rgba(255,255,255,0.8); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0;">Moonchaery Studio Update</p>
                      <h1 class="headline" style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">${headline}</h1>
                    </div>
                    <div class="content" style="padding: 48px 40px; text-align: center;">
                      <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                        Hi <strong>${clientName}</strong>,<br><br>
                        ${message}
                      </p>
                      <div class="status-badge" style="display: inline-block; padding: 16px 32px; background: #FDF4FF; border: 1px solid #FAE8FF; border-radius: 100px; color: ${accentColor}; font-weight: 800; font-size: 11px; text-transform: uppercase; letter-spacing: 0.15em;">
                        Current Status: ${status.replace('_', ' ')}
                      </div>

                      <div style="margin-top: 48px; border-top: 1px solid #F3F4F6; padding-top: 32px;">
                        <p style="margin: 0 0 20px 0; font-size: 10px; font-weight: 900; color: #9CA3AF; text-transform: uppercase; letter-spacing: 0.2em;">Open Discussion</p>
                        <table class="button-group" width="100%" cellpadding="0" cellspacing="0">
                          <tr>
                            <td align="center" style="padding: 0 10px;">
                              <a href="https://ig.me/m/cuancapital.id" class="button" style="display: inline-block; background: #9333EA; color: white; padding: 14px 20px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                                Instagram DM
                              </a>
                            </td>
                            <td align="center" style="padding: 0 10px;">
                              <a href="https://x.com/Zarry_linilo" class="button" style="display: inline-block; background: #1A1F2B; color: white; padding: 14px 20px; border-radius: 12px; font-size: 10px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.1em; text-decoration: none;">
                                X / Twitter
                              </a>
                            </td>
                          </tr>
                        </table>
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
      }
    } catch (emailError) {
      console.error('[API] Client notification failed:', emailError);
    }

    return NextResponse.json({ success: true, data: updatedRecord });
  } catch (err: any) {
    console.error('[PATCH Exception]', err);
    return NextResponse.json({ 
      success: false, 
      error: err.message || "Internal Server Error"
    }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
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
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const isPurge = searchParams.get('purge') === 'true';
    const reason = searchParams.get('reason');

    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Admin client offline' }, { status: 500 });
    }

    // 1. Fetch record first to get file paths
    const { data: record, error: fetchError } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !record) {
      return NextResponse.json({ success: false, error: 'Record not found' }, { status: 404 });
    }

    // 2. Perform Soft Delete (Archive) or Hard Delete (Purge)
    if (isPurge) {
      // Collect all storage paths to delete
      const filesToDelete: string[] = [];
      if (record.reference_images && Array.isArray(record.reference_images)) {
        filesToDelete.push(...record.reference_images);
      }
      if (record.rough_sketch_url) filesToDelete.push(record.rough_sketch_url);
      if (record.dp_proof_url) filesToDelete.push(record.dp_proof_url);
      if (record.final_artwork_url) filesToDelete.push(record.final_artwork_url);

      // Delete files from Supabase Storage
      if (filesToDelete.length > 0) {
        const { deleteFiles } = await import('@/utils/storage');
        await deleteFiles(filesToDelete);
      }

      // Hard Delete database record
      const { error: deleteError } = await supabaseAdmin
        .from('commissions')
        .delete()
        .eq('id', id);

      if (deleteError) {
        return NextResponse.json({ success: false, error: deleteError.message }, { status: 500 });
      }
    } else {
      // Soft Delete: Mark as archived via client_note tag
      const archiveTag = `\n[ARCHIVED_AT:${new Date().toISOString()}]`;
      const { error: archiveError } = await supabaseAdmin
        .from('commissions')
        .update({ 
          client_note: (record.client_note || "") + archiveTag
        })
        .eq('id', id);

      if (archiveError) {
        return NextResponse.json({ success: false, error: archiveError.message }, { status: 500 });
      }
    }

    // 5. Notify client (ONLY if it's a rejection, NOT an archive or purge)
    const isArchive = !isPurge && !!record.client_note?.includes('[ARCHIVED_AT'); // This won't work perfectly if we just added it
    
    // Better: only notify if it was a rejection (pending -> delete)
    if (!isPurge && record.status === 'pending' && record.client_email) {
      try {
        const igUrl = "https://ig.me/m/cuancapital.id";
        const xUrl = "https://x.com/Zarry_linilo";

        await resend.emails.send({
          from: 'Moonchaery Studio <onboarding@resend.dev>',
          to: record.client_email,
          subject: "Update regarding your Commission Request",
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <style>
                  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800;900&display=swap');
                  @media only screen and (max-width: 600px) {
                    .container { padding: 20px 10px !important; }
                    .card { border-radius: 24px !important; }
                    .header { padding: 32px 24px !important; }
                    .content { padding: 32px 24px !important; }
                    .headline { font-size: 24px !important; }
                    .button-group td { display: block !important; width: 100% !important; margin-bottom: 12px !important; }
                    .button { width: 100% !important; text-align: center !important; box-sizing: border-box !important; }
                  }
                </style>
              </head>
              <body style="margin: 0; padding: 0; background-color: #FDFCFE;">
                <div class="container" style="font-family: 'Inter', sans-serif; padding: 40px 20px;">
                  <div class="card" style="max-width: 600px; margin: 0 auto; background: white; border-radius: 32px; overflow: hidden; box-shadow: 0 20px 50px rgba(168,85,247,0.1); border: 1px solid #F3E8FF;">
                    <!-- Red Warning Header -->
                    <div class="header" style="background: linear-gradient(135deg, #EF4444 0%, #F87171 100%); padding: 48px 40px; text-align: center;">
                      <p style="color: rgba(255,255,255,0.8); font-size: 10px; font-weight: 900; text-transform: uppercase; letter-spacing: 0.3em; margin: 0 0 12px 0;">Moonchaery Studio Update</p>
                      <h1 class="headline" style="color: white; font-family: 'Georgia', serif; font-size: 32px; font-weight: 400; font-style: italic; margin: 0;">Order Status Update</h1>
                    </div>

                    <div class="content" style="padding: 48px 40px; text-align: center;">
                      <p style="color: #4B5563; font-size: 16px; line-height: 1.8; margin: 0 0 32px 0;">
                        Hi <strong>${record.client_name}</strong>,<br><br>
                        Thank you for your interest in Moonchaery Studio. We've carefully reviewed your commission request, and at this time, we are unable to proceed with your project.
                      </p>

                      ${reason ? `
                      <div style="margin: 32px 0; padding: 32px; background: #FFF1F2; border-radius: 28px; border: 1px solid #FFE4E6; text-align: left;">
                         <p style="margin: 0 0 12px 0; font-size: 10px; font-weight: 900; color: #E11D48; text-transform: uppercase; letter-spacing: 0.2em;">Note from Studio:</p>
                         <p style="margin: 0; font-size: 15px; line-height: 1.6; color: #9F1239; font-style: italic;">
                           "${reason}"
                         </p>
                      </div>
                      ` : `
                      <div style="margin: 32px 0; padding: 24px; background: #FEF2F2; border-radius: 24px; border: 1px solid #FEE2E2;">
                         <p style="margin: 0; font-size: 14px; font-weight: 600; color: #B91C1C;">
                           Your commission request has been removed from our active queue.
                         </p>
                      </div>
                      `}

                      <p style="color: #6B7280; font-size: 14px; line-height: 1.6; margin: 0 0 32px 0;">
                        If you have any questions or if you believe this was an error, please reach out to us directly through our social channels. We'd love to hear from you.
                      </p>
                      
                      <!-- Social Buttons -->
                      <table class="button-group" width="100%" cellpadding="0" cellspacing="0" style="margin-top: 32px;">
                        <tr>
                          <td align="center" style="padding: 0 10px;">
                            <a href="${igUrl}" class="button" style="display: inline-block; background: #9333EA; color: white; padding: 16px 24px; border-radius: 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none; box-shadow: 0 8px 20px rgba(168,85,247,0.2);">
                              Instagram DM
                            </a>
                          </td>
                          <td align="center" style="padding: 0 10px;">
                            <a href="${xUrl}" class="button" style="display: inline-block; background: #1A1F2B; color: white; padding: 16px 24px; border-radius: 14px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.15em; text-decoration: none;">
                              X / Twitter
                            </a>
                          </td>
                        </tr>
                      </table>

                      <div style="margin-top: 48px; padding-top: 32px; border-top: 1px solid #F3F4F6;">
                        <p style="color: #9CA3AF; font-size: 11px; margin: 0;">Stay inspired,<br>Moonchaery Studio</p>
                      </div>
                    </div>

                    <!-- Footer -->
                    <div style="padding: 32px 40px; border-top: 1px solid #F3F4F6; text-align: center; background: #FAFAFA;">
                      <p style="color: #9CA3AF; font-size: 9px; font-weight: 600; margin: 0; text-transform: uppercase; letter-spacing: 0.15em;">
                        © 2026 Artist Portfolio Studio • Luxury Lilac Editorial Engine
                      </p>
                    </div>
                  </div>
                </div>
              </body>
            </html>
          `
        });
      } catch (e) {
        console.error('Delete notification failed:', e);
      }
    }

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('[DELETE Exception]', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}

