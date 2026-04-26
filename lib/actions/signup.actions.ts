"use server"

// Import Supabase Admin Client to bypass RLS for user creation
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Export async server action for registration
export async function registerMember(formData: FormData) {
  // Extract form values
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // Basic validation
  if (!email || !password) {
    return { error: "Email and password are required." }
  }

  // Password length check
  if (password.length < 6) {
    return { error: "Password must be at least 6 characters." }
  }

  // Initialize admin client — needed because the user is not yet logged in
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Create the auth user account
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm so they can log in once approved
  })

  // Handle auth creation errors
  if (authError || !authData.user) {
    // Check for duplicate email
    if (authError?.message?.includes("already been registered")) {
      return { error: "An account with this email already exists." }
    }
    return { error: authError?.message || "Failed to create account." }
  }

  // Generate a slug from the email prefix
  const emailPrefix = email.split("@")[0]
  const baseSlug = emailPrefix.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

  // Insert a minimal member record with status "pending"
  const { error: memberError } = await supabaseAdmin
    .from("members")
    .insert({
      id: authData.user.id,
      name: emailPrefix, // Placeholder name from email, user fills in real name on Edit Profile
      slug,
      email,
      status: "pending",
    })

  // Handle member insert errors
  if (memberError) {
    // Clean up: delete the auth user if member insert fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    if (memberError.code === "23505") {
      return { error: "An account with this email already exists." }
    }
    return { error: "Failed to create profile. Please try again." }
  }

  // Return success
  return { success: true }
}
