const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://pgnsslfmgdyenozhpntz.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBnbnNzbGZtZ2R5ZW5vemhwbnR6Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODAzNjkwMCwiZXhwIjoyMDkzNjEyOTAwfQ.FZs-6GC5MOU3LwzboD5yxkoECOw0yWZao8k5vwcyn8k'

const supabase = createClient(supabaseUrl, supabaseKey)

async function getSignedUrl() {
  const filePath = 'gallery/1778479470324-5w2ybhm.png'
  const { data, error } = await supabase.storage.from('portfolio').createSignedUrl(filePath, 3600)
  if (error) {
    console.error('Error getting signed URL:', error)
  } else {
    console.log('Signed URL:', data.signedUrl)
  }
}

getSignedUrl()
