// Import Supabase Server Client
import { createClient } from "@/lib/supabase/server"
// Import Next.js Response
import { NextResponse } from "next/server"

// Export POST handler for the logout route
export async function POST(request: Request) {
  // Initialize Supabase
  const supabase = await createClient()
  
  // Call signOut to destroy the session cookie
  await supabase.auth.signOut()
  
  // Redirect the user back to the global login page
  return NextResponse.redirect(new URL("/login", request.url))
// End POST
}
