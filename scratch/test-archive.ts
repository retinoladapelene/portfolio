import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const { supabaseAdmin } = await import('../src/utils/supabase/admin');
    const { transformCommission } = await import('../src/utils/storage');

    console.log("Fetching commissions...");
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("DB Fetch Error:", error);
      return;
    }

    console.log(`Fetched ${data.length} commissions.`);

    // Filter by tag in JS: Include Archived but NOT Purged
    const archived = data.filter(c => 
      c.client_note?.includes('[ARCHIVED_AT:') && 
      !c.client_note?.includes('[PURGED_AT:')
    );

    console.log(`Found ${archived.length} archived commissions.`);

    console.log("Transforming commissions...");
    const transformed = await Promise.all(archived.map(c => transformCommission(c)));
    console.log("Transformation completed successfully! Transformed count:", transformed.length);
  } catch (err) {
    console.error("Caught Exception:", err);
  }
}

test();
