import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // refreshing the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // PROTECT /ADMIN AND SENSITIVE API ROUTES
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin')
  const allowedEmails = ['pbsn290704@gmail.com']

  if (isAdminRoute || isApiRoute) {
    // Exception: POST /api/commissions is PUBLIC for form submissions
    if (request.nextUrl.pathname === '/api/commissions' && request.method === 'POST') {
      return supabaseResponse
    }

    // Check auth for everything else under /admin or /api
    if (!user || !allowedEmails.includes(user.email!)) {
      if (isApiRoute) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('login', 'true')
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
