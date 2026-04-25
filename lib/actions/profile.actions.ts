"use server"

// Import Supabase server client
import { createClient } from "@/lib/supabase/server"
// Import Admin client for storage uploads (RLS bypass)
import { createClient as createAdminClient } from "@supabase/supabase-js"
// Import revalidation
import { revalidatePath } from "next/cache"

// Export async action to fetch the current user's profile for editing
export async function getMyProfile() {
  // Initialize client
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Guard — must be logged in
  if (!user) return { error: "Not authenticated" }

  // Fetch the member record matching the auth user ID
  const { data: member, error } = await supabase
    .from("members")
    .select("id, name, slug, email, bio, avatar_url")
    .eq("id", user.id)
    .single()

  // If no member record found
  if (error || !member) return { error: "Profile not found" }

  // Fetch associated goals
  const { data: goals } = await supabase
    .from("goals")
    .select("id, title, description")
    .eq("member_id", member.id)

  // Fetch associated tag IDs
  const { data: memberTags } = await supabase
    .from("member_tags")
    .select("tag_id")
    .eq("member_id", member.id)

  // Extract just the tag IDs into an array
  const tagIds = memberTags?.map(t => t.tag_id) || []

  // Return profile data
  return { data: { ...member, goals: goals || [], tagIds } }
// End getMyProfile
}

// Export async action to update the current user's profile
export async function updateMyProfile(formData: FormData) {
  // Initialize standard client for auth check
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  // Guard
  if (!user) return { error: "Not authenticated" }

  // Extract form values
  const name = formData.get("name") as string
  const bio = formData.get("bio") as string
  const goalTitle = formData.get("goal_title") as string
  const goalDescription = formData.get("goal_description") as string
  const goalId = formData.get("goal_id") as string
  const tagsStr = formData.get("tags") as string
  const avatarFile = formData.get("avatar") as File | null

  // Validate
  if (!name) return { error: "Name is required." }

  // Initialize admin client for storage uploads and updates
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Handle avatar upload if a new file was provided
  let avatarUrl: string | undefined
  if (avatarFile && avatarFile.size > 0) {
    // Generate unique file path
    const filePath = `${Date.now()}-${avatarFile.name}`

    // Upload to avatars bucket
    const { error: uploadError } = await supabaseAdmin
      .storage
      .from("avatars")
      .upload(filePath, avatarFile)

    // If upload succeeds, get the public URL
    if (!uploadError) {
      const { data: publicUrlData } = supabaseAdmin
        .storage
        .from("avatars")
        .getPublicUrl(filePath)
      avatarUrl = publicUrlData.publicUrl
    }
  }

  // Build the update payload — only include avatar_url if a new one was uploaded
  const updatePayload: Record<string, string> = { name, bio }
  if (avatarUrl) updatePayload.avatar_url = avatarUrl

  // Update the member record
  const { error: updateError } = await supabaseAdmin
    .from("members")
    .update(updatePayload)
    .eq("id", user.id)

  // Check for errors
  if (updateError) return { error: "Failed to update profile." }

  // Update the goal if one exists
  if (goalId && goalTitle) {
    await supabaseAdmin
      .from("goals")
      .update({ title: goalTitle, description: goalDescription })
      .eq("id", goalId)
  }

  // Update tags — delete existing, then insert new
  try {
    const tagIds = JSON.parse(tagsStr) as string[]
    // Remove old tags
    await supabaseAdmin.from("member_tags").delete().eq("member_id", user.id)
    // Insert new tags
    if (tagIds.length > 0) {
      const tagInserts = tagIds.map(tagId => ({ member_id: user.id, tag_id: tagId }))
      await supabaseAdmin.from("member_tags").insert(tagInserts)
    }
  } catch (e) {
    // Non-critical — tags parse may fail if empty
  }

  // Revalidate cached pages
  revalidatePath("/directory")

  // Return success
  return { success: true }
// End updateMyProfile
}
