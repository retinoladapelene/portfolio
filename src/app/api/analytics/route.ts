import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/utils/supabase/admin';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { eventType, pagePath, eventName, metadata } = body;

    // Capture IP address from headers (works in Vercel/Production)
    // Fallback to request.ip or 'Localhost (Dev)' for local development
    const forwardedFor = request.headers.get('x-forwarded-for');
    const realIp = request.headers.get('x-real-ip');
    const ip = forwardedFor ? forwardedFor.split(',')[0] : (realIp || 'Localhost (Dev)');

    if (!supabaseAdmin) {
      return NextResponse.json({ success: false, error: 'Database offline' }, { status: 500 });
    }

    const { error } = await supabaseAdmin
      .from('site_analytics')
      .insert({
        event_type: eventType,
        page_path: pagePath,
        event_name: eventName,
        metadata: {
          ...(metadata || {}),
          ip: ip
        }
      });

    if (error) {
      // If table doesn't exist, we just fail silently for the client but log for admin
      console.error('Analytics insert error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function GET() {
  // --- FETCH ANALYTICS FOR DASHBOARD ---
  try {
    if (!supabaseAdmin) throw new Error('Database offline');

    // Fetch all-time records
    const { data, error } = await supabaseAdmin
      .from('site_analytics')
      .select('*')
      .order('created_at', { ascending: true });

    if (error) throw error;

    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
