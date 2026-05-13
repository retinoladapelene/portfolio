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
  
  return user && allowedEmails.includes(user.email!);
}

export async function GET() {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Get all files from the 'portfolio' bucket recursively
    const folders = ['references', 'proofs', 'sketches', 'final_artwork'];
    let allStorageFiles: { name: string; bucket: string; path: string; size: number; lastModified: string }[] = [];

    for (const folder of folders) {
      const { data: files, error } = await supabaseAdmin.storage
        .from('portfolio')
        .list(folder, { limit: 1000 });

      if (error) continue;

      files.forEach(file => {
        allStorageFiles.push({
          name: file.name,
          bucket: 'portfolio',
          path: `${folder}/${file.name}`,
          size: file.metadata?.size || 0,
          lastModified: file.created_at || new Date().toISOString()
        });
      });
    }

    // 2. Get all referenced paths from the database
    const { data: commissions, error: dbError } = await supabaseAdmin
      .from('commissions')
      .select('reference_images, rough_sketch_url, dp_proof_url, final_artwork_url');

    if (dbError) throw dbError;

    const referencedPaths = new Set<string>();
    commissions.forEach(c => {
      if (c.reference_images && Array.isArray(c.reference_images)) {
        c.reference_images.forEach((p: string) => referencedPaths.add(p));
      }
      if (c.rough_sketch_url) referencedPaths.add(c.rough_sketch_url);
      if (c.dp_proof_url) referencedPaths.add(c.dp_proof_url);
      if (c.final_artwork_url) referencedPaths.add(c.final_artwork_url);
    });

    // 3. Find Orphaned Files
    // Exclude files uploaded in the last 2 hours to prevent race conditions
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
    
    const orphans = allStorageFiles.filter(file => {
      const isReferenced = referencedPaths.has(file.path);
      const isOldEnough = new Date(file.lastModified) < twoHoursAgo;
      return !isReferenced && isOldEnough;
    });

    const totalOrphanSize = orphans.reduce((acc, curr) => acc + curr.size, 0);

    return NextResponse.json({
      success: true,
      summary: {
        totalFiles: allStorageFiles.length,
        orphanCount: orphans.length,
        orphanSizeFormatted: (totalOrphanSize / (1024 * 1024)).toFixed(2) + ' MB',
        totalSizeRaw: totalOrphanSize
      },
      orphans: orphans.map(o => o.path)
    });

  } catch (error: any) {
    console.error('[Storage Audit Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  if (!(await verifyAdmin())) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { paths } = await request.json();

    if (!paths || !Array.isArray(paths) || paths.length === 0) {
      return NextResponse.json({ success: false, error: 'No paths provided' }, { status: 400 });
    }

    const { data, error } = await supabaseAdmin.storage
      .from('portfolio')
      .remove(paths);

    if (error) throw error;

    return NextResponse.json({ success: true, deletedCount: data?.length || 0 });
  } catch (error: any) {
    console.error('[Storage Cleanup Error]', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
