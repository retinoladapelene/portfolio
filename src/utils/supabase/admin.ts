import { createClient } from '@supabase/supabase-js'

// This client uses the SUPABASE_SERVICE_ROLE_KEY which bypasses Row Level Security.
// It should ONLY be used in Server Components, Server Actions, and API Routes.
// DO NOT import this file in any client-side components.

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  throw new Error('Missing Supabase admin credentials. Check your environment variables.')
}

export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})
