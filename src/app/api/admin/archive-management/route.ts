import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient, type CookieOptions } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { transformCommission, deleteFiles } from '@/utils/storage';

export const dynamic = 'force-dynamic';

export async function GET() {
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
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',');
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Filter by tag in JS: Include Archived but NOT Purged
    const archived = data.filter(c => 
      c.client_note?.includes('[ARCHIVED_AT:') && 
      !c.client_note?.includes('[PURGED_AT:')
    );

    const transformed = await Promise.all(archived.map(c => transformCommission(c)));
    return NextResponse.json({ success: true, data: transformed });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST() {
  // --- AUTO-ARCHIVE SWEEP ---
  // Archive 'done' commissions where downloaded_at > 24h and not already archived
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    
    // Find orders to archive
    const { data: potential, error: fetchError } = await supabaseAdmin
      .from('commissions')
      .select('id, client_note, downloaded_at')
      .eq('status', 'done')
      .not('downloaded_at', 'is', null)
      .lt('downloaded_at', yesterday);

    if (fetchError) {
      if (fetchError.code === '42703') {
        console.warn('[Archive Management] downloaded_at column is missing in Supabase. Skipping auto-archive sweep.');
        return NextResponse.json({ 
          success: true, 
          archivedCount: 0, 
          warning: 'downloaded_at column is missing in Supabase. Please add it to your database.' 
        });
      }
      throw fetchError;
    }

    // Filter those not already archived
    const toArchive = potential?.filter(o => !o.client_note?.includes('[ARCHIVED_AT:')) || [];

    if (toArchive.length === 0) {
      return NextResponse.json({ success: true, archivedCount: 0 });
    }

    const archiveTag = `\n[ARCHIVED_AT:${new Date().toISOString()}]`;
    
    // Update them all
    await Promise.all(toArchive.map(async (order) => {
      return await supabaseAdmin
        .from('commissions')
        .update({ 
          client_note: (order.client_note || "") + archiveTag
        })
        .eq('id', order.id);
    }));

    return NextResponse.json({ success: true, archivedCount: toArchive.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  // --- PERMANENT PURGE ---
  // Purge commissions that have been archived for > 10 days
  try {
    const { searchParams } = new URL(request.url);
    const specificId = searchParams.get('id');
    const isAutoPurge = searchParams.get('auto') === 'true';

    let toPurge = [];

    if (specificId) {
      const { data } = await supabaseAdmin.from('commissions').select('*').eq('id', specificId).single();
      if (data) toPurge = [data];
    } else if (isAutoPurge) {
      // Find orders with [ARCHIVED_AT:...] in client_note older than 10 days
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      
      const { data, error } = await supabaseAdmin
        .from('commissions')
        .select('*');
      
      if (error) throw error;

      toPurge = data.filter(order => {
        const match = order.client_note?.match(/\[ARCHIVED_AT:(.+?)\]/);
        if (match) {
          const archivedAt = new Date(match[1]);
          return archivedAt < new Date(tenDaysAgo);
        }
        // Fallback if no tag, use updated_at if available or just skip
        return false;
      });
    }

    if (toPurge.length === 0) {
      return NextResponse.json({ success: true, purgedCount: 0 });
    }

    // Execute soft purge for each
    for (const record of toPurge) {
      // 1. Delete files from storage
      const filesToDelete: string[] = [];
      if (record.reference_images && Array.isArray(record.reference_images)) {
        filesToDelete.push(...record.reference_images);
      }
      if (record.rough_sketch_url) filesToDelete.push(record.rough_sketch_url);
      if (record.dp_proof_url) filesToDelete.push(record.dp_proof_url);
      if (record.final_artwork_url) filesToDelete.push(record.final_artwork_url);

      if (filesToDelete.length > 0) {
        await deleteFiles(filesToDelete);
      }

      // 2. Clear sensitive data but keep the record for stats
      const purgeTag = `\n[PURGED_AT:${new Date().toISOString()}]`;
      await supabaseAdmin
        .from('commissions')
        .update({ 
          reference_images: [],
          rough_sketch_url: null,
          dp_proof_url: null,
          final_artwork_url: null,
          client_note: (record.client_note || "") + purgeTag
        })
        .eq('id', record.id);
    }

    return NextResponse.json({ success: true, purgedCount: toPurge.length });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
