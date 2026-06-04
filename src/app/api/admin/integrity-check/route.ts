import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export const dynamic = 'force-dynamic';

async function verifyAdmin() {
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
  
  return !!(user && user.email && allowedEmails.includes(user.email));
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get all files from storage for reference
    const folders = ['references', 'proofs', 'sketches', 'final_artwork'];
    const storagePaths = new Set<string>();

    for (const folder of folders) {
      const { data: files, error } = await supabaseAdmin.storage
        .from('portfolio')
        .list(folder, { limit: 1000 });

      if (error) continue;

      files.forEach(file => {
        storagePaths.add(`${folder}/${file.name}`);
      });
    }

    // 2. Get all commissions and their file references
    const { data: commissions, error: dbError } = await supabaseAdmin
      .from('commissions')
      .select('id, client_name, reference_images, rough_sketch_url, dp_proof_url, final_artwork_url');

    if (dbError) throw dbError;

    const brokenFiles: any[] = [];
    let totalChecks = 0;

    commissions.forEach(c => {
      const check = (path: string, field: string) => {
        if (!path) return;
        totalChecks++;
        if (!storagePaths.has(path)) {
          brokenFiles.push({
            id: c.id,
            client: c.client_name,
            field,
            path
          });
        }
      };

      if (c.reference_images && Array.isArray(c.reference_images)) {
        c.reference_images.forEach((p: string) => check(p, 'Reference'));
      }
      check(c.rough_sketch_url, 'Sketch');
      check(c.dp_proof_url, 'Payment Proof');
      check(c.final_artwork_url, 'Final Artwork');
    });

    return NextResponse.json({
      success: true,
      summary: {
        totalCommissions: commissions.length,
        totalFilesChecked: totalChecks,
        brokenCount: brokenFiles.length
      },
      brokenFiles
    });

  } catch (error: any) {
    console.error('[Integrity Check Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
