"use server"

// Import Supabase server client for standard auth checks
import { createClient } from "@/lib/supabase/server"
// Import Admin Client to bypass RLS for admin operations
import { createClient as createAdminClient } from "@supabase/supabase-js"
// Import Next.js revalidation
import { revalidatePath } from "next/cache"
// Import Resend for announcement broadcasting
import { Resend } from "resend"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Internal helper to get authenticated admin client safely
async function getAdminClient() {
  // Check the current user's session
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  // If no user is logged in, throw error (Middleware should prevent this, but defense in depth)
  if (!user) throw new Error("Unauthorized access. Admin privileges required.")

  // Return a Supabase client initialized with the SERVICE ROLE key
  // This bypasses RLS, allowing the admin to view pending members and make updates
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
// End helper
}

// Export async action to get top-level metrics for the dashboard
export async function getDashboardMetrics() {
  // Get elevated client
  const adminClient = await getAdminClient()
  
  // Query pending members count
  const { count: pendingCount } = await adminClient.from("members").select("*", { count: "exact", head: true }).eq("status", "pending")
  // Query approved members count
  const { count: approvedCount } = await adminClient.from("members").select("*", { count: "exact", head: true }).eq("status", "approved")
  // Query total goals count
  const { count: goalsCount } = await adminClient.from("goals").select("*", { count: "exact", head: true })
  // Query total connection requests
  const { count: connectionsCount } = await adminClient.from("connection_requests").select("*", { count: "exact", head: true })

  // Return aggregated metrics
  return { pendingCount, approvedCount, goalsCount, connectionsCount }
// End getDashboardMetrics
}

// Export async action to fetch all pending members for admin review
export async function getPendingMembers() {
  // Get elevated client
  const adminClient = await getAdminClient()

  // Query all members with pending status
  const { data, error } = await adminClient
    .from("members")
    .select("id, name, email, slug, created_at")
    .eq("status", "pending")
    .order("created_at", { ascending: false })

  // Return data
  return { data, error }
// End getPendingMembers
}

// Export async action to approve a pending member
export async function approveMember(memberId: string) {
  // Get elevated client
  const adminClient = await getAdminClient()

  // Fetch the member's email before updating
  const { data: member, error: fetchError } = await adminClient
    .from("members")
    .select("email, name")
    .eq("id", memberId)
    .single()

  // Guard
  if (fetchError || !member) return { error: "Member not found." }

  // Update status to approved
  const { error: updateError } = await adminClient
    .from("members")
    .update({ status: "approved" })
    .eq("id", memberId)

  // Check for update errors
  if (updateError) return { error: "Failed to approve member." }

  // Send approval notification email via Resend
  try {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@skillers.com",
      to: member.email,
      subject: "Your Skillers Account Has Been Approved! 🎉",
      html: `
        <h2>Welcome to Skillers, ${member.name}!</h2>
        <p>Great news — your account has been approved by our team.</p>
        <p>You can now sign in and access the community directory, update your profile, and connect with other members.</p>
        <br />
        <a href="${siteUrl}/login" style="display:inline-block;padding:12px 24px;background:#6366f1;color:#fff;border-radius:999px;text-decoration:none;font-weight:bold;">Sign In Now</a>
        <br /><br />
        <p>See you inside!</p>
      `
    })
  } catch (e) {
    // Email failure is non-critical — the approval still went through
    console.error("Approval email failed", e)
  }

  // Revalidate admin pages
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/members")

  // Return success
  return { success: true }
// End approveMember
}

// Export async action to reject (delete) a pending member
export async function rejectMember(memberId: string) {
  // Get elevated client
  const adminClient = await getAdminClient()

  // Delete the member record
  const { error: deleteError } = await adminClient
    .from("members")
    .delete()
    .eq("id", memberId)

  // Check for errors
  if (deleteError) return { error: "Failed to reject member." }

  // Also delete the auth user to free the email
  try {
    await adminClient.auth.admin.deleteUser(memberId)
  } catch (e) {
    console.error("Failed to delete auth user", e)
  }

  // Revalidate
  revalidatePath("/admin/dashboard")
  revalidatePath("/admin/dashboard/members")

  // Return success
  return { success: true }
// End rejectMember
}

// Export async action to broadcast an announcement to all approved members
export async function broadcastAnnouncement(formData: FormData) {
  // Get elevated client
  const adminClient = await getAdminClient()

  // Extract form values
  const subject = formData.get("subject") as string
  const message = formData.get("message") as string

  // Validate
  if (!subject || !message) return { error: "Subject and message are required." }

  // Fetch all approved members' emails
  const { data: members, error: fetchError } = await adminClient
    .from("members")
    .select("email, name")
    .eq("status", "approved")

  // Guard
  if (fetchError || !members || members.length === 0) {
    return { error: "No approved members to send to." }
  }

  // Send emails — Resend supports batch sending up to 100 per call
  try {
    // Build the email list
    const emails = members.map(m => m.email)

    await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "notifications@skillers.com",
      to: emails,
      subject: `Skillers: ${subject}`,
      html: `
        <h2>${subject}</h2>
        <div style="padding: 16px; background: #f4f4f5; border-radius: 8px; margin: 16px 0;">
          ${message.replace(/\n/g, '<br/>')}
        </div>
        <br />
        <p style="color: #888; font-size: 12px;">You received this because you are a member of the Skillers community.</p>
      `
    })
  } catch (e) {
    console.error("Broadcast failed", e)
    return { error: "Failed to send announcement. Please try again." }
  }

  // Return success with recipient count
  return { success: true, count: members.length }
// End broadcastAnnouncement
}

// Export async action to fetch all approved members for SEC management
export async function getApprovedMembers() {
  const adminClient = await getAdminClient()

  const { data, error } = await adminClient
    .from("members")
    .select("id, name, email, slug, is_sec, sec_role")
    .eq("status", "approved")
    .order("name")

  return { data, error }
}

// Export async action to toggle a member's SEC status
export async function toggleSecStatus(memberId: string, isSec: boolean) {
  const adminClient = await getAdminClient()

  // Build the update — if removing from SEC, also clear the role
  const update: Record<string, unknown> = { is_sec: isSec }
  if (!isSec) update.sec_role = null

  const { error } = await adminClient
    .from("members")
    .update(update)
    .eq("id", memberId)

  if (error) return { error: "Failed to update SEC status." }

  revalidatePath("/admin/dashboard/sec")
  revalidatePath("/sec")
  return { success: true }
}

// Export async action to update a member's SEC role
export async function updateSecRole(memberId: string, role: string) {
  const adminClient = await getAdminClient()

  const { error } = await adminClient
    .from("members")
    .update({ sec_role: role || null })
    .eq("id", memberId)

  if (error) return { error: "Failed to update SEC role." }

  revalidatePath("/admin/dashboard/sec")
  revalidatePath("/sec")
  return { success: true }
}
