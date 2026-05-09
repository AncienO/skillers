import { getWorkspaceDashboard } from "@/lib/actions/workspace.actions"
import { CheckSquare, Video, Users, MessageSquare, ExternalLink } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "zoom") {
    return <span className="text-xs font-black px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Zoom</span>
  }
  return <span className="text-xs font-black px-2 py-0.5 rounded-full bg-green-100 text-green-700">Meet</span>
}

export default async function WorkspaceDashboard() {
  const raw = await getWorkspaceDashboard()

  // Normalise Supabase join arrays → single objects
  const upcomingMeetings = raw.upcomingMeetings
  const secMembers       = raw.secMembers
  const recentMessages   = raw.recentMessages.map((m: {
    id: string; content: string; created_at: string
    member: { name: string; avatar_url: string | null } | { name: string; avatar_url: string | null }[] | null
  }) => ({
    ...m,
    member: Array.isArray(m.member) ? (m.member[0] ?? null) : m.member,
  }))
  const { openTasks, totalTasks } = raw

  const nextMeeting = upcomingMeetings[0]

  return (
    <div className="p-8 max-w-6xl">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-black text-navy-800">Good work, SEC 👋</h1>
        <p className="text-muted font-medium mt-1">Here&apos;s your workspace overview.</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
            <CheckSquare className="w-5 h-5 text-gold-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-navy-700">{openTasks}</p>
            <p className="text-sm text-muted font-semibold">Open Tasks</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
            <Video className="w-5 h-5 text-navy-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-navy-700">{upcomingMeetings.length}</p>
            <p className="text-sm text-muted font-semibold">Upcoming Meetings</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center">
            <Users className="w-5 h-5 text-navy-600" />
          </div>
          <div>
            <p className="text-2xl font-black text-navy-700">{secMembers.length}</p>
            <p className="text-sm text-muted font-semibold">SEC Members</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Next Meeting */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-navy-800 flex items-center gap-2">
              <Video className="w-4 h-4 text-gold-500" /> Next Meeting
            </h2>
            <Link href="/sec/workspace/meetings" className="text-xs font-bold text-navy-500 hover:text-navy-700">
              View all →
            </Link>
          </div>

          {nextMeeting ? (
            <div className="bg-[#F7F8FA] rounded-xl p-4">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="font-bold text-navy-700">{nextMeeting.title}</p>
                <PlatformIcon platform={nextMeeting.platform} />
              </div>
              <p className="text-sm text-muted font-medium mb-3">
                {new Date(nextMeeting.scheduled_at).toLocaleString("en-GB", {
                  weekday: "short", day: "numeric", month: "short",
                  hour: "2-digit", minute: "2-digit",
                })}
              </p>
              {nextMeeting.meeting_url && (
                <a
                  href={nextMeeting.meeting_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-bold text-white bg-navy-600 hover:bg-navy-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Join <ExternalLink className="w-3.5 h-3.5" />
                </a>
              )}
            </div>
          ) : (
            <p className="text-muted italic text-sm">No upcoming meetings scheduled.</p>
          )}
        </div>

        {/* Recent Messages */}
        <div className="bg-white rounded-2xl border border-border p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-black text-navy-800 flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-gold-500" /> Recent Messages
            </h2>
            <Link href="/sec/workspace/messages" className="text-xs font-bold text-navy-500 hover:text-navy-700">
              Open chat →
            </Link>
          </div>

          <div className="space-y-3">
            {recentMessages.length === 0 && (
              <p className="text-muted italic text-sm">No messages yet. Start the conversation!</p>
            )}
            {[...recentMessages].reverse().map((msg: {
              id: string
              content: string
              created_at: string
              member: { name: string; avatar_url: string | null } | null
            }) => (
              <div key={msg.id} className="flex items-start gap-3">
                <div className="w-7 h-7 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-black text-xs flex-shrink-0 overflow-hidden">
                  {msg.member?.avatar_url ? (
                    <Image src={msg.member.avatar_url} alt={msg.member.name} width={28} height={28} className="object-cover" />
                  ) : (
                    msg.member?.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-extrabold text-navy-600">{msg.member?.name} </span>
                  <span className="text-xs text-muted font-medium line-clamp-1">{msg.content}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SEC Team */}
        <div className="bg-white rounded-2xl border border-border p-6 lg:col-span-2">
          <h2 className="font-black text-navy-800 flex items-center gap-2 mb-4">
            <Users className="w-4 h-4 text-gold-500" /> SEC Team
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {secMembers.map((m: { id: string; name: string; avatar_url: string | null; sec_role: string | null }) => (
              <div key={m.id} className="flex flex-col items-center text-center gap-2">
                <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-black text-lg overflow-hidden">
                  {m.avatar_url ? (
                    <Image src={m.avatar_url} alt={m.name} width={48} height={48} className="object-cover" />
                  ) : (
                    m.name.charAt(0).toUpperCase()
                  )}
                </div>
                <div>
                  <p className="text-xs font-bold text-navy-700 leading-tight">{m.name}</p>
                  <p className="text-xs text-gold-600 font-semibold capitalize leading-tight">
                    {m.sec_role?.replace(/_/g, " ") ?? "SEC Member"}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
