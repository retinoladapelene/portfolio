
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
import path from 'path';

// Load .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing environment variables!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function testConnection() {
  console.log('--- Testing Supabase Connection ---');
  console.log('URL:', supabaseUrl);
  
  // 1. Try to list columns/table info
  const { data: tableData, error: tableError } = await supabase
    .from('commissions')
    .select('*')
    .limit(1);

  if (tableError) {
    console.error('❌ Error reading commissions table:', tableError.message);
  } else {
    console.log('✅ Successfully connected to commissions table.');
    console.log('Current row count sample:', tableData?.length);
  }

  // 2. Try a test insert
  console.log('\n--- Testing Test Insert ---');
  const { data: insertData, error: insertError } = await supabase
    .from('commissions')
    .insert([
      { 
        client_name: 'TEST BOT', 
        client_email: 'test@example.com', 
        status: 'pending',
        price: 0,
        commission_type: 'Test',
        art_style: 'Test'
      }
    ])
    .select();

  if (insertError) {
    console.error('❌ Insert failed:', insertError.message);
  } else {
    console.log('✅ Test insert SUCCESSFUL! ID:', insertData[0].id);
    console.log('Silakan cek Dashboard Admin, apakah ada nama "TEST BOT"?');
  }
}

testConnection();
