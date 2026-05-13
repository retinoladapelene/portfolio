require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function addDownloadColumn() {
  const { data, error } = await supabase.rpc('exec_sql', {
    sql: `ALTER TABLE commissions ADD COLUMN IF NOT EXISTS downloaded_at TIMESTAMPTZ;`
  });

  if (error) {
    console.log('Error adding column via RPC (likely RPC not defined):', error.message);
    console.log('You might need to add it manually in the Supabase Dashboard SQL Editor.');
  } else {
    console.log('Successfully added downloaded_at column.');
  }
}

addDownloadColumn();
