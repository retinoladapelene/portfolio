import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email) {
      return NextResponse.json({ active: false, orders: [] });
    }

    const cleanEmail = email.toLowerCase().trim();

    // Fetch all commissions for this email using admin privileges
    // We fetch all to calculate queue positions correctly
    const { data: allActive, error: queueError } = await supabaseAdmin
      .from('commissions')
      .select('id, status, created_at, client_email, client_name, commission_type, art_style, description')
      .neq('status', 'done')
      .order('created_at', { ascending: true });

    if (queueError) throw queueError;

    // Also fetch history (done) for this specific email
    const { data: history, error: historyError } = await supabaseAdmin
      .from('commissions')
      .select('id, status, created_at, client_email, client_name, commission_type, art_style, description')
      .eq('status', 'done')
      .eq('client_email', cleanEmail);

    if (historyError) throw historyError;

    // Filter active orders for this email and calculate queue
    const userActiveOrders = allActive?.filter(c => c.client_email.toLowerCase() === cleanEmail) || [];
    
    const ordersWithQueue = userActiveOrders.map(order => {
      const queuePos = allActive.findIndex(c => c.id === order.id) + 1;
      // SANITIZE: Remove client_email before sending to client
      const { client_email, ...sanitizedOrder } = order;
      return {
        ...sanitizedOrder,
        queuePosition: queuePos,
        totalQueue: allActive.length
      };
    });

    const sanitizedHistory = history?.map(order => {
      const { client_email, ...sanitizedOrder } = order;
      return sanitizedOrder;
    }) || [];

    const allUserOrders = [...ordersWithQueue, ...sanitizedHistory];

    return NextResponse.json({ 
      active: ordersWithQueue.length > 0,
      orders: allUserOrders
    });
  } catch (error: any) {
    console.error('Track Status API Error:', error);
    return NextResponse.json({ active: false, orders: [], error: error.message }, { status: 500 });
  }
}
