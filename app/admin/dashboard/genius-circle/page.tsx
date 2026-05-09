import { getGeniusCircleMembers } from "@/lib/actions/admin.actions"
import GeniusCircleTable from "@/components/admin/GeniusCircleTable"

export const dynamic = "force-dynamic"

export default async function AdminGeniusCirclePage() {
  const { data: members } = await getGeniusCircleMembers()

  return (
    <div className="max-w-4xl">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy-800">Genius Circle</h1>
        <p className="text-muted font-medium mt-1">
          Approve or revoke Genius Circle access for members who requested it.
        </p>
      </div>
      <GeniusCircleTable initialMembers={members ?? []} />
    </div>
  )
}
