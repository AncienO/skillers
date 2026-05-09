"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { ChevronDown, ChevronUp, Minus, Plus, Loader2 } from "lucide-react"
import { mutateTokens, getMemberTransactions } from "@/lib/actions/admin.actions"
import { TOKEN_DEFS, TOKEN_FILTERS, playerScore, getTokenTier, type PlayerTokens, type TokenKey } from "@/lib/tokens"

interface Member {
  id: string
  name: string
  avatar_url: string | null
  t1: number
  t2: number
  t3: number
  t4: number
}

interface Transaction {
  id: string
  token_type: string
  qty: number
  type:  string
  reason: string
  created_at: string
}

export default function TokenEditor({ members }: { members: Member[] }) {
  const [expanded, setExpanded]     = useState<string | null>(null)
  const [txMap, setTxMap]           = useState<Record<string, Transaction[]>>({})
  const [localMembers, setLocal]    = useState<Member[]>(members)
  const [pending, startTransition]  = useTransition()
  const [loadingTx, setLoadingTx]   = useState<string | null>(null)
  const [feedback, setFeedback]     = useState<Record<string, string>>({})

  async function toggleExpand(memberId: string) {
    if (expanded === memberId) { setExpanded(null); return }
    setExpanded(memberId)
    if (!txMap[memberId]) {
      setLoadingTx(memberId)
      const { data } = await getMemberTransactions(memberId)
      setTxMap(prev => ({ ...prev, [memberId]: data ?? [] }))
      setLoadingTx(null)
    }
  }

  function handleMutate(member: Member, tokenType: TokenKey, delta: number) {
    const reason = delta > 0
      ? `Admin awarded ${delta} ${TOKEN_DEFS[tokenType].name} token(s)`
      : `Admin deducted ${Math.abs(delta)} ${TOKEN_DEFS[tokenType].name} token(s)`

    startTransition(async () => {
      const result = await mutateTokens(member.id, tokenType, delta, reason)
      if (result.error) {
        setFeedback(prev => ({ ...prev, [member.id]: result.error! }))
        setTimeout(() => setFeedback(prev => { const n = {...prev}; delete n[member.id]; return n }), 3000)
        return
      }
      // Optimistic local update
      setLocal(prev => prev.map(m => m.id === member.id
        ? { ...m, [tokenType]: Math.max(0, m[tokenType] + delta) }
        : m
      ))
      // Refresh transaction log
      const { data } = await getMemberTransactions(member.id)
      setTxMap(prev => ({ ...prev, [member.id]: data ?? [] }))
    })
  }

  return (
    <div className="space-y-3">
      {localMembers.map(member => {
        const tokens: PlayerTokens = { t1: member.t1, t2: member.t2, t3: member.t3, t4: member.t4 }
        const tierKey = getTokenTier(tokens)
        const tier    = TOKEN_DEFS[tierKey]
        const score   = playerScore(tokens)
        const isOpen  = expanded === member.id

        return (
          <div key={member.id} className="bg-white border border-border rounded-2xl overflow-hidden">

            {/* Row header */}
            <button
              onClick={() => toggleExpand(member.id)}
              className="w-full flex items-center gap-4 px-5 py-4 hover:bg-[#F7F8FA] transition-colors text-left"
            >
              {/* Avatar */}
              <div className="w-9 h-9 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-black text-sm overflow-hidden flex-shrink-0">
                {member.avatar_url
                  ? <Image src={member.avatar_url} alt={member.name} width={36} height={36} className="object-cover" />
                  : member.name.charAt(0).toUpperCase()
                }
              </div>

              {/* Name + tier */}
              <div className="flex-1 min-w-0">
                <p className="font-black text-navy-800 text-sm truncate">{member.name}</p>
                <div className="flex items-center gap-1 mt-0.5">
                  <Image
                    src="/ingeniusly-ghana-mark.png"
                    alt={tier.name}
                    width={12}
                    height={12}
                    className="object-contain"
                    style={{ filter: TOKEN_FILTERS[tierKey] }}
                  />
                  <span className={`text-xs font-bold ${tier.color}`}>{tier.name} · {score} pts</span>
                </div>
              </div>

              {/* Mini token counts */}
              <div className="hidden sm:flex gap-2">
                {(["t1","t2","t3","t4"] as const).map(k => (
                  <div key={k} className={`flex flex-col items-center px-2 py-1 rounded-lg border ${TOKEN_DEFS[k].bg} ${TOKEN_DEFS[k].border}`}>
                    <span className={`text-xs font-black ${TOKEN_DEFS[k].color}`}>{tokens[k]}</span>
                    <span className={`text-[9px] font-bold ${TOKEN_DEFS[k].color} opacity-70`}>{TOKEN_DEFS[k].name.slice(0,2)}</span>
                  </div>
                ))}
              </div>

              {isOpen ? <ChevronUp className="w-4 h-4 text-muted flex-shrink-0" /> : <ChevronDown className="w-4 h-4 text-muted flex-shrink-0" />}
            </button>

            {/* Expanded editor */}
            {isOpen && (
              <div className="border-t border-border px-5 py-5">

                {/* Error feedback */}
                {feedback[member.id] && (
                  <p className="text-xs text-red-500 font-bold mb-3">{feedback[member.id]}</p>
                )}

                {/* Token controls */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {(["t1","t2","t3","t4"] as const).map(k => {
                    const def   = TOKEN_DEFS[k]
                    const count = tokens[k]
                    return (
                      <div key={k} className={`rounded-xl p-3 border ${def.bg} ${def.border}`}>
                        <div className="flex items-center gap-1.5 mb-2">
                          <Image
                            src="/ingeniusly-ghana-mark.png"
                            alt={def.name}
                            width={16}
                            height={16}
                            className="object-contain"
                            style={{ filter: TOKEN_FILTERS[k] }}
                          />
                          <span className={`text-xs font-black ${def.color}`}>{def.name}</span>
                        </div>
                        <p className={`text-2xl font-black ${def.color} mb-2`}>{count}</p>
                        <div className="flex gap-1.5">
                          <button
                            disabled={pending || count === 0}
                            onClick={() => handleMutate(member, k, -1)}
                            className="flex-1 flex items-center justify-center h-7 rounded-lg bg-white border border-border hover:border-red-300 hover:text-red-500 transition-colors disabled:opacity-40"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <button
                            disabled={pending}
                            onClick={() => handleMutate(member, k, 1)}
                            className="flex-1 flex items-center justify-center h-7 rounded-lg bg-white border border-border hover:border-green-400 hover:text-green-600 transition-colors disabled:opacity-40"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* Transaction log */}
                <div>
                  <p className="text-xs font-black text-navy-700 mb-2 uppercase tracking-wide">Transaction Log</p>
                  {loadingTx === member.id ? (
                    <div className="flex items-center gap-2 text-muted text-xs py-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading…
                    </div>
                  ) : (txMap[member.id] ?? []).length === 0 ? (
                    <p className="text-xs text-muted py-2">No transactions yet.</p>
                  ) : (
                    <div className="space-y-1.5 max-h-48 overflow-y-auto">
                      {(txMap[member.id] ?? []).map(tx => {
                        const k = tx.token_type as TokenKey
                        const def = TOKEN_DEFS[k]
                        const isAward = tx.qty > 0
                        return (
                          <div key={tx.id} className="flex items-center gap-2 text-xs py-1.5 px-2 rounded-lg bg-[#F7F8FA]">
                            <Image
                              src="/ingeniusly-ghana-mark.png"
                              alt={def.name}
                              width={12}
                              height={12}
                              className="object-contain flex-shrink-0"
                              style={{ filter: TOKEN_FILTERS[k] }}
                            />
                            <span className={`font-black flex-shrink-0 ${isAward ? "text-green-600" : "text-red-500"}`}>
                              {isAward ? "+" : ""}{tx.qty} {def.name}
                            </span>
                            <span className="text-muted truncate flex-1">{tx.reason}</span>
                            <span className="text-muted flex-shrink-0">
                              {new Date(tx.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
