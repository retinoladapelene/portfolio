import { NextResponse } from 'next/server'
// The client you created in Step 1
import { createClient } from '@/utils/supabase/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // if "next" is in search params, use it as the redirection URL
  const next = searchParams.get('next') ?? '/admin'

  if (code) {
    const supabase = await createClient()
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    
    return NextResponse.json({ error: 'Exchange failed', details: error }, { status: 400 })
  }

  // If there's an error in the URL params
  const error_description = searchParams.get('error_description')
  if (error_description) {
    return NextResponse.json({ error: 'OAuth Error', description: error_description }, { status: 400 })
  }

  return NextResponse.json({ error: 'No code provided' }, { status: 400 })
}
