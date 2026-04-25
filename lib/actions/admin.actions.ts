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
