// Import NextResponse from Next.js server routing
import { NextResponse, type NextRequest } from 'next/server'
// Import createServerClient from Supabase SSR
import { createServerClient } from '@supabase/ssr'

// Export async middleware function
export async function middleware(request: NextRequest) {
  // Try catching any errors during initialization
  try {
    // Create an initial response object that we can mutate
    let supabaseResponse = NextResponse.next({
      // Copy the incoming request object into our response configuration
      request,
    // End NextResponse.next configuration
    })

    // Create the Supabase client instance specifically for middleware
    const supabase = createServerClient(
      // The Supabase public URL
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      // The Supabase public anon key
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      // Pass the configuration options
      {
        // Define cookies methods
        cookies: {
          // Provide getAll cookie string for SSR
          getAll() {
            // Read all cookies from incoming request
            return request.cookies.getAll()
          // End getAll
          },
          // Provide setAll to mutate cookies
          setAll(cookiesToSet) {
            // Iterate over each cookie
            cookiesToSet.forEach(({ name, value }) => {
              // Update request cookies for downstream components
              request.cookies.set(name, value)
            // End iteration
            })
            // Create a fresh response with modified cookies
            supabaseResponse = NextResponse.next({
              // Pass the modified request down
              request,
            // End NextResponse config
            })
            // Set the cookies on the outbound response
            cookiesToSet.forEach(({ name, value, options }) => {
              // Write cookie to response headers
              supabaseResponse.cookies.set(name, value, options)
            // End iteration
            })
          // End setAll
          },
        // End cookies block
        },
      // End configuration
      }
    // End createServerClient call
    )

    // Call getUser to actually retrieve the user from the token.
    // Important: DO NOT use getSession as it only reads the cookie without remote validation.
    // getUser securely resolves against the Supabase edge.
    const {
      // Destructure data object containing the user
      data: { user },
    // End destructure from getUser
    } = await supabase.auth.getUser()

    // Determine if the incoming request is targeting the admin area (and not the login page)
    const isAdminRoute = request.nextUrl.pathname.startsWith('/admin') && request.nextUrl.pathname !== '/admin/login'

    // If it is an admin route and there is no authenticated user session
    if (isAdminRoute && !user) {
      // Clone the current URL to build a clean redirect path
      const url = request.nextUrl.clone()
      // Change the trailing pathname to point to login page
      url.pathname = '/admin/login'
      // Return a 307 Temporary Redirect response to login right away
      return NextResponse.redirect(url)
    // End if statement
    }

    // Return the augmented response object passing tokens down the chain to Layouts/Pages
    return supabaseResponse
  // Catch any potential errors from parsing edge requests
  } catch (e) {
    // If Supabase SSR throws, safely return the request passing through
    return NextResponse.next({
      // We still pass the request instance
      request: {
        // Including headers unaltered
        headers: request.headers,
      // end request object
      },
    // End NextResponse constructor
    })
  // End catch block
  }
// End middleware function
}

// Export the Next.js standard config object to restrict exactly when middleware executes
export const config = {
  // Define an array under matcher
  matcher: [
    // Trigger on all paths minus next/static, images, rendering, etc so we save compute time
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  // End matcher array
  ],
// End config block
}
