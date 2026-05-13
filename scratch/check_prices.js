require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkPrices() {
  const { data, error } = await supabase
    .from('commissions')
    .select('id, client_name, price')
    .limit(5);

  if (error) {
    console.error(error);
    return;
  }

  console.log('Sample prices:', data);
}

checkPrices();
