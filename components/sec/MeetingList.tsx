"use client"

import { useState, useTransition } from "react"
import { deleteMeeting } from "@/lib/actions/meetings.actions"
import CreateMeetingModal from "./CreateMeetingModal"
import { ExternalLink, Trash2, Video, Plus } from "lucide-react"
import { useRouter } from "next/navigation"

interface Meeting {
  id: string
  title: string
  scheduled_at: string
  platform: "google_meet" | "zoom"
  meeting_url: string | null
  creator: { name: string } | null
}

interface Props {
  initialMeetings: Meeting[]
}

export default function MeetingList({ initialMeetings }: Props) {
  const [meetings, setMeetings]     = useState<Meeting[]>(initialMeetings)
  const [modal, setModal]           = useState<"google_meet" | "zoom" | null>(null)
  const [isPending, startTransition] = useTransition()
  const router = useRouter()

  const handleDelete = (id: string) => {
    setMeetings(prev => prev.filter(m => m.id !== id))
    startTransition(async () => { await deleteMeeting(id) })
  }

  const handleCreated = () => {
    router.refresh()
  }

  const formatDateTime = (iso: string) =>
    new Date(iso).toLocaleString("en-GB", {
      weekday: "short", day: "numeric", month: "short",
      hour: "2-digit", minute: "2-digit",
    })

  return (
    <>
      {/* Create buttons */}
      <div className="flex gap-3 mb-8">
        <button
          onClick={() => setModal("google_meet")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Google Meet
        </button>
        <button
          onClick={() => setModal("zoom")}
          className="flex items-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Zoom Meeting
        </button>
      </div>

      {/* Meeting cards */}
      {meetings.length === 0 ? (
        <div className="border-2 border-dashed border-border rounded-2xl p-12 text-center">
          <Video className="w-10 h-10 text-muted mx-auto mb-3" />
          <p className="font-bold text-muted">No upcoming meetings</p>
          <p className="text-sm text-muted mt-1">Create a Google Meet or Zoom to get started</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {meetings.map(meeting => {
            const isGoogle = meeting.platform === "google_meet"
            return (
              <div key={meeting.id} className="bg-white border border-border rounded-2xl p-5 hover:shadow-md transition-shadow group">

                {/* Platform badge */}
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-black mb-3 ${
                  isGoogle ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"
                }`}>
                  <Video className="w-3 h-3" />
                  {isGoogle ? "Google Meet" : "Zoom"}
                </div>

                <h3 className="font-black text-navy-800 mb-1 leading-tight">{meeting.title}</h3>
                <p className="text-sm text-muted font-medium mb-1">{formatDateTime(meeting.scheduled_at)}</p>
                {meeting.creator && (
                  <p className="text-xs text-muted mb-4">Created by {meeting.creator.name}</p>
                )}

                <div className="flex items-center justify-between pt-3 border-t border-border">
                  {meeting.meeting_url ? (
                    <a
                      href={meeting.meeting_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-1.5 text-sm font-bold text-white px-4 py-2 rounded-lg transition-colors ${
                        isGoogle ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
                      }`}
                    >
                      Join <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  ) : (
                    <span className="text-xs text-muted italic">No link</span>
                  )}
                  <button
                    onClick={() => handleDelete(meeting.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 p-1"
                    disabled={isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

              </div>
            )
          })}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <CreateMeetingModal
          platform={modal}
          onClose={() => setModal(null)}
          onCreated={handleCreated}
        />
      )}
    </>
  )
}
