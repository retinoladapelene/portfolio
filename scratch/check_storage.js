const { createClient } = require('@supabase/supabase-js');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkFile() {
  const filePath = 'sketches/sketch-035bb38b-f353-47e2-bc51-57e1a960385b-1778347821541.png';
  console.log(`Checking if file exists: ${filePath}`);
  
  const { data, error } = await supabase.storage
    .from('portfolio')
    .list('sketches', {
      search: 'sketch-035bb38b-f353-47e2-bc51-57e1a960385b-1778347821541.png'
    });

  if (error) {
    console.error('Error listing files:', error);
    return;
  }

  if (data && data.length > 0) {
    console.log('File found in storage!');
    console.log(data[0]);
  } else {
    console.log('File NOT found in storage.');
    
    // Check if it's in the root or another folder
    const { data: rootData } = await supabase.storage.from('portfolio').list('');
    console.log('Root folders:', rootData?.map(f => f.name));
  }
}

checkFile();
