// Import cookies helper from Next.js server actions / components
import { cookies } from 'next/headers'
// Import createServerClient from Supabase SSR
import { createServerClient } from '@supabase/ssr'

// Export async function to get the server-side Supabase client
export async function createClient() {
  // Await to get the readonly cookies object from Next.js
  const cookieStore = await cookies()

  // Create and return the server client instance
  return createServerClient(
    // Supply the public URL environment variable
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Supply the public anon key environment variable
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    // Pass the configuration object
    {
      // Specify the cookies handling configuration
      cookies: {
        // Define the getAll method to return all cookies
        getAll() {
          // Return the array of all cookies mapped from the store
          return cookieStore.getAll()
        // Close the getAll method
        },
        // Define the setAll method to set multiple cookies
        setAll(cookiesToSet) {
          // We wrap cookie setting in a try-catch to avoid throwing errors in Server Components
          try {
            // Iterate over each cookie that needs to be set
            cookiesToSet.forEach(({ name, value, options }) => {
              // Set each cookie into the store
              cookieStore.set(name, value, options)
            // Close the forEach callback
            })
          // Catch any errors that occur during setting
          } catch (error) {
            // The `set` method was called from a Server Component.
            // This can be ignored if you have middleware refreshing
            // user sessions.
          // Close catch block
          }
        // Close the setAll method
        },
      // Close cookies object
      },
    // Close configuration object
    }
  // Close the createServerClient call
  )
// Close createClient function
}
