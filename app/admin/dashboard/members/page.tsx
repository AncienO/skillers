import { getPendingMembers } from "@/lib/actions/admin.actions"
import MemberApprovalTable from "@/components/admin/MemberApprovalTable"

export const dynamic = "force-dynamic"

export default async function AdminMembersPage() {
  const { data: pendingMembers } = await getPendingMembers()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy-800">Member Approvals</h1>
        <p className="text-muted font-medium mt-1">
          Review and approve new sign-ups. Approved members receive an email to sign in.
        </p>
      </div>

      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-100 text-amber-700 text-xs font-black mb-6">
        {pendingMembers?.length ?? 0} pending
      </div>

      <MemberApprovalTable initialMembers={pendingMembers ?? []} />
    </div>
  )
}
