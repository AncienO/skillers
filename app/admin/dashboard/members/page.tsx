import { getPendingMembers } from "@/lib/actions/admin.actions"
import MemberApprovalTable from "@/components/admin/MemberApprovalTable"
import { Users } from "lucide-react"

// Force dynamic rendering — admin always sees fresh data
export const dynamic = "force-dynamic"

export default async function AdminMembersPage() {
  // Fetch pending members from the database
  const { data: pendingMembers } = await getPendingMembers()

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Users className="w-7 h-7 text-amber-500" />
          Member Approvals
        </h1>
        <p className="text-foreground/60">
          Review and approve new sign-ups. Approved members will receive an email notification to sign in.
        </p>
      </div>

      {/* Pending count badge */}
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-sm font-bold">
        {pendingMembers?.length || 0} pending
      </div>

      {/* The interactive approval table */}
      <MemberApprovalTable initialMembers={pendingMembers || []} />

    </div>
  )
}
