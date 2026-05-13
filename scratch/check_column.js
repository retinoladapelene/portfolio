const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function addColumn() {
  // We can't run raw SQL via supabase-js without an RPC.
  // But we can check if it exists.
  const { data, error } = await supabase.from('commissions').select('sketch_revision_images').limit(1);
  if (error && error.code === '42703') { // undefined_column
    console.log('Column sketch_revision_images does not exist. Please add it manually in Supabase SQL Editor:');
    console.log('ALTER TABLE commissions ADD COLUMN sketch_revision_images text[];');
  } else if (error) {
    console.error('Error checking column:', error);
  } else {
    console.log('Column sketch_revision_images already exists.');
  }
}

addColumn();
