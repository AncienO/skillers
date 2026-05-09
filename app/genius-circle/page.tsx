import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Image from "next/image"
import { Gem, Star, Users } from "lucide-react"

export const dynamic = "force-dynamic"
export const metadata = { title: "Genius Circle – inGeniusly Ghana Skillers" }

export default async function GeniusCirclePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("is_genius_circle, status, name")
    .eq("id", user.id)
    .single()

  if (!member || member.status !== "approved" || !member.is_genius_circle) {
    redirect("/dashboard")
  }

  // Fetch all Genius Circle members
  const { data: gcMembers } = await supabase
    .from("members")
    .select("id, name, avatar_url, bio, tokens")
    .eq("is_genius_circle", true)
    .eq("status", "approved")
    .order("tokens", { ascending: false })

  return (
    <div className="min-h-screen bg-[#F7F8FA] pt-28 pb-20 px-4">
      <div className="max-w-5xl mx-auto">

        {/* Hero */}
        <div className="text-center max-w-2xl mx-auto mb-16">
          <div className="flex justify-center mb-6">
            <div className="w-20 h-20 rounded-full bg-gold-100 border-2 border-gold-300 flex items-center justify-center">
              <Image
                src="/ingeniusly-ghana-mark.png"
                alt="Genius Circle"
                width={48}
                height={48}
                className="object-contain"
                style={{ filter: "brightness(0) saturate(100%) invert(85%) sepia(100%) saturate(900%) hue-rotate(5deg) brightness(1.05)" }}
              />
            </div>
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-100 text-gold-700 text-sm font-black mb-5 border border-gold-200">
            <Star className="w-4 h-4 fill-gold-500" /> Exclusive Access
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-navy-800 mb-4">
            The Genius Circle
          </h1>
          <p className="text-lg text-muted font-medium leading-relaxed">
            Welcome, {member.name}. You&apos;re part of an elite group of inGeniusly Ghana Skillers
            who are pushing the boundaries of what&apos;s possible.
          </p>
        </div>

        {/* Members grid */}
        <div className="mb-10">
          <h2 className="font-black text-navy-800 flex items-center gap-2 mb-5 text-lg">
            <Users className="w-5 h-5 text-gold-600" /> Circle Members ({gcMembers?.length ?? 0})
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
            {gcMembers?.map(m => (
              <div key={m.id} className="bg-white border border-border rounded-2xl p-5 flex flex-col items-center text-center hover:shadow-md transition-shadow">
                <div className="w-14 h-14 rounded-full bg-gold-100 border-2 border-gold-200 overflow-hidden flex items-center justify-center text-gold-700 font-black text-xl mb-3">
                  {m.avatar_url ? (
                    <Image src={m.avatar_url} alt={m.name} width={56} height={56} className="object-cover" />
                  ) : (
                    m.name.charAt(0).toUpperCase()
                  )}
                </div>
                <p className="font-black text-navy-800 text-sm">{m.name}</p>
                <p className="text-xs text-gold-600 font-bold mt-0.5">{(m.tokens ?? 0)} tokens</p>
                {m.bio && (
                  <p className="text-xs text-muted font-medium mt-2 line-clamp-2">{m.bio}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Placeholder content */}
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center mb-4">
              <Gem className="w-5 h-5 text-gold-600" />
            </div>
            <h3 className="font-black text-navy-800 mb-2">Exclusive Resources</h3>
            <p className="text-sm text-muted font-medium">Premium learning materials, tools, and resources curated for Genius Circle members. Coming soon.</p>
          </div>
          <div className="bg-white border border-border rounded-2xl p-6">
            <div className="w-10 h-10 rounded-xl bg-navy-100 flex items-center justify-center mb-4">
              <Star className="w-5 h-5 text-navy-600 fill-navy-600" />
            </div>
            <h3 className="font-black text-navy-800 mb-2">Inner Circle Events</h3>
            <p className="text-sm text-muted font-medium">Private sessions, workshops, and mastermind groups. More details coming from the SEC soon.</p>
          </div>
        </div>

      </div>
    </div>
  )
}
