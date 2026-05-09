import { createClient } from "@/lib/supabase/server"
import { getStories } from "@/lib/actions/stories.actions"
import StoriesFeed from "@/components/dashboard/StoriesFeed"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: stories } = await getStories()

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-black text-navy-800">Skillers Feed</h1>
        <p className="text-muted font-medium mt-1">Share what you&apos;re working on, building, or achieving.</p>
      </div>

      <StoriesFeed
        initialStories={(stories ?? []).map(s => ({
          ...s,
          member: Array.isArray(s.member) ? (s.member[0] ?? null) : s.member,
        })) as Parameters<typeof StoriesFeed>[0]["initialStories"]}
        currentUserId={user?.id ?? ""}
      />
    </div>
  )
}
