import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

function maskName(name: string): string {
  if (!name) return 'A***t';
  const trimmed = name.trim();
  if (trimmed.length <= 2) return trimmed[0] + '*';
  return trimmed[0] + '*'.repeat(trimmed.length - 2) + trimmed[trimmed.length - 1];
}

function getCreativePhase(order: any): { phase: string; progress: number } {
  // If not paid DP, it's in Queue/Review
  if (order.dp_status !== 'paid') {
    return { phase: 'Queue / Deposit Pending', progress: 10 };
  }

  // Check sketch status
  if (order.sketch_status === 'pending' || order.sketch_status === 'under_review') {
    return { phase: 'Rough Sketching', progress: 25 };
  }

  // Check WIP status
  if (order.wip_status === 'pending' || order.wip_status === 'under_review') {
    return { phase: 'Lineart & Base Color', progress: 55 };
  }

  // Check Final rendering status
  if (order.final_status === 'pending' || order.final_status === 'under_review') {
    return { phase: 'Shading & Rendering', progress: 80 };
  }

  if (order.status === 'done') {
    return { phase: 'Completed & Delivered', progress: 100 };
  }

  return { phase: 'Final Polish / Review', progress: 95 };
}

export async function GET() {
  try {
    // 1. Fetch settings to check if commissions are open and get slot limit if any
    const { data: settings } = await supabaseAdmin
      .from('studio_settings')
      .select('*')
      .single();

    const maxSlots = 5; // Default max slots for premium feel
    const commissionsOpen = settings?.commissions_open ?? true;

    // 2. Fetch active and pending commissions
    const { data: commissions, error } = await supabaseAdmin
      .from('commissions')
      .select('id, client_name, status, commission_type, art_style, sketch_status, wip_status, final_status, dp_status, client_note, created_at')
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Filter out archived/purged orders
    const nonArchived = commissions?.filter(c => 
      !c.client_note?.includes('[ARCHIVED_AT:') &&
      !c.client_note?.includes('[PURGED_AT:')
    ) || [];

    // Separate active/pending queue vs recently completed
    const queueItems = nonArchived.filter(c => c.status !== 'done');
    const recentlyCompleted = nonArchived
      .filter(c => c.status === 'done')
      // Show top 3 most recent
      .slice(-3);

    // Active slots are considered those currently in progress (status = 'active')
    const activeSlotsTaken = queueItems.filter(c => c.status === 'active').length;
    const slotsAvailable = Math.max(0, maxSlots - activeSlotsTaken);

    // Format queue items for safe public display
    const formattedQueue = queueItems.map((item, index) => {
      const { phase, progress } = getCreativePhase(item);
      return {
        id: item.id,
        maskedName: maskName(item.client_name),
        queueNumber: String(index + 1).padStart(2, '0'),
        type: `${item.art_style} - ${item.commission_type}`,
        phase,
        progress,
        status: item.status // 'pending' or 'active'
      };
    });

    const formattedCompleted = recentlyCompleted.map((item) => {
      return {
        id: item.id,
        maskedName: maskName(item.client_name),
        type: `${item.art_style} - ${item.commission_type}`,
        phase: 'Completed & Delivered',
        progress: 100
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        commissionsOpen,
        maxSlots,
        activeSlotsTaken,
        slotsAvailable,
        queue: formattedQueue,
        completed: formattedCompleted
      }
    });
  } catch (error: any) {
    console.error('[API/Queue] GET Error:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
