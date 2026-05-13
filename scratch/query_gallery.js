const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pgnsslfmgdyenozhpntz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbnNzbGZtZ2R5ZW5vemhwbnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAzNjkwMCwiZXhwIjoyMDkzNjEyOTAwfQ.FZs-6GC5MOU3LwzboD5yxkoECOw0yWZao8k5vwcyn8k'

const supabase = createClient(supabaseUrl, supabaseKey)

async function queryGallery() {
  const { data, error } = await supabase.from('gallery_art').select('*').limit(5)
  if (error) {
    console.error('Error querying gallery:', error)
  } else {
    console.log('Gallery entries:', JSON.stringify(data, null, 2))
  }
}

queryGallery()
