import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { getTokenTier, TOKEN_TIERS } from "@/lib/tokens"
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
    .select("id, name, bio, avatar_url, tokens, sec_role, is_sec, is_genius_circle, slug, created_at")
    .eq("id", user.id)
    .single()

  if (!member) redirect("/login")

  const tier = getTokenTier(member.tokens ?? 0)
  const nextTier = TOKEN_TIERS.find(t => (member.tokens ?? 0) < t.min)
  const progress = nextTier
    ? Math.min(100, ((member.tokens ?? 0) - tier.min) / (nextTier.min - tier.min) * 100)
    : 100

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
            <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-white rounded-full p-0.5">
              <Image
                src="/ingeniusly-ghana-mark.png"
                alt={tier.label}
                width={20}
                height={20}
                className="object-contain w-full h-full"
                style={{ filter: tier.filter }}
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
                ⭐ Genius Circle
              </span>
            )}
          </div>
        </div>

        {member.bio && (
          <p className="text-sm font-medium text-muted mt-4 leading-relaxed">{member.bio}</p>
        )}
      </div>

      {/* Token progress */}
      <div className="bg-white border border-border rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black text-navy-800">Token Balance</h3>
          <div className="flex items-center gap-2">
            <Image
              src="/ingeniusly-ghana-mark.png"
              alt={tier.label}
              width={24}
              height={24}
              className="object-contain"
              style={{ filter: tier.filter }}
            />
            <span className={`text-sm font-black ${tier.color}`}>{tier.label}</span>
          </div>
        </div>

        <p className="text-3xl font-black text-navy-800 mb-4">{(member.tokens ?? 0).toLocaleString()} <span className="text-base font-semibold text-muted">tokens</span></p>

        {/* Progress bar to next tier */}
        {nextTier && (
          <div>
            <div className="flex justify-between text-xs font-semibold text-muted mb-1.5">
              <span>{tier.label} · {member.tokens ?? 0} tokens</span>
              <span>{nextTier.label} · {nextTier.min} tokens</span>
            </div>
            <div className="h-2 bg-[#F7F8FA] rounded-full overflow-hidden border border-border">
              <div
                className="h-full bg-gradient-to-r from-navy-400 to-gold-500 rounded-full transition-all"
                style={{ width: `${progress}%` }}
              />
            </div>
            <p className="text-xs text-muted font-medium mt-1.5">{nextTier.min - (member.tokens ?? 0)} tokens to {nextTier.label}</p>
          </div>
        )}

        {/* Tier legend */}
        <div className="grid grid-cols-2 gap-3 mt-6">
          {TOKEN_TIERS.map(t => (
            <div key={t.label} className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#F7F8FA]">
              <Image
                src="/ingeniusly-ghana-mark.png"
                alt={t.label}
                width={20}
                height={20}
                className="object-contain"
                style={{ filter: t.filter }}
              />
              <div>
                <p className={`text-xs font-black ${t.color}`}>{t.label}</p>
                <p className="text-xs text-muted">{t.min}{t.max ? `–${t.max}` : "+"} tokens</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
