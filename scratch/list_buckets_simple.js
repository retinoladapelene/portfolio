const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pgnsslfmgdyenozhpntz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbnNzbGZtZ2R5ZW5vemhwbnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAzNjkwMCwiZXhwIjoyMDkzNjEyOTAwfQ.FZs-6GC5MOU3LwzboD5yxkoECOw0yWZao8k5vwcyn8k'

const supabase = createClient(supabaseUrl, supabaseKey)

async function listBuckets() {
  const { data, error } = await supabase.storage.listBuckets()
  if (error) {
    console.error('Error listing buckets:', error)
  } else {
    console.log('Available buckets:', data.map(b => ({ name: b.name, public: b.public })))
  }
}

listBuckets()
