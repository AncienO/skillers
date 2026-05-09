import { getMembersWithTokens } from "@/lib/actions/admin.actions"
import TokenEditor from "@/components/admin/TokenEditor"

export const dynamic = "force-dynamic"

export default async function TokensPage() {
  const { data: members } = await getMembersWithTokens()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-black text-navy-800">Token Management</h1>
        <p className="text-sm text-muted font-medium mt-1">
          Award or deduct specific token types per skiller. Every change is logged.
        </p>
      </div>

      <TokenEditor members={members ?? []} />
    </div>
  )
}
