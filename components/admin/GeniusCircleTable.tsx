"use client"

import { useState, useTransition } from "react"
import { toggleGeniusCircle } from "@/lib/actions/admin.actions"
import { Star, AlertCircle, CheckCircle } from "lucide-react"

interface Member {
  id: string
  name: string
  email: string
  is_genius_circle: boolean
  genius_circle_requested: boolean
}

export default function GeniusCircleTable({ initialMembers }: { initialMembers: Member[] }) {
  const [members, setMembers] = useState<Member[]>(initialMembers)
  const [actingOn, setActingOn] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [, startTransition] = useTransition()

  const handleToggle = (id: string, current: boolean) => {
    setActingOn(id)
    setError(null)
    startTransition(async () => {
      const result = await toggleGeniusCircle(id, !current)
      if (result?.error) setError(result.error)
      else setMembers(prev => prev.map(m => m.id === id ? { ...m, is_genius_circle: !current } : m))
      setActingOn(null)
    })
  }

  const approved  = members.filter(m => m.is_genius_circle)
  const requested = members.filter(m => !m.is_genius_circle && m.genius_circle_requested)
  const others    = members.filter(m => !m.is_genius_circle && !m.genius_circle_requested)

  const MemberRow = ({ m, showGrant = true }: { m: Member; showGrant?: boolean }) => (
    <div className="bg-white border border-border rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-gold-100 text-gold-700 flex items-center justify-center font-black text-sm flex-shrink-0">
          {m.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <p className="font-bold text-navy-800">{m.name}</p>
          <p className="text-xs text-muted">{m.email}</p>
        </div>
      </div>
      <div className="flex gap-2">
        {showGrant ? (
          <button
            onClick={() => handleToggle(m.id, false)}
            disabled={actingOn === m.id}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gold-100 text-gold-700 hover:bg-gold-200 text-sm font-bold disabled:opacity-50 transition-colors"
          >
            <Star className="w-4 h-4 fill-gold-500 text-gold-500" />
            {actingOn === m.id ? "..." : "Grant Access"}
          </button>
        ) : (
          <button
            onClick={() => handleToggle(m.id, true)}
            disabled={actingOn === m.id}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-100 text-xs font-bold disabled:opacity-50 transition-colors"
          >
            {actingOn === m.id ? "..." : "Revoke"}
          </button>
        )}
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" /> {error}
        </div>
      )}

      {/* Requested access */}
      <div>
        <h2 className="text-base font-black text-navy-800 flex items-center gap-2 mb-4">
          <Star className="w-4 h-4 text-gold-500 fill-gold-500" /> Requested Access ({requested.length})
        </h2>
        {requested.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center text-muted text-sm italic">No pending Genius Circle requests.</div>
        ) : (
          <div className="space-y-3">
            {requested.map(m => <MemberRow key={m.id} m={m} showGrant={true} />)}
          </div>
        )}
      </div>

      {/* Current Genius Circle members */}
      <div>
        <h2 className="text-base font-black text-navy-800 flex items-center gap-2 mb-4">
          <CheckCircle className="w-4 h-4 text-green-600" /> Genius Circle Members ({approved.length})
        </h2>
        {approved.length === 0 ? (
          <div className="bg-white border border-border rounded-2xl p-8 text-center text-muted text-sm italic">No Genius Circle members yet.</div>
        ) : (
          <div className="space-y-3">
            {approved.map(m => <MemberRow key={m.id} m={m} showGrant={false} />)}
          </div>
        )}
      </div>

      {/* Other approved members (manual grant) */}
      {others.length > 0 && (
        <div>
          <h2 className="text-base font-black text-navy-800 mb-4">Other Approved Members ({others.length})</h2>
          <div className="space-y-3">
            {others.map(m => <MemberRow key={m.id} m={m} showGrant={true} />)}
          </div>
        </div>
      )}
    </div>
  )
}
