"use server"

// Import Supabase server client builder
import { createClient } from "@/lib/supabase/server"

// Export an asynchronous server action for logging in via Password
export async function loginWithPassword(formData: FormData) {
  // Extract email and password
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Validate inputs
  if (!email || !password) {
    // Return error
    return { error: "Email and password are required" }
  // End if
  }

  // Initialize the Supabase server client
  const supabase = await createClient()

  // Attempt to sign in with password
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Check for authentication errors
  if (error) {
    // Return error message
    return { error: "Invalid credentials. Please try again." }
  // End if
  }

  // If successful, return a success flag
  return { success: true }
// End loginWithPassword
}
