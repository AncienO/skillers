import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTokenTier, playerScore, TOKEN_DEFS, TOKEN_FILTERS, type PlayerTokens } from "@/lib/tokens"
import Image from "next/image"
import Link from "next/link"
import { Edit3 } from "lucide-react"

export const dynamic = "force-dynamic"

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("id, name, bio, avatar_url, t1, t2, t3, t4, sec_role, is_sec, is_genius_circle, slug, created_at")
    .eq("id", user.id)
    .single()

  if (!member) redirect("/login")

  const tokens: PlayerTokens = { t1: member.t1 ?? 0, t2: member.t2 ?? 0, t3: member.t3 ?? 0, t4: member.t4 ?? 0 }
  const tierKey = getTokenTier(tokens)
  const tier    = TOKEN_DEFS[tierKey]
  const score   = playerScore(tokens)

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-black text-navy-800">My Profile</h1>
        <Link
          href="/directory/edit"
          className="flex items-center gap-2 px-4 py-2 bg-navy-600 text-white text-sm font-bold rounded-xl hover:bg-navy-700 transition-colors"
        >
          <Edit3 className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* Profile card */}
      <div className="bg-white border border-border rounded-2xl p-6 mb-6">
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="w-20 h-20 rounded-full bg-navy-100 overflow-hidden flex items-center justify-center text-navy-600 font-black text-2xl">
              {member.avatar_url ? (
                <Image src={member.avatar_url} alt={member.name} width={80} height={80} className="object-cover" />
              ) : (
                member.name.charAt(0).toUpperCase()
              )}
            </div>
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full p-0.5 border border-border">
              <Image
                src="/ingeniusly-ghana-mark.png"
                alt={tier.name}
                width={20}
                height={20}
                className="object-contain w-full h-full"
                style={{ filter: TOKEN_FILTERS[tierKey] }}
              />
            </div>
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-black text-navy-800">{member.name}</h2>
            {member.is_sec && member.sec_role && (
              <p className="text-sm font-bold text-gold-600 capitalize">{member.sec_role.replace(/_/g, " ")}</p>
            )}
            {member.is_genius_circle && (
              <span className="inline-flex items-center gap-1 text-xs font-black text-gold-700 bg-gold-100 px-2 py-0.5 rounded-full mt-1">
                Genius Circle
              </span>
            )}
          </div>
        </div>

        {member.bio && (
          <p className="text-sm font-medium text-muted mt-4 leading-relaxed">{member.bio}</p>
        )}
      </div>

      {/* Token balance */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-black text-navy-800">Token Balance</h3>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${tier.bg} ${tier.border}`}>
            <Image
              src="/ingeniusly-ghana-mark.png"
              alt={tier.name}
              width={16}
              height={16}
              className="object-contain"
              style={{ filter: TOKEN_FILTERS[tierKey] }}
            />
            <span className={`text-xs font-black ${tier.color}`}>{tier.name} Tier</span>
          </div>
        </div>

        <p className="text-4xl font-black text-navy-800 mb-5">
          {score.toLocaleString()}
          <span className="text-base font-semibold text-muted ml-2">pts</span>
        </p>

        {/* Per-type breakdown */}
        <div className="grid grid-cols-4 gap-3">
          {(["t1", "t2", "t3", "t4"] as const).map(k => {
            const def   = TOKEN_DEFS[k]
            const count = tokens[k]
            return (
              <div key={k} className={`rounded-xl p-3 border ${def.bg} ${def.border} flex flex-col items-center gap-1`}>
                <Image
                  src="/ingeniusly-ghana-mark.png"
                  alt={def.name}
                  width={28}
                  height={28}
                  className="object-contain"
                  style={{ filter: TOKEN_FILTERS[k] }}
                />
                <span className={`text-xl font-black ${def.color}`}>{count}</span>
                <span className={`text-xs font-bold ${def.color} opacity-80`}>{def.name}</span>
                <span className="text-[10px] text-muted font-semibold">{def.val} pt each</span>
              </div>
            )
          })}
        </div>

        <p className="text-xs text-muted font-medium mt-4 text-center">
          Score = (Bronze×1) + (Silver×2) + (Gold×3) + (Diamond×5) &mdash; updated by admin
        </p>
      </div>
    </div>
  )
}
