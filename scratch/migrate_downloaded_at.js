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

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

async function runMigration() {
  console.log("Running migration to add downloaded_at column to commissions table...");
  
  const sql = `
    ALTER TABLE commissions ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMPTZ DEFAULT NULL;
  `;

  const { data, error } = await supabase.rpc('exec_sql', { sql });

  if (error) {
    console.error("Migration via exec_sql failed:", error);
    console.log("\n--- PLEASE RUN THIS SQL IN THE SUPABASE SQL EDITOR ---");
    console.log(sql);
    console.log("-------------------------------------------------------");
  } else {
    console.log("Successfully added downloaded_at column to commissions table!");
  }
}

runMigration();
