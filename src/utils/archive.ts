import JSZip from 'jszip';
import { Commission } from '@/types/admin';

export async function archiveCommission(order: Commission) {
  const zip = new JSZip();
  const folderName = `Commission_${order.client_name.replace(/\s+/g, '_')}_${order.id.slice(0, 8)}`;
  const folder = zip.folder(folderName);

  if (!folder) return;

  // 1. Add Metadata
  const metadata = {
    orderId: order.id,
    client: {
      name: order.client_name,
      email: order.client_email,
      social: order.social_media
    },
    project: {
      type: order.commission_type,
      style: order.art_style,
      description: order.description,
      background: order.background_req,
      isCouple: order.is_couple,
      hasBackground: order.has_background,
      price: order.price
    },
    status: order.status,
    dates: {
      submitted: order.created_at,
      archived: new Date().toISOString()
    }
  };

  folder.file("metadata.json", JSON.stringify(metadata, null, 2));

  // 2. Fetch and Add Images
  const imageTasks: { url: string; name: string }[] = [];

  // References
  if (order.reference_images && Array.isArray(order.reference_images)) {
    order.reference_images.forEach((url: string, i: number) => {
      imageTasks.push({ url, name: `references/ref_${i + 1}.png` });
    });
  }

  // Sketch
  if (order.rough_sketch_url) {
    imageTasks.push({ url: order.rough_sketch_url, name: `sketch/rough_sketch.png` });
  }

  // Payment Proof
  if (order.dp_proof_url) {
    imageTasks.push({ url: order.dp_proof_url, name: `payment/proof.png` });
  }

  // Final Artwork
  if (order.final_artwork_url) {
    imageTasks.push({ url: order.final_artwork_url, name: `final_artwork.png` });
  }

  // Execute download tasks
  await Promise.all(imageTasks.map(async (task) => {
    try {
      const response = await fetch(task.url);
      const blob = await response.blob();
      folder.file(task.name, blob);
    } catch (e) {
      console.error(`Failed to archive image: ${task.name}`, e);
    }
  }));

  // 3. Generate ZIP and Download
  const content = await zip.generateAsync({ type: "blob" });
  const url = URL.createObjectURL(content);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${folderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
