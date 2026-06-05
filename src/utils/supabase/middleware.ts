import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          supabaseResponse = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          supabaseResponse.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // IMPORTANT: Avoid writing any logic between createServerClient and
  // supabase.auth.getUser(). A simple mistake could make it very hard to debug
  // issues with users being randomly logged out.
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Define protected routes that require login
  const isProtectedRoute = request.nextUrl.pathname.startsWith('/dashboard') || 
                           request.nextUrl.pathname.startsWith('/admin') ||
                           request.nextUrl.pathname.startsWith('/reset-password')

  // If there's no user and the route is protected, redirect to login
  if (isProtectedRoute && !user) {
    const url = request.nextUrl.clone()
    url.pathname = '/signin'
    return NextResponse.redirect(url)
  }

  // Enforce admin-only access on /admin routes
  if (request.nextUrl.pathname.startsWith('/admin') && user) {
    // Create a trusted admin client using the service role key to bypass RLS policies in middleware
    const serviceClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const { data: profile, error } = await serviceClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (error) {
      console.error(`[Middleware Error] Error fetching user profile role:`, error.message)
      console.log(`[Middleware Env Check] URL: ${process.env.NEXT_PUBLIC_SUPABASE_URL}, Service key length: ${process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0}`)
    }

    if (!profile || profile.role !== 'admin') {
      console.warn(`Redirecting unauthorized user ${user.email} (role: ${profile?.role}) from /admin`)
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  }

  // If the user is logged in, prevent them from accessing signin/signup
  const isAuthRoute = request.nextUrl.pathname.startsWith('/signin') || 
                      request.nextUrl.pathname.startsWith('/signup')
                      
  if (isAuthRoute && user) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
