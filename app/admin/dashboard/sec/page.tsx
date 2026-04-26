import { getApprovedMembers } from "@/lib/actions/admin.actions"
import SecManagementTable from "@/components/admin/SecManagementTable"
import { ShieldCheck } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function AdminSecPage() {
  const { data: members } = await getApprovedMembers()

  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <ShieldCheck className="w-7 h-7 text-purple-500" />
          SEC Management
        </h1>
        <p className="text-foreground/60">
          Assign approved members to the Skillers Executive Committee and set their roles. Changes are reflected on the public SEC page immediately.
        </p>
      </div>

      {/* The interactive management table */}
      <SecManagementTable initialMembers={members || []} />

    </div>
  )
}
