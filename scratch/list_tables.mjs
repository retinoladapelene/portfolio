import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1];
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1];

const supabase = createClient(url.trim(), key.trim());

async function listTables() {
  const { data, error } = await supabase.rpc('get_tables'); // Standard rpc doesn't exist usually
  // Try selecting from a system table if possible
  const { data: tables, error: err } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public');
  
  if (err) console.error(err);
  else console.log('TABLES:', tables.map(t => t.table_name).join(', '));
}

listTables();
