import { getUpcomingMeetings } from "@/lib/actions/meetings.actions"
import MeetingList from "@/components/sec/MeetingList"

export const metadata = { title: "Meetings – SEC Workspace" }

export default async function MeetingsPage() {
  const { data: meetings } = await getUpcomingMeetings()

  return (
    <div className="p-8 max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-navy-800">Meetings</h1>
        <p className="text-muted font-medium mt-1">
          Schedule and join Google Meet or Zoom sessions with the SEC team
        </p>
      </div>

      <MeetingList
        initialMeetings={(meetings ?? []).map(m => ({
          ...m,
          creator: Array.isArray(m.creator) ? (m.creator[0] ?? null) : m.creator,
        })) as Parameters<typeof MeetingList>[0]["initialMeetings"]}
      />
    </div>
  )
}
