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
  const isAdminApi = request.nextUrl.pathname.startsWith('/api/admin')
  const allowedEmails = (process.env.ALLOWED_ADMIN_EMAILS || 'pbsn290704@gmail.com').split(',')

  // PUBLIC ROUTES (No Auth Required)
  const isPublicApi = 
    (request.nextUrl.pathname === '/api/commissions' && request.method === 'POST') ||
    request.nextUrl.pathname.startsWith('/api/pricing') ||
    (request.nextUrl.pathname === '/api/admin/settings' && request.method === 'GET')

  if (isAdminRoute || isAdminApi) {
    // Exception: Public can GET settings to check if commissions are open
    if (request.nextUrl.pathname === '/api/admin/settings' && request.method === 'GET') {
       return supabaseResponse;
    }

    if (!user || !allowedEmails.includes(user.email!)) {
      if (isAdminApi) {
        return NextResponse.json({ error: 'Unauthorized Admin Access' }, { status: 401 })
      }
      const url = request.nextUrl.clone()
      url.pathname = '/'
      url.searchParams.set('login', 'true')
      return NextResponse.redirect(url)
    }
  }

  if (isApiRoute && !isPublicApi) {
    // If it's a general API route (like check-active), just require being logged in
    if (!user) {
      return NextResponse.json({ error: 'Authentication Required' }, { status: 401 })
    }
  }

  return supabaseResponse
}
