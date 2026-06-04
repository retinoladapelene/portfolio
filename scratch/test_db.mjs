import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Parse .env.local manually
const envFile = fs.readFileSync('.env.local', 'utf8');
const env = {};
envFile.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) {
    const key = parts[0].trim();
    const val = parts.slice(1).join('=').trim();
    env[key] = val;
  }
});

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Using Supabase URL:', supabaseUrl);

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function runDiagnostics() {
  console.log('\n--- 1. Testing GET /api/admin/archive-management query ---');
  try {
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('GET Fetch Error:', error);
    } else {
      console.log('GET Fetch Success. Total records:', data?.length);
      if (data && data.length > 0) {
        console.log('First record sample:', JSON.stringify(data[0], null, 2));
      }
      
      // Filter by tag in JS: Include Archived but NOT Purged
      const archived = data?.filter(c => 
        c.client_note?.includes('[ARCHIVED_AT:') && 
        !c.client_note?.includes('[PURGED_AT:')
      ) || [];
      console.log('Archived but not purged count:', archived.length);
    }
  } catch (err) {
    console.error('GET Exception:', err);
  }

  console.log('\n--- 2. Testing POST /api/admin/archive-management query ---');
  try {
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    console.log('Yesterday ISO:', yesterday);
    
    // Find orders to archive
    const { data: potential, error: fetchError } = await supabaseAdmin
      .from('commissions')
      .select('id, client_note, downloaded_at')
      .eq('status', 'done')
      .not('downloaded_at', 'is', null)
      .lt('downloaded_at', yesterday);

    if (fetchError) {
      console.error('POST Fetch Error:', fetchError);
    } else {
      console.log('POST Fetch Success. Potential records to archive:', potential?.length);
      const toArchive = potential?.filter(o => !o.client_note?.includes('[ARCHIVED_AT:')) || [];
      console.log('Actually needs archive count:', toArchive.length);
    }
  } catch (err) {
    console.error('POST Exception:', err);
  }

  console.log('\n--- 3. Testing DELETE /api/admin/archive-management (auto-purge) query ---');
  try {
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*');
    
    if (error) {
      console.error('DELETE Fetch Error:', error);
    } else {
      console.log('DELETE Fetch Success. Total records:', data?.length);
      const tenDaysAgo = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString();
      const toPurge = data?.filter(order => {
        const match = order.client_note?.match(/\[ARCHIVED_AT:(.+?)\]/);
        if (match) {
          const archivedAt = new Date(match[1]);
          return archivedAt < new Date(tenDaysAgo);
        }
        return false;
      }) || [];
      console.log('Records to purge (>10 days archived):', toPurge.length);
    }
  } catch (err) {
    console.error('DELETE Exception:', err);
  }
}

runDiagnostics();
