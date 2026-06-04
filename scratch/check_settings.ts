
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function checkSettings() {
  const { supabaseAdmin } = await import('../src/utils/supabase/admin');
  const { data, error } = await supabaseAdmin
    .from('studio_settings')
    .select('*')
    .single();
    
  if (error) {
    console.error('Error fetching settings:', error);
  } else {
    console.log('Current settings columns:', Object.keys(data));
    console.log('Current settings data:', data);
  }
}

checkSettings();
