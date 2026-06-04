import { supabaseAdmin } from './supabase/admin';
import { Commission } from '@/types/admin';

/**
 * Transforms a storage path or an old public URL into a signed URL if needed.
 * If the input is already a full URL, it returns it as is.
 * If it's a path, it generates a signed URL.
 */
export async function getSignedUrlIfNeeded(path: string | null | undefined, bucket: string = 'portfolio'): Promise<string | undefined> {
  if (!path) return undefined;
  
  // If it's already a full URL (legacy data), return it
  if (path.startsWith('http')) return path;

  try {
    const { data, error } = await supabaseAdmin.storage
      .from(bucket)
      .createSignedUrl(path, 3600); // 1 hour expiry

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

/**
 * Batch signs an array of paths.
 */
export async function getSignedUrlsBatch(paths: string[] | null | undefined, bucket: string = 'portfolio'): Promise<string[]> {
  if (!paths || !Array.isArray(paths)) return [];
  
  const results = await Promise.all(paths.map(p => getSignedUrlIfNeeded(p, bucket)));
  return results.filter((url): url is string => url !== undefined);
}

/**
 * Deletes multiple files from the specified bucket.
 */
export async function deleteFiles(paths: string[] | null | undefined, bucket: string = 'portfolio'): Promise<boolean> {
  if (!paths || !Array.isArray(paths) || paths.length === 0) return true;
  
  // Filter out any full URLs (we can only delete internal paths)
  const internalPaths = paths.filter(p => p && !p.startsWith('http'));
  
  if (internalPaths.length === 0) return true;

  try {
    const { error } = await supabaseAdmin.storage
      .from(bucket)
      .remove(internalPaths);

    if (error) {
      console.error(`[Storage] Failed to delete files:`, error);
      return false;
    }

    return true;
  } catch (err) {
    console.error(`[Storage] Exception during deletion:`, err);
    return false;
  }
}

/**
 * Transforms a raw commission record into one with signed URLs for all assets.
 */
export async function transformCommission(commission: Commission | null): Promise<Commission | null> {
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
