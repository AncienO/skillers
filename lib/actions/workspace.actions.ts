"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// ─── MESSAGES ────────────────────────────────────────────────────────────────

export async function getRecentMessages(limit = 50) {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sec_messages")
    .select(`
      id, content, created_at,
      member:members ( id, name, avatar_url, sec_role )
    `)
    .order("created_at", { ascending: true })
    .limit(limit)

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function postMessage(formData: FormData) {
  const content = (formData.get("content") as string)?.trim()
  if (!content) return { error: "Message cannot be empty" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { data: member } = await supabase
    .from("members")
    .select("id")
    .eq("id", user.id)
    .single()

  if (!member) return { error: "Member not found" }

  const { error } = await supabase
    .from("sec_messages")
    .insert({ member_id: member.id, content })

  if (error) return { error: error.message }
  revalidatePath("/sec/workspace/messages")
  return { success: true }
}

export async function deleteMessage(messageId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("sec_messages")
    .delete()
    .eq("id", messageId)

  if (error) return { error: error.message }
  revalidatePath("/sec/workspace/messages")
  return { success: true }
}

// ─── TASKS ───────────────────────────────────────────────────────────────────

export type TaskStatus = "todo" | "in_progress" | "done"

export async function getTasks() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sec_tasks")
    .select(`
      id, title, description, status, due_date, created_at,
      assignee:members!sec_tasks_assigned_to_fkey ( id, name, avatar_url ),
      creator:members!sec_tasks_created_by_fkey ( id, name )
    `)
    .order("created_at", { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function createTask(formData: FormData) {
  const title       = (formData.get("title") as string)?.trim()
  const description = (formData.get("description") as string)?.trim() || null
  const status      = (formData.get("status") as TaskStatus) || "todo"
  const assigned_to = (formData.get("assigned_to") as string) || null
  const due_date    = (formData.get("due_date") as string) || null

  if (!title) return { error: "Task title is required" }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  const { error } = await supabase
    .from("sec_tasks")
    .insert({ title, description, status, assigned_to, due_date, created_by: user.id })

  if (error) return { error: error.message }
  revalidatePath("/sec/workspace/tasks")
  return { success: true }
}

export async function updateTaskStatus(taskId: string, status: TaskStatus) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("sec_tasks")
    .update({ status, updated_at: new Date().toISOString() })
    .eq("id", taskId)

  if (error) return { error: error.message }
  revalidatePath("/sec/workspace/tasks")
  return { success: true }
}

export async function deleteTask(taskId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("sec_tasks")
    .delete()
    .eq("id", taskId)

  if (error) return { error: error.message }
  revalidatePath("/sec/workspace/tasks")
  return { success: true }
}

// ─── DASHBOARD STATS ─────────────────────────────────────────────────────────

export async function getWorkspaceDashboard() {
  const supabase = await createClient()

  const [tasksRes, meetingsRes, membersRes, messagesRes] = await Promise.all([
    supabase.from("sec_tasks").select("status"),
    supabase.from("sec_meetings").select("id, title, scheduled_at, platform, meeting_url").order("scheduled_at").limit(3),
    supabase.from("members").select("id, name, avatar_url, sec_role").eq("is_sec", true).eq("status", "approved"),
    supabase.from("sec_messages").select(`
      id, content, created_at,
      member:members ( name, avatar_url )
    `).order("created_at", { ascending: false }).limit(5),
  ])

  const openTasks  = tasksRes.data?.filter(t => t.status !== "done").length ?? 0
  const totalTasks = tasksRes.data?.length ?? 0

  return {
    openTasks,
    totalTasks,
    upcomingMeetings: meetingsRes.data ?? [],
    secMembers:       membersRes.data  ?? [],
    recentMessages:   messagesRes.data ?? [],
  }
}
