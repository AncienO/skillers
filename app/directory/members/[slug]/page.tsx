import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import ConnectForm from "@/components/forms/ConnectForm"
import { ArrowLeft, Target, Tag, ShieldCheck } from "lucide-react"

interface MemberGoal {
  id: string
  title: string
  description: string | null
}

interface MemberTag {
  id: string
  label: string
}

interface MemberProfileProps {
  params: Promise<{ slug: string }>
}

export default async function MemberProfilePage({ params }: MemberProfileProps) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: member, error } = await supabase
    .from("members")
    .select(`
      id, name, slug, avatar_url, bio, sec_role, is_sec,
      goals ( id, title, description ),
      tags ( id, label )
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .maybeSingle()

  if (error || !member) notFound()

  return (
    <main className="min-h-screen bg-surface-alt pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto animate-fade-in">

        {/* Back link */}
        <Link
          href="/directory"
          className="inline-flex items-center gap-2 text-sm font-bold text-muted hover:text-navy-600 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Profile card */}
        <div className="card overflow-hidden">

          {/* Top banner */}
          <div className="h-28 bg-gradient-to-r from-navy-600 to-navy-400 w-full" />

          <div className="px-8 pb-10">

            {/* Avatar row */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-14 mb-8">
              <div className="w-28 h-28 rounded-2xl bg-white border-4 border-white shadow-lg flex items-center justify-center text-3xl font-black text-navy-600 overflow-hidden flex-shrink-0 relative z-10">
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0).toUpperCase()
                )}
              </div>
              <ConnectForm memberId={member.id} memberName={member.name} goals={member.goals || []} />
            </div>

            {/* Name / bio */}
            <div className="mb-10">
              <h1 className="text-3xl font-black text-navy-600 mb-2 flex items-center gap-3 flex-wrap">
                {member.name}
                {member.is_sec && (
                  <span className="text-sm font-extrabold text-gold-700 bg-gold-100 border border-gold-200 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {member.sec_role?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                )}
              </h1>
              {member.bio && (
                <p className="text-lg text-muted font-medium leading-relaxed max-w-3xl">
                  {member.bio}
                </p>
              )}
            </div>

            {/* Goals + Tags grid */}
            <div className="grid md:grid-cols-3 gap-8">

              {/* Goals (2/3) */}
              <div className="md:col-span-2 space-y-4">
                <h2 className="text-lg font-black text-navy-600 flex items-center gap-2 pb-2 border-b border-border">
                  <Target className="w-5 h-5 text-gold-500" /> Current Goals
                </h2>
                {member.goals?.length > 0 ? (
                  (member.goals as MemberGoal[]).map((goal) => (
                    <div key={goal.id} className="bg-navy-50 border border-navy-100 p-5 rounded-xl hover:border-navy-200 transition-colors">
                      <h3 className="font-extrabold text-navy-600 mb-1.5">{goal.title}</h3>
                      {goal.description && (
                        <p className="text-muted font-medium text-sm leading-relaxed">{goal.description}</p>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-muted italic font-medium">No goals showcased yet.</p>
                )}
              </div>

              {/* Tags (1/3) */}
              <div>
                <h2 className="text-lg font-black text-navy-600 flex items-center gap-2 pb-2 border-b border-border mb-4">
                  <Tag className="w-5 h-5 text-gold-500" /> Expertise &amp; Interests
                </h2>
                <div className="flex flex-wrap gap-2">
                  {member.tags?.length > 0 ? (
                    (member.tags as MemberTag[]).map((tag) => (
                      <span key={tag.id} className="px-3 py-1.5 bg-navy-50 border border-navy-100 rounded-lg text-sm font-bold text-navy-600">
                        {tag.label}
                      </span>
                    ))
                  ) : (
                    <p className="text-muted italic font-medium text-sm">No tags selected.</p>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>

      </div>
    </main>
  )
}
