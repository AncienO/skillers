"use server"

// Import Supabase server client
import { createClient } from "@/lib/supabase/server"
// Import Resend for emails
import { Resend } from "resend"
// Import Supabase Admin client for secure server-side fetching
import { createClient as createAdminClient } from "@supabase/supabase-js"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Export async server action to fetch all SEC members
export async function getSecMembers() {
  // Initialize standard Supabase client
  const supabase = await createClient()
  
  // Query members table
  const { data, error } = await supabase
    .from("members")
    // Select relevant public profile fields
    .select("id, name, slug, avatar_url, bio, sec_role")
    // Only approved members
    .eq("status", "approved")
    // Only SEC members
    .eq("is_sec", true)
    // Order alphabetically by role
    .order("sec_role")

  // Return data and error
  return { data, error }
// End getSecMembers
}

// Export async server action to send a message to an SEC member
export async function sendSecMessage(formData: FormData) {
  // Extract inputs
  const fromName = formData.get("from_name") as string
  const fromEmail = formData.get("from_email") as string
  const reason = formData.get("reason") as string
  const message = formData.get("message") as string
  const toSecId = formData.get("to_sec_id") as string

  // Validate inputs
  if (!fromName || !fromEmail || !reason || !message || !toSecId) {
    // Return early
    return { error: "Please fill in all required fields." }
  // End if
  }

  // Initialize admin client to securely fetch the SEC member's email
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // Fetch SEC member email and role
  const { data: secMember, error: memberError } = await supabaseAdmin
    .from("members")
    .select("email, name, sec_role")
    .eq("id", toSecId)
    .single()

  // Guard against missing members
  if (memberError || !secMember) {
    // Return error
    return { error: "SEC member not found." }
  // End if
  }

  // Format the SEC Role nicely
  const formattedRole = secMember.sec_role?.replace(/_/g, ' ').toUpperCase() || 'SEC MEMBER'

  // Send Email notifications via Resend
  try {
    // 1. Send the primary email to the SEC Member
    await resend.emails.send({
      // Provide from fallback
      from: process.env.RESEND_FROM_EMAIL || "notifications@skillers.com",
      // Send to SEC member
      to: secMember.email,
      // Allow direct reply to sender
      replyTo: fromEmail,
      // Compose subject
      subject: `Skillers SEC Inquiry (${reason}) from ${fromName}`,
      // Compose HTML body
      html: `
        <h2>Hi ${secMember.name},</h2>
        <p>You have received a new inquiry in your capacity as the <strong>${formattedRole}</strong>.</p>
        <p><strong>From:</strong> ${fromName} (<a href="mailto:${fromEmail}">${fromEmail}</a>)</p>
        <p><strong>Reason:</strong> ${reason}</p>
        <br />
        <h3>Message:</h3>
        <p style="padding: 12px; background: #f4f4f5; border-radius: 8px;">${message.replace(/\n/g, '<br/>')}</p>
      `
    // End send
    })

    // 2. Send confirmation receipt to the sender (Per specification)
    await resend.emails.send({
      // Provide from fallback
      from: process.env.RESEND_FROM_EMAIL || "notifications@skillers.com",
      // Send to the person who filled out the form
      to: fromEmail,
      // Compose subject
      subject: `Copy of your message to ${secMember.name} (Skillers SEC)`,
      // Compose HTML body
      html: `
        <h2>Hi ${fromName},</h2>
        <p>This is a confirmation that your message to ${secMember.name} (${formattedRole}) has been successfully delivered.</p>
        <br />
        <h3>Your Message:</h3>
        <p style="padding: 12px; background: #f4f4f5; border-radius: 8px;">${message.replace(/\n/g, '<br/>')}</p>
        <br />
        <p>They will reply to this email address if they require further information.</p>
      `
    // End send
    })

  // Catch email sending errors
  } catch (e) {
    console.error("SEC Email send failed", e)
    // Return generic error
    return { error: "Failed to send email. Please try again." }
  // End catch
  }

  // Return success
  return { success: true }
// End sendSecMessage
}
