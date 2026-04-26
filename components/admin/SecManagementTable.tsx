"use client"

import { useState, useTransition } from "react"
import { toggleSecStatus, updateSecRole } from "@/lib/actions/admin.actions"
import { ShieldCheck, ShieldOff, AlertCircle } from "lucide-react"

// SEC role options
const SEC_ROLES = [
  { value: "", label: "No Role" },
  { value: "president", label: "President" },
  { value: "vice_president", label: "Vice President" },
  { value: "secretary", label: "Secretary" },
  { value: "treasurer", label: "Treasurer" },
  { value: "events_coordinator", label: "Events Coordinator" },
  { value: "communications", label: "Communications" },
  { value: "member_relations", label: "Member Relations" },
]

interface Member {
  id: string
  name: string
  email: string
  is_sec: boolean
  sec_role: string | null
}

interface SecManagementTableProps {
  initialMembers: Member[]
}

export default function SecManagementTable({ initialMembers }: SecManagementTableProps) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  // Toggle SEC membership
  const handleToggle = (id: string, currentStatus: boolean) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await toggleSecStatus(id, !currentStatus)
      if (result?.error) {
        setError(result.error)
      } else {
        setMembers(prev =>
          prev.map(m => m.id === id ? { ...m, is_sec: !currentStatus, sec_role: !currentStatus ? m.sec_role : null } : m)
        )
      }
      setActingOn(null)
    })
  }

  // Update role
  const handleRoleChange = (id: string, role: string) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await updateSecRole(id, role)
      if (result?.error) {
        setError(result.error)
      } else {
        setMembers(prev =>
          prev.map(m => m.id === id ? { ...m, sec_role: role || null } : m)
        )
      }
      setActingOn(null)
    })
  }

  // Split into SEC members and non-SEC members
  const secMembers = members.filter(m => m.is_sec)
  const regularMembers = members.filter(m => !m.is_sec)

  return (
    <div className="space-y-8">
      {/* Error banner */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Current SEC Members */}
      <div>
        <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-purple-500" />
          Current SEC Members ({secMembers.length})
        </h2>
        {secMembers.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-foreground/50 italic">
            No SEC members assigned yet.
          </div>
        ) : (
          <div className="space-y-3">
            {secMembers.map(member => (
              <div key={member.id} className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-l-4 border-purple-500">
                {/* Member info */}
                <div className="min-w-0">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-foreground/50">{member.email}</p>
                </div>
                {/* Controls */}
                <div className="flex items-center gap-3 flex-shrink-0">
                  {/* Role selector */}
                  <select
                    value={member.sec_role || ""}
                    onChange={(e) => handleRoleChange(member.id, e.target.value)}
                    disabled={actingOn === member.id}
                    className="px-3 py-2 bg-surface border border-border rounded-lg text-sm outline-none focus:ring-2 focus:ring-purple-500/50 disabled:opacity-50"
                  >
                    {SEC_ROLES.map(r => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                  {/* Remove from SEC */}
                  <button
                    onClick={() => handleToggle(member.id, true)}
                    disabled={actingOn === member.id}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 transition-colors text-sm font-medium disabled:opacity-50"
                  >
                    <ShieldOff className="w-4 h-4" />
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All Approved Members — add to SEC */}
      <div>
        <h2 className="text-lg font-bold mb-4">All Approved Members ({regularMembers.length})</h2>
        {regularMembers.length === 0 ? (
          <div className="glass-panel p-8 rounded-2xl text-center text-foreground/50 italic">
            All approved members are already in the SEC.
          </div>
        ) : (
          <div className="space-y-3">
            {regularMembers.map(member => (
              <div key={member.id} className="glass-panel p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="font-semibold">{member.name}</p>
                  <p className="text-xs text-foreground/50">{member.email}</p>
                </div>
                <button
                  onClick={() => handleToggle(member.id, false)}
                  disabled={actingOn === member.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 hover:bg-purple-500/20 transition-colors text-sm font-medium disabled:opacity-50 flex-shrink-0"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {actingOn === member.id ? "..." : "Add to SEC"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
