"use server"

import { createClient } from "@/lib/supabase/server"

export async function loginWithPassword(formData: FormData) {
  const email    = formData.get("email")    as string
  const password = formData.get("password") as string

  if (!email || !password) {
    return { error: "Email and password are required" }
  }

  const supabase = await createClient()

  const { data: authData, error } = await supabase.auth.signInWithPassword({ email, password })

  if (error) {
    return { error: "Invalid credentials. Please try again." }
  }

  // Check member status + SEC flag in one query
  const { data: member } = await supabase
    .from("members")
    .select("status, is_sec")
    .eq("id", authData.user.id)
    .single()

  if (member?.status === "pending") {
    await supabase.auth.signOut()
    return { error: "Your account is pending approval. You'll receive an email once approved." }
  }

  // Check if the user is an admin
  const { data: adminRecord } = await supabase
    .from("admins")
    .select("id")
    .eq("email", email)
    .maybeSingle()

  // Routing priority: admin → SEC workspace → skiller dashboard
  if (adminRecord) return { success: true, redirect: "/admin/dashboard" }
  if (member?.is_sec) return { success: true, redirect: "/sec/workspace" }
  return { success: true, redirect: "/dashboard" }
}
