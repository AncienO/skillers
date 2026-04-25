"use server"

// Import Supabase server client
import { createClient } from "@/lib/supabase/server"

// Define the interface for the fetch parameters
export interface GetDirectoryParams {
  // Search text for name, bio, or goal titles
  search?: string
  // Array of tag IDs to filter by
  tagIds?: string[]
  // Page number for pagination
  page?: number
  // Number of items per page
  limit?: number
}

// Export the asynchronous server action to fetch directory members
export async function getDirectoryMembers(params: GetDirectoryParams) {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Destructure parameters with defaults
  const { search = "", tagIds = [], page = 1, limit = 12 } = params
  // Calculate the starting offset for pagination
  const from = (page - 1) * limit
  // Calculate the ending offset
  const to = from + limit - 1

  // Start building the base query for members, including their goals and tags
  // We use standard left joins (by default in PostgREST) to get all related data
  let query = supabase
    .from("members")
    .select(`
      id, name, slug, avatar_url, bio, sec_role, is_sec,
      goals ( id, title, description ),
      tags ( id, label )
    `, { count: "exact" }) // Request exact count for pagination
    // Only fetch approved members for the public directory
    .eq("status", "approved")

  // Array to hold member IDs if we need to pre-filter based on search or tags
  let matchedMemberIds: string[] | null = null

  // If a search term is provided, we must find members matching the term in name/bio OR in goal titles
  if (search) {
    // 1. Search for goals matching the term to find their owner IDs
    const { data: matchedGoals } = await supabase
      .from("goals")
      .select("member_id")
      .ilike("title", `%${search}%`)
    
    // Extract the unique member IDs from those matching goals
    const goalMemberIds = matchedGoals?.map(g => g.member_id) || []

    // 2. Search for members directly matching the term in name or bio
    const { data: matchedProfiles } = await supabase
      .from("members")
      .select("id")
      .or(`name.ilike.%${search}%,bio.ilike.%${search}%`)
      .eq("status", "approved")

    // Extract the unique member IDs from those matching profiles
    const profileMemberIds = matchedProfiles?.map(m => m.id) || []

    // Combine both sets of IDs and remove duplicates
    matchedMemberIds = Array.from(new Set([...goalMemberIds, ...profileMemberIds]))
    
    // If no members matched the search at all, we can return empty early
    if (matchedMemberIds.length === 0) {
      // Return empty array and 0 count
      return { data: [], count: 0, error: null }
    // End empty check
    }
  // End search logic
  }

  // If tags are provided, we must find members who have AT LEAST ONE of the specified tags
  if (tagIds.length > 0) {
    // Query the member_tags join table for matching tags
    const { data: matchedTags } = await supabase
      .from("member_tags")
      .select("member_id")
      .in("tag_id", tagIds)

    // Extract the unique member IDs from the matching tag relationships
    const tagMemberIds = matchedTags?.map(t => t.member_id) || []

    // If we already had matchedMemberIds from the search filter
    if (matchedMemberIds !== null) {
      // Intersect the arrays: keep only IDs present in BOTH search results AND tag results
      matchedMemberIds = matchedMemberIds.filter(id => tagMemberIds.includes(id))
    // If there was no search filter, just use the tag results
    } else {
      // Assign the tag matching IDs
      matchedMemberIds = tagMemberIds
    // End conditional
    }

    // If after intersection there are no IDs left, return empty early
    if (matchedMemberIds.length === 0) {
      // Return empty array and 0 count
      return { data: [], count: 0, error: null }
    // End empty check
    }
  // End tag logic
  }

  // Finally, apply the matched IDs filter to the main query if any filters were used
  if (matchedMemberIds !== null) {
    // Filter the main query to only include the calculated IDs
    query = query.in("id", matchedMemberIds)
  // End ID filter check
  }

  // Execute the constructed query with pagination
  const { data, error, count } = await query
    // Order by creation date descending
    .order("created_at", { ascending: false })
    // Apply pagination range
    .range(from, to)

  // Return the fetched data, total count, and any error
  return { data, count, error }
// End getDirectoryMembers function
}

// Export server action to fetch all available tags for the filter UI
export async function getDirectoryTags() {
  // Initialize Supabase client
  const supabase = await createClient()
  
  // Query all tags from the database
  const { data, error } = await supabase
    .from("tags")
    .select("id, label")
    .order("label")
    
  // Return the fetched tags
  return { data, error }
// End getDirectoryTags function
}
