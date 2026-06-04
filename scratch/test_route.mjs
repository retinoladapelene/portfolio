import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey);

// mock getSignedUrlIfNeeded
async function getSignedUrlIfNeeded(path, bucket = 'portfolio') {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 3600);

    if (error || !data) {
      console.error(`[Storage] Failed to sign URL for ${path}:`, error);
      return undefined;
    }

    return data.signedUrl;
  } catch (err) {
    console.error(`[Storage] Exception during signing for ${path}:`, err);
    return undefined;
  }
}

async function getSignedUrlsBatch(paths, bucket = 'portfolio') {
  if (!paths || !Array.isArray(paths)) return [];
  const results = await Promise.all(paths.map(p => getSignedUrlIfNeeded(p, bucket)));
  return results.filter(url => url !== undefined);
}

async function transformCommission(commission) {
  if (!commission) return null;
  return {
    ...commission,
    reference_images: await getSignedUrlsBatch(commission.reference_images),
    rough_sketch_url: await getSignedUrlIfNeeded(commission.rough_sketch_url),
    wip_artwork_url: await getSignedUrlIfNeeded(commission.wip_artwork_url),
    final_artwork_url: await getSignedUrlIfNeeded(commission.final_artwork_url),
    final_preview_url: await getSignedUrlIfNeeded(commission.final_preview_url),
    dp_proof_url: await getSignedUrlIfNeeded(commission.dp_proof_url),
    sketch_revision_images: await getSignedUrlsBatch(commission.sketch_revision_images),
    payment_75_proof_url: await getSignedUrlIfNeeded(commission.payment_75_proof_url),
    payment_100_proof_url: await getSignedUrlIfNeeded(commission.payment_100_proof_url)
  };
}

async function testRoute() {
  try {
    console.log("Fetching commissions...");
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Fetched ${data.length} commissions. Filtering...`);
    const archived = data.filter(c => 
      c.client_note?.includes('[ARCHIVED_AT:') && 
      !c.client_note?.includes('[PURGED_AT:')
    );

    console.log(`Found ${archived.length} archived but not purged commissions. Transforming...`);
    const transformed = await Promise.all(archived.map(c => transformCommission(c)));
    
    console.log("SUCCESS! Transformed:", transformed);
  } catch (err) {
    console.error("ROUTE ERROR DETECTED:", err);
  }
}

testRoute();
