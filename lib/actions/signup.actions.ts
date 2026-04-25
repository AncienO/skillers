"use server"

// Import Supabase server client
import { createClient } from "@/lib/supabase/server"
// Import Resend
import { Resend } from "resend"
// Import Supabase Admin Client
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Initialize Resend instance using the environment variable
const resend = new Resend(process.env.RESEND_API_KEY)

// Export async server action for registration
export async function registerMember(formData: FormData) {
  // Extract Turnstile token from form
  const turnstileToken = formData.get("cf-turnstile-response") as string
  
  // Verify Turnstile Token with Cloudflare
  const verifyRes = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    // Post to the verification endpoint
    method: "POST",
    // Set url encoded headers
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    // Send secret and response
    body: `secret=${process.env.TURNSTILE_SECRET_KEY}&response=${turnstileToken}`
  // End fetch
  })
  
  // Parse JSON response
  const verifyData = await verifyRes.json()
  
  // If verification failed
  if (!verifyData.success) {
    // Return an error stopping registration
    return { error: "Security check failed. Please try again." }
  // End if
  }

  // Extract other form values from the FormData
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const bio = formData.get("bio") as string
  const goalTitle = formData.get("goal_title") as string
  const goalDescription = formData.get("goal_description") as string
  const tagsStr = formData.get("tags") as string // JSON string of tag IDs
  const avatarFile = formData.get("avatar") as File | null

  // Basic validation checks
  if (!name || !email || !password || !goalTitle) {
    // Return early if required fields are missing
    return { error: "Please fill in all required fields." }
  // End if
  }

  // Generate a unique slug from the name
  const baseSlug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "")
  // Append random string to guarantee uniqueness
  const slug = `${baseSlug}-${Math.random().toString(36).substring(2, 6)}`

  // Initialize Supabase Admin Client using the service role key.
  // Because the user isn't logged in (they are registering), we must bypass RLS.
  // Using Next.js Server Actions ensures this secret never leaks to the client.
  // Create the client
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Variable to hold the final uploaded avatar URL
  let avatarUrl = null

  // Handle Avatar Upload if a file was provided and is not empty
  if (avatarFile && avatarFile.size > 0) {
    // Generate a unique file path using timestamp and original name
    const filePath = `${Date.now()}-${avatarFile.name}`
    
    // Upload the file to the 'avatars' storage bucket
    const { data: uploadData, error: uploadError } = await supabaseAdmin
      .storage
      .from("avatars")
      // Perform the actual upload
      .upload(filePath, avatarFile)

    // If upload fails, return error
    if (uploadError) {
      return { error: "Failed to upload avatar image." }
    // End if
    }

    // Get the public URL for the uploaded avatar
    const { data: publicUrlData } = supabaseAdmin
      .storage
      .from("avatars")
      .getPublicUrl(filePath)

    // Assign the URL
    avatarUrl = publicUrlData.publicUrl
  // End avatar upload logic
  }

  // Create the underlying Auth User first
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Auto-confirm so they can log in immediately
  })

  // Check auth creation
  if (authError || !authData.user) {
    return { error: authError?.message || "Failed to create account." }
  }

  // Insert the Member record mapped to the new auth user ID
  const { data: member, error: memberError } = await supabaseAdmin
    .from("members")
    .insert({
      id: authData.user.id,
      name,
      slug,
      email,
      bio,
      avatar_url: avatarUrl,
      // Default status requires admin approval
      status: "pending" 
    // Close insert
    })
    // Return the inserted ID
    .select("id")
    // Ensure single return
    .single()

  // Catch database errors
  if (memberError) {
    // Handle unique email constraint violations
    if (memberError.code === "23505") {
      return { error: "A member with this email already exists." }
    // End if
    }
    // Generic error
    return { error: "Failed to create profile. Please try again." }
  // End if
  }

  // Insert the Goal record mapped to the new member
  const { error: goalError } = await supabaseAdmin
    .from("goals")
    .insert({
      member_id: member.id,
      title: goalTitle,
      description: goalDescription
    // Close insert
    })

  // Check goal errors
  if (goalError) return { error: "Failed to save goals." }

  // Parse and Insert Tags into the join table
  try {
    // Parse the JSON array
    const tagIds = JSON.parse(tagsStr) as string[]
    // If tags exist
    if (tagIds.length > 0) {
      // Map tags to member_tags payload
      const tagInserts = tagIds.map(tagId => ({ member_id: member.id, tag_id: tagId }))
      // Perform bulk insert
      await supabaseAdmin.from("member_tags").insert(tagInserts)
    // End if
    }
  // Catch JSON parse errors silently
  } catch (e) {
    // Non-critical error if tags fail to parse
  // End catch
  }

  // Send Confirmation Email to the Member via Resend
  try {
    // Trigger email send
    await resend.emails.send({
      // Sender configuration
      from: process.env.RESEND_FROM_EMAIL || "onboarding@resend.dev",
      // Recipient
      to: email,
      // Subject line
      subject: "Your Skillers Application is under review",
      // HTML template
      html: `
        <h1>Hi ${name}!</h1>
        <p>Thank you for joining the Skillers Community Directory.</p>
        <p>Your application is currently under review by our team. You will receive an email once your profile is approved and live on the directory.</p>
      `
    // Close send method
    })
  // Catch email errors without failing the overall registration
  } catch (e) {
    console.error("Email send failed", e)
  // End catch
  }

  // Return absolute success flag
  return { success: true }
// End function
}
