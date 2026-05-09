import { createClient } from "@/lib/supabase/server"
import { getRecentMessages } from "@/lib/actions/workspace.actions"
import MessageFeed from "@/components/sec/MessageFeed"

export const metadata = { title: "Messages – SEC Workspace" }

export default async function MessagesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: messages } = await getRecentMessages(100)

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="px-6 py-5 border-b border-border bg-white flex-shrink-0">
        <h1 className="text-xl font-black text-navy-800">SEC Messages</h1>
        <p className="text-sm text-muted font-medium">Real-time group chat for the Executive Council</p>
      </div>

      {/* Chat — takes remaining height */}
      <div className="flex-1 overflow-hidden">
        <MessageFeed
          initialMessages={(messages ?? []).map(m => ({
            ...m,
            member: Array.isArray(m.member) ? (m.member[0] ?? null) : m.member,
          })) as Parameters<typeof MessageFeed>[0]["initialMessages"]}
          currentUserId={user?.id ?? ""}
        />
      </div>
    </div>
  )
}
