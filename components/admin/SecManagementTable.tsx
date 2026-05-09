"use client"

import { useState, useTransition } from "react"
import { toggleSecStatus, updateSecRole } from "@/lib/actions/admin.actions"
import { ShieldCheck, ShieldOff, AlertCircle } from "lucide-react"

const SEC_ROLES = [
  { value: "",                   label: "No Role"              },
  { value: "president",          label: "President"            },
  { value: "vice_president",     label: "Vice President"       },
  { value: "secretary",          label: "Secretary"            },
  { value: "treasurer",          label: "Treasurer"            },
  { value: "events_coordinator", label: "Events Coordinator"   },
  { value: "communications",     label: "Communications"       },
  { value: "member_relations",   label: "Member Relations"     },
]

interface Member {
  id: string
  name: string
  email: string
  is_sec: boolean
  sec_role: string | null
}

export default function SecManagementTable({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleToggle = (id: string, current: boolean) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await toggleSecStatus(id, !current)
      if (result?.error) setError(result.error)
      else setMembers(prev => prev.map(m => m.id === id ? { ...m, is_sec: !current, sec_role: !current ? m.sec_role : null } : m))
      setActingOn(null)
    })
  }

  const handleRoleChange = (id: string, role: string) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await updateSecRole(id, role)
      if (result?.error) setError(result.error)
      else setMembers(prev => prev.map(m => m.id === id ? { ...m, sec_role: role || null } : m))
      setActingOn(null)
    })
  }

  const secMembers     = members.filter(m => m.is_sec)
  const regularMembers = members.filter(m => !m.is_sec)

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Current SEC members */}
      <div>
        <h2 className="text-base font-black text-navy-800 flex items-center gap-2 mb-4">
          <ShieldCheck className="w-4 h-4 text-navy-600" /> Current SEC Members ({secMembers.length})
        </h2>
        {secMembers.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center text-muted text-sm italic">No SEC members assigned yet.</div>
        ) : (
          <div className="space-y-3">
            {secMembers.map(m => (
              <div key={m.id} className="bg-white border-l-4 border-navy-600 border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-navy-800">{m.name}</p>
                  <p className="text-xs text-muted">{m.email}</p>
                </div>
                <div className="flex items-center gap-3">
                  <select
                    value={m.sec_role ?? ""}
                    onChange={e => handleRoleChange(m.id, e.target.value)}
                    disabled={actingOn === m.id}
                    className="text-xs font-semibold text-navy-700 bg-navy-50 border border-navy-200 rounded-lg px-2 py-1.5 outline-none focus:ring-2 focus:ring-navy-400 disabled:opacity-50"
                  >
                    {SEC_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                  </select>
                  <button
                    onClick={() => handleToggle(m.id, true)}
                    disabled={actingOn === m.id}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold disabled:opacity-50 transition-colors"
                  >
                    <ShieldOff className="w-3.5 h-3.5" /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* All approved members */}
      <div>
        <h2 className="text-base font-black text-navy-800 mb-4">All Approved Members ({regularMembers.length})</h2>
        {regularMembers.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center text-muted text-sm italic">All approved members are already in the SEC.</div>
        ) : (
          <div className="space-y-3">
            {regularMembers.map(m => (
              <div key={m.id} className="bg-white border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-navy-800">{m.name}</p>
                  <p className="text-xs text-muted">{m.email}</p>
                </div>
                <button
                  onClick={() => handleToggle(m.id, false)}
                  disabled={actingOn === m.id}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-navy-100 text-navy-700 hover:bg-navy-200 text-sm font-bold disabled:opacity-50 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" />
                  {actingOn === m.id ? "..." : "Add to SEC"}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
