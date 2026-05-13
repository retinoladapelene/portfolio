const { supabaseAdmin } = require('./src/utils/supabase/admin');

async function run() {
  console.log("Attempting to add 'archived' to enum...");
  
  // Try running a raw SQL query via RPC if it exists
  const { data, error } = await supabaseAdmin.rpc('exec_sql', {
    sql: "ALTER TYPE commission_status ADD VALUE IF NOT EXISTS 'archived';"
  });

  if (error) {
    console.error("RPC exec_sql failed:", error);
    
    // Plan B: Check columns directly
    const { data: cols, error: colError } = await supabaseAdmin
      .from('commissions')
      .select('*')
      .limit(1);
    
    if (colError) {
      console.error("Fetch failed:", colError);
    } else {
      console.log("Sample columns:", Object.keys(cols[0]));
    }
  } else {
    console.log("Successfully added 'archived' to enum!");
  }
}

run();
