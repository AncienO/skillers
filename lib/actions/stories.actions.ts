"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function getStories() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("stories")
    .select(`
      id, content, image_url, created_at,
      member:members ( id, name, avatar_url, t1, t2, t3, t4 ),
      story_reactions ( id, emoji, member_id )
    `)
    .order("created_at", { ascending: false })
    .limit(50)

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function postStory(formData: FormData) {
  const content   = (formData.get("content") as string)?.trim()
  const image_url = (formData.get("image_url") as string)?.trim() || null
  if (!content) return { error: "Story content is required." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated." }

  const { error } = await supabase
    .from("stories")
    .insert({ member_id: user.id, content, image_url })

  if (error) return { error: error.message }

  // Award 1 Bronze token for posting a story
  await supabase.rpc("mutate_tokens", { uid: user.id, ttype: "t1", amount: 1 })

  revalidatePath("/dashboard")
  return { success: true }
}

export async function deleteStory(storyId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("stories")
    .delete()
    .eq("id", storyId)

  if (error) return { error: error.message }
  revalidatePath("/dashboard")
  return { success: true }
}

export async function toggleReaction(storyId: string, emoji: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated." }

  // Check if already reacted
  const { data: existing } = await supabase
    .from("story_reactions")
    .select("id")
    .eq("story_id", storyId)
    .eq("member_id", user.id)
    .maybeSingle()

  if (existing) {
    await supabase.from("story_reactions").delete().eq("id", existing.id)
  } else {
    await supabase.from("story_reactions").insert({ story_id: storyId, member_id: user.id, emoji })
    // Award 2 tokens to story author
    const { data: story } = await supabase.from("stories").select("member_id").eq("id", storyId).single()
    if (story && story.member_id !== user.id) {
      // Award 1 Bronze token to the story author for receiving a reaction
      await supabase.rpc("mutate_tokens", { uid: story.member_id, ttype: "t1", amount: 1 })
    }
  }

  revalidatePath("/dashboard")
  return { success: true }
}
