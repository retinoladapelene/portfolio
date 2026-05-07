import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('Testing Supabase Connection...');
console.log('URL:', supabaseUrl);
console.log('Key defined:', !!serviceKey);

if (!supabaseUrl || !serviceKey) {
  console.error('Missing credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceKey);

async function test() {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .select('count');
    
    if (error) {
      console.error('Error fetching count:', error);
    } else {
      console.log('Success! Count:', data);
    }
  } catch (err) {
    console.error('Crash:', err);
  }
}

test();
