
import { createClient } from '@supabase/supabase-js';

// Manual env check because standalone node doesn't load .env.local automatically
// We will read the file manually
import fs from 'fs';
import path from 'path';

const envPath = path.resolve(process.cwd(), '.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = Object.fromEntries(
  envContent.split('\n')
    .filter(line => line.includes('='))
    .map(line => line.split('=').map(part => part.trim()))
);

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables in .env.local!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('--- DIAGNOSTIC START ---');
  console.log('Target URL:', supabaseUrl);
  
  // Test 1: Fetch
  const { data, error } = await supabase.from('commissions').select('count');
  if (error) {
    console.error('❌ Database Access Error:', error.message);
    console.error('Full Error:', error);
  } else {
    console.log('✅ Connection Successful. Table "commissions" is reachable.');
  }

  // Test 2: Try Insert
  const { data: ins, error: insErr } = await supabase.from('commissions').insert({
    client_name: 'DIAGNOSTIC TEST',
    client_email: 'test@system.com',
    status: 'pending',
    commission_type: 'Test',
    art_style: 'Test',
    price: 0
  }).select();

  if (insErr) {
    console.error('❌ Insert Test Failed:', insErr.message);
  } else {
    console.log('✅ Insert Test Success! Row ID:', ins[0].id);
  }
}

testConnection();
