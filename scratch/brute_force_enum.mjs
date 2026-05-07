import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = fs.readFileSync('.env.local', 'utf8');
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)?.[1]?.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)?.[1]?.trim();

const supabase = createClient(url, key);

async function findValid() {
  const candidates = [
    'pending', 'confirmed', 'Accepted', 'accepted', 'approved', 'active', 
    'inprogress', 'in_progress', 'working', 'finished', 
    'completed', 'complete', 'done', 'Cancelled', 'cancelled', 'rejected'
  ];

  console.log('Testing candidates via INSERT...');
  
  for (const status of candidates) {
    const { error } = await supabase
      .from('commissions')
      .insert({ 
        client_name: 'TEST', 
        client_email: 'test@test.com', 
        commission_type: 'TEST', 
        art_style: 'TEST',
        status: status 
      });

    if (!error) {
      console.log(`[VALID] -> "${status}"`);
      // Cleanup
      await supabase.from('commissions').delete().eq('client_name', 'TEST');
    } else if (!error.message.includes('invalid input value for enum')) {
       console.log(`[OTHER ERROR] -> "${status}": ${error.message}`);
    }
  }
}

findValid();
