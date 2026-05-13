import { supabaseAdmin } from '../src/utils/supabase/admin';

async function checkCommission(orderId: string) {
  console.log(`Checking commission for Order ID: ${orderId}...`);
  
  try {
    const { data, error } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .eq('id', orderId)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return;
    }

    if (!data) {
      console.log('No commission found with this ID.');
    } else {
      console.log('Commission found:', JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Exception:', err);
  }
}

const targetId = 'a59dc19b-f0bd-4823-b6c2-ecabe27c388a';
checkCommission(targetId);
