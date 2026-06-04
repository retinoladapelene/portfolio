import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, serviceRoleKey);

async function checkCommissions() {
    const { data, error } = await supabase.from('commissions').select('*');
    if (error) {
        console.error('Error:', error.message);
        return;
    }

    console.log('--- Current Commissions ---');
    data.forEach(c => {
        console.log(`ID: ${c.id}, Name: ${c.client_name}, Status: ${c.status}, Note: ${c.client_note || 'N/A'}`);
    });
}

checkCommissions();
