"use server"

// Import Supabase Admin Client
import { createClient as createAdminClient } from "@supabase/supabase-js"
// Import Resend
import { Resend } from "resend"

// Initialize Resend
const resend = new Resend(process.env.RESEND_API_KEY)

// Export the asynchronous connect server action
export async function sendConnectionRequest(formData: FormData) {
  // Extract inputs
  const fromName = formData.get("from_name") as string
  const fromEmail = formData.get("from_email") as string
  const message = formData.get("message") as string
  const toMemberId = formData.get("to_member_id") as string
  const goalId = formData.get("goal_id") as string || null

  // Validate inputs
  if (!fromName || !fromEmail || !message || !toMemberId) {
    // Return early on validation failure
    return { error: "Please fill in all required fields." }
  // End validation
  }

  // Use the admin service role to bypass RLS for inserting connection requests from public
  const supabaseAdmin = createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )

  // First securely fetch the target member's email so the client can't spoof it or read it
  const { data: targetMember, error: memberError } = await supabaseAdmin
    .from("members")
    .select("email, name")
    .eq("id", toMemberId)
    .single()

  // Guard against missing members
  if (memberError || !targetMember) {
    // Return generic error
    return { error: "Target member not found." }
  // End guard
  }

  // Insert the connection request into the database
  const { error: insertError } = await supabaseAdmin
    .from("connection_requests")
    .insert({
      from_name: fromName,
      from_email: fromEmail,
      to_member_id: toMemberId,
      goal_id: goalId,
      message
    // Close insert
    })

  // Guard against database insertion failures
  if (insertError) {
    // Return generic error
    return { error: "Failed to save connection request. Please try again." }
  // End guard
  }

  // Optionally fetch goal title if a goal was selected for email context
  let goalContext = ""
  if (goalId) {
    // Fetch title specifically
    const { data: goalData } = await supabaseAdmin.from("goals").select("title").eq("id", goalId).single()
    // Append context if valid
    if (goalData) goalContext = `\n\nRegarding your goal: "${goalData.title}"`
  // End optional context
  }

  // Send the notification email to the member
  try {
    // Use resend
    await resend.emails.send({
      // Provide from fallback
      from: process.env.RESEND_FROM_EMAIL || "notifications@skillers.com",
      // Send to securely fetched email
      to: targetMember.email, 
      // Allow direct reply to the sender
      replyTo: fromEmail, 
      // Compose subject
      subject: `New Connection Request from ${fromName} on Skillers`,
      // HTML payload
      html: `
        <h2>Hi ${targetMember.name},</h2>
        <p>You have received a new connection request via the Skillers Directory!</p>
        <p><strong>From:</strong> ${fromName} (<a href="mailto:${fromEmail}">${fromEmail}</a>)</p>
        ${goalContext ? `<p>${goalContext}</p>` : ""}
        <br />
        <h3>Message:</h3>
        <p style="padding: 12px; background: #f4f4f5; border-radius: 8px;">${message.replace(/\n/g, '<br/>')}</p>
        <br />
        <p>You can reply directly to this email to get in touch with them.</p>
      `
    // Close email options
    })
  // Catch email errors
  } catch (e) {
    // Non fatal, record still saved
    console.error("Failed to send connection email:", e)
  // End catch block
  }

  // Return success explicitly
  return { success: true }
// End action
}
