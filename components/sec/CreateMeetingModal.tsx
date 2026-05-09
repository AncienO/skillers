"use client"

import { useState, useTransition } from "react"
import { createGoogleMeetMeeting, createZoomMeeting } from "@/lib/actions/meetings.actions"
import { X, Video, Loader2 } from "lucide-react"

interface Props {
  platform: "google_meet" | "zoom"
  onClose: () => void
  onCreated: () => void
}

export default function CreateMeetingModal({ platform, onClose, onCreated }: Props) {
  const [title, setTitle]           = useState("")
  const [datetime, setDatetime]     = useState("")
  const [error, setError]           = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const isGoogle = platform === "google_meet"

  const handleCreate = () => {
    if (!title.trim() || !datetime) return
    setError(null)

    startTransition(async () => {
      const result = isGoogle
        ? await createGoogleMeetMeeting(title.trim(), datetime)
        : await createZoomMeeting(title.trim(), datetime)

      if (result.error) {
        setError(result.error)
      } else {
        onCreated()
        onClose()
      }
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md mx-4 p-6">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${isGoogle ? "bg-green-100" : "bg-blue-100"}`}>
              <Video className={`w-5 h-5 ${isGoogle ? "text-green-700" : "text-blue-700"}`} />
            </div>
            <div>
              <h2 className="font-black text-navy-800">
                {isGoogle ? "New Google Meet" : "New Zoom Meeting"}
              </h2>
              <p className="text-xs text-muted font-medium">
                {isGoogle ? "Creates a Calendar event with Meet link" : "Creates a Zoom meeting room"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-muted hover:text-navy-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-extrabold text-navy-700 mb-1.5">Meeting Title</label>
            <input
              autoFocus
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Weekly SEC Sync"
              className="w-full px-4 py-3 bg-[#F7F8FA] border border-border rounded-xl text-sm font-medium text-navy-800 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-extrabold text-navy-700 mb-1.5">Date &amp; Time</label>
            <input
              type="datetime-local"
              value={datetime}
              onChange={e => setDatetime(e.target.value)}
              className="w-full px-4 py-3 bg-[#F7F8FA] border border-border rounded-xl text-sm font-medium text-navy-800 focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-600 font-semibold">
            {error}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-xl border-2 border-border text-sm font-bold text-muted hover:border-navy-300 hover:text-navy-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={!title.trim() || !datetime || isPending}
            className={`flex-1 py-3 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              isGoogle ? "bg-green-600 hover:bg-green-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Creating…" : "Create Meeting"}
          </button>
        </div>

      </div>
    </div>
  )
}
