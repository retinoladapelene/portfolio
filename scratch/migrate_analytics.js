const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function createAnalyticsTable() {
  console.log("Creating site_analytics table...");
  
  // Note: This relies on the exec_sql RPC being present. 
  // If not, we will have to ask the user to run it in Supabase SQL Editor.
  const sql = `
    CREATE TABLE IF NOT EXISTS site_analytics (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      event_type TEXT NOT NULL, -- 'view', 'click', 'submit'
      page_path TEXT,
      event_name TEXT,
      metadata JSONB DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ DEFAULT now()
    );

    -- Index for faster querying
    CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON site_analytics(created_at);
    CREATE INDEX IF NOT EXISTS idx_analytics_event_type ON site_analytics(event_type);
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error("Migration failed:", error);
    console.log("\n--- PLEASE RUN THIS IN SUPABASE SQL EDITOR ---");
    console.log(sql);
    console.log("----------------------------------------------");
  } else {
    console.log("Successfully created site_analytics table!");
  }
}

createAnalyticsTable();
