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
    return { error: "Email and password are required" }
  }

  // Initialize the Supabase server client
  const supabase = await createClient()

  // Attempt to sign in with password
  const { data: authData, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  // Check for authentication errors
  if (error) {
    return { error: "Invalid credentials. Please try again." }
  }

  // Check the member's approval status
  const { data: member } = await supabase
    .from("members")
    .select("status")
    .eq("id", authData.user.id)
    .single()

  // If the member is still pending approval
  if (member?.status === "pending") {
    // Sign them out — they can't access the directory yet
    await supabase.auth.signOut()
    return { error: "Your account is pending approval. You'll receive an email once approved." }
  }

  // Check if the user is an admin
  const { data: adminRecord } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  // Return success with the correct redirect path
  return { success: true, redirect: adminRecord ? "/admin/dashboard" : "/directory" }
}
