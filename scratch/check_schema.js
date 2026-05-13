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

    const { data, error } = await supabase
      .from('studio_settings')
      .select('*')
      .limit(1);

    if (error) {
      console.error('Error fetching studio_settings:', error);
    } else {
      console.log('Current studio_settings data:', data);
      if (data && data.length > 0) {
        console.log('Available columns:', Object.keys(data[0]));
      } else {
        console.log('Table is empty.');
      }
    }
  } catch (err) {
    console.error('Script error:', err);
  }
}

check();
