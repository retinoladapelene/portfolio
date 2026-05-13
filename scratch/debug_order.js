const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

async function check() {
  try {
    const envPath = path.join(process.cwd(), '.env.local');
    const env = fs.readFileSync(envPath, 'utf8');
    const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)[1].trim();
    const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)[1].trim();

    const supabase = createClient(url, key);

    const orderId = '035bb38b-f353-47e2-bc51-57e1a960385b';
    console.log(`Searching for Order ID: ${orderId}...`);
    
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
    } else {
      if (data) {
        console.log('Commission found!');
        console.log(JSON.stringify(data, null, 2));
      } else {
        console.log('Commission NOT found in the table.');
        
        // Let's list the last 5 commissions to see what's in there
        console.log('\nLast 5 commissions:');
        const { data: list } = await supabase
          .from('commissions')
          .select('id, client_name, created_at')
          .order('created_at', { ascending: false })
          .limit(5);
        console.log(list);
      }
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

check();
