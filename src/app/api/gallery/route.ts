import { createClient } from "@/utils/supabase/server";
import { NextResponse } from "next/server";

/**
 * GET /api/gallery
 * Retrieves all gallery artwork entries ordered by display_order.
 * Public access.
 */
export async function GET() {
  const supabase = await createClient();
  
  try {
    const { data, error } = await supabase
      .from('gallery_art')
      .select('*')
      .order('display_order', { ascending: true });

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * POST /api/gallery
 * Upserts a gallery artwork entry.
 * Requires Admin Authentication (via ALLOWED_ADMIN_EMAILS whitelist).
 * 
 * @param {Request} req - JSON body containing artwork data
 */
export async function POST(req: Request) {
  const supabase = await createClient();
  
  // ADMIN AUTH CHECK
  const { data: { user } } = await supabase.auth.getUser();
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',');
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { data, error } = await supabase
      .from('gallery_art')
      .upsert(body)
      .select();

    if (error) throw error;
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

/**
 * DELETE /api/gallery
 * Removes a gallery artwork entry by ID.
 * Requires Admin Authentication.
 * 
 * @param {Request} req - Request object with id in query parameters
 */
export async function DELETE(req: Request) {
  const supabase = await createClient();
  
  // ADMIN AUTH CHECK
  const { data: { user } } = await supabase.auth.getUser();
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',');
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });
  }

  try {
    const { error } = await supabase
      .from('gallery_art')
      .delete()
      .match({ id });

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
