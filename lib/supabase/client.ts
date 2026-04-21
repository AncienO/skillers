// Import createBrowserClient from Supabase SSR for client-side usage
import { createBrowserClient } from '@supabase/ssr'

// Export a function to create a new Supabase client instance
export function createClient() {
  // Return the client created by createBrowserClient
  return createBrowserClient(
    // Pass the Supabase URL from the environment variable
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    // Pass the Supabase Anon Key from the environment variable
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
// End of createClient function
}
