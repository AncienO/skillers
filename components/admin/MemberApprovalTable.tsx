"use client"

// Import React hooks
import { useState, useTransition } from "react"
// Import server actions
import { approveMember, rejectMember } from "@/lib/actions/admin.actions"
// Import Lucide icons
import { CheckCircle, XCircle, Clock, Mail, AlertCircle } from "lucide-react"

// Define the member type
interface PendingMember {
  id: string
  name: string
  email: string
  slug: string
  created_at: string
}

// Props
interface MemberApprovalTableProps {
  initialMembers: PendingMember[]
}

// Export default client component
export default function MemberApprovalTable({ initialMembers }: MemberApprovalTableProps) {
  // Track members in local state so we can remove them on action
  const [members, setMembers] = useState<PendingMember[]>(initialMembers)
  // Track which member is being acted on
  const [actingOn, setActingOn] = useState<string | null>(null)
  // Error state
  const [error, setError] = useState<string | null>(null)
  // Transition
  const [isPending, startTransition] = useTransition()

  // Handle approve
  const handleApprove = (id: string) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await approveMember(id)
      if (result?.error) {
        setError(result.error)
      } else {
        // Remove from local list
        setMembers(prev => prev.filter(m => m.id !== id))
      }
      setActingOn(null)
    })
  }

  // Handle reject
  const handleReject = (id: string) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await rejectMember(id)
      if (result?.error) {
        setError(result.error)
      } else {
        // Remove from local list
        setMembers(prev => prev.filter(m => m.id !== id))
      }
      setActingOn(null)
    })
  }

  // Empty state
  if (members.length === 0) {
    return (
      <div className="glass-panel p-12 rounded-2xl text-center">
        <CheckCircle className="w-12 h-12 text-emerald-500 mx-auto mb-4" />
        <h3 className="text-xl font-bold mb-2">All caught up!</h3>
        <p className="text-foreground/60">No pending approvals at this time.</p>
      </div>
    )
  }

  // Render table
  return (
    <div className="space-y-4">
      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Member cards */}
      {members.map((member) => {
        const isActing = actingOn === member.id
        const dateStr = new Date(member.created_at).toLocaleDateString("en-US", {
          month: "short", day: "numeric", year: "numeric"
        })

        return (
          <div
            key={member.id}
            className="glass-panel p-5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:border-brand-300/30 transition-all"
          >
            {/* Member info */}
            <div className="flex-grow min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-9 h-9 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold text-sm flex-shrink-0">
                  {member.email.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold truncate">{member.email}</p>
                  <div className="flex items-center gap-2 text-xs text-foreground/50">
                    <Clock className="w-3 h-3" />
                    <span>Applied {dateStr}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => handleApprove(member.id)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 transition-colors text-sm font-medium disabled:opacity-50"
              >
                <CheckCircle className="w-4 h-4" />
                {isActing ? "..." : "Approve"}
              </button>
              <button
                onClick={() => handleReject(member.id)}
                disabled={isActing}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
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
