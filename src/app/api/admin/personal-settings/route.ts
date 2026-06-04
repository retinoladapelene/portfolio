import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const SETTINGS_FILE = path.join(process.cwd(), 'src/data/personal_settings.json');

// GET: Fetch personal settings
export async function GET() {
  try {
    const fileContents = await fs.readFile(SETTINGS_FILE, 'utf8');
    const data = JSON.parse(fileContents);
    return NextResponse.json({ success: true, data });
  } catch (error: any) {
    console.error('[API/PersonalSettings] GET Error:', error);
    // Return default if file doesn't exist
    return NextResponse.json({ 
      success: true, 
      data: {
        hero_photo_url: "/personalfoto.webp",
        hero_mask_photo_url: "/gambarcursorinteraktif.webp",
        hero_mask_position_x: 50,
        hero_mask_position_y: 15
      }
    });
  }
}

// POST: Update personal settings (Admin only)
export async function POST(request: Request) {
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
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com,tyo290704@gmail.com').split(',');
  
  if (!user || !user.email || !allowedEmails.includes(user.email)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    
    // Ensure the data directory exists
    const dir = path.dirname(SETTINGS_FILE);
    await fs.mkdir(dir, { recursive: true });

    // Write to file
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(body, null, 2), 'utf8');

    return NextResponse.json({ success: true, data: body });
  } catch (error: any) {
    console.error('[API/PersonalSettings] POST Error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message 
    }, { status: 500 });
  }
}
