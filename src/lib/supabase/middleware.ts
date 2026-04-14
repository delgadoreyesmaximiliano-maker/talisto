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

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') || request.nextUrl.pathname.startsWith('/signup')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/app')

    if (
        !user &&
        isProtectedRoute
    ) {
        // no user, potentially respond by redirecting the user to the login page
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    if (user && isAuthRoute) {
        // user is logged in, redirect them to the app
        const url = request.nextUrl.clone()
        url.pathname = '/app'
        return NextResponse.redirect(url)
    }

    // --- Multitenancy / Company Setup check ---
    if (user && isProtectedRoute) {
        // Verify if user is linked to a company
        const { data: userProfile } = await supabase
            .from('users')
            .select('company_id')
            .eq('id', user.id)
            .single()

        const hasCompany = !!(userProfile as any)?.company_id
        const isSetupPage = request.nextUrl.pathname.startsWith('/app/company/setup')

        // If trying to access app without a company, force setup
        if (!hasCompany && !isSetupPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/app/company/setup'
            return NextResponse.redirect(url)
        }

        // If trying to access setup while already having a company, redirect to dashboard
        if (hasCompany && isSetupPage) {
            const url = request.nextUrl.clone()
            url.pathname = '/app'
            return NextResponse.redirect(url)
        }
    }

    // IMPORTANT: You *must* return the supabaseResponse object as it is. If you're
    // creating a new response object with NextResponse.next() make sure to:
    // 1. Pass the request in it, like so:
    //    const myNewResponse = NextResponse.next({ request })
    // 2. Copy over the cookies, like so:
    //    myNewResponse.cookies.setAll(supabaseResponse.cookies.getAll())
    // 3. Change the myNewResponse object to fit your needs, but avoid changing
    //    the cookies!
    // 4. Finally:
    //    return myNewResponse
    // If this is not done, you may be causing the browser and server to go out
    // of sync and terminate the user's session prematurely!

    return supabaseResponse
}
