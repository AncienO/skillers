"use client"

import { useState, useTransition } from "react"
import { approveMember, rejectMember } from "@/lib/actions/admin.actions"
import { CheckCircle, XCircle, Clock, AlertCircle, Star } from "lucide-react"

interface PendingMember {
  id: string
  name: string
  email: string
  slug: string
  created_at: string
  genius_circle_requested?: boolean
}

export default function MemberApprovalTable({ initialMembers }: { initialMembers: PendingMember[] }) {
  const [members, setMembers] = useState<PendingMember[]>(initialMembers)
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleApprove = (id: string) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await approveMember(id)
      if (result?.error) setError(result.error)
      else setMembers(prev => prev.filter(m => m.id !== id))
      setActingOn(null)
    })
  }

  const handleReject = (id: string) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await rejectMember(id)
      if (result?.error) setError(result.error)
      else setMembers(prev => prev.filter(m => m.id !== id))
      setActingOn(null)
    })
  }

  if (members.length === 0) {
    return (
      <div className="bg-white border border-border rounded-2xl p-12 text-center">
        <CheckCircle className="w-10 h-10 text-green-500 mx-auto mb-3" />
        <p className="font-black text-navy-700">All caught up!</p>
        <p className="text-sm text-muted mt-1">No pending approvals right now.</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {members.map((member) => {
        const isActing = actingOn === member.id
        const date = new Date(member.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })

        return (
          <div key={member.id} className="bg-white border border-border rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-navy-100 text-navy-600 flex items-center justify-center font-black text-sm flex-shrink-0">
                {member.email.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-navy-800">{member.email}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-muted font-medium flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Applied {date}
                  </span>
                  {member.genius_circle_requested && (
                    <span className="text-xs font-black text-gold-700 flex items-center gap-1 bg-gold-100 px-2 py-0.5 rounded-full">
                      <Star className="w-3 h-3 fill-gold-500 text-gold-500" /> Genius Circle
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleApprove(member.id)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-100 text-green-700 hover:bg-green-200 transition-colors text-sm font-bold disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isActing ? "..." : "Approve"}
              </button>
              <button
                onClick={() => handleReject(member.id)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 transition-colors text-sm font-bold disabled:opacity-50"
              >
                <XCircle className="w-4 h-4" />
                {isActing ? "..." : "Reject"}
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
