import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function check() {
  const { data, error } = await supabase.from('commissions').select('*');
  if (error) {
    console.error('ERROR:', error);
  } else {
    console.log('COUNT:', data.length);
    if (data.length > 0) {
      console.log('FIRST STATUS:', data[0].status);
    }
  }
}

check();
