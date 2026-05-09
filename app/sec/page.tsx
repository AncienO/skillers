import type { Metadata } from "next"
import { getSecMembers } from "@/lib/actions/sec.actions"
import Link from "next/link"
import Image from "next/image"
import SecContactForm from "@/components/forms/SecContactForm"
import { ShieldCheck, Target, ArrowRight } from "lucide-react"

export const metadata: Metadata = {
  title: "Meet the SEC",
  description: "Meet the Skillers Executive Council.",
}

export default async function SecPage() {
  const { data: secMembers } = await getSecMembers()

  return (
    <main className="min-h-screen bg-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Page header */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          <div className="flex justify-center mb-6">
            <Image
              src="/ingeniusly-ghana-mark.png"
              alt="inGeniusly Ghana"
              width={72}
              height={72}
              className="object-contain"
            />
          </div>
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-navy-50 text-navy-600 text-sm font-extrabold mb-6 border border-navy-100">
            <ShieldCheck className="w-4 h-4" />
            Leadership Team
          </div>
          <h1 className="text-4xl md:text-6xl font-black text-navy-600 tracking-tight mb-6">
            Skillers Executive{" "}
            <span className="gradient-text">Council</span>
          </h1>
          <p className="text-lg text-muted font-medium leading-relaxed">
            The driving force behind the Skillers directory. Our council ensures
            the community remains supported, engaged, and connected to incredible
            opportunities.
          </p>
        </div>

        {/* Members grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {(!secMembers || secMembers.length === 0) ? (
            <div className="col-span-full card p-12 text-center text-muted italic font-medium">
              The Executive Council is currently being formed. Check back soon!
            </div>
          ) : (
            secMembers.map((member, index) => {
              const formattedRole = member.sec_role?.replace(/_/g, ' ').toUpperCase() || 'SEC MEMBER'

              return (
                <div
                  key={member.id}
                  className="card p-8 flex flex-col hover:-translate-y-1 transition-all duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.08}s` }}
                >
                  {/* Avatar + name */}
                  <div className="flex flex-col items-center text-center mb-6">
                    <div className="w-20 h-20 rounded-full bg-navy-50 border-2 border-navy-100 shadow flex items-center justify-center text-2xl font-black text-navy-600 overflow-hidden mb-4">
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    </div>
                    <h3 className="text-xl font-black text-navy-600 mb-1">{member.name}</h3>
                    <span className="text-xs font-extrabold tracking-widest text-gold-600 uppercase">
                      {formattedRole}
                    </span>
                  </div>

                  {/* Bio */}
                  {member.bio && (
                    <p className="text-muted text-sm font-medium text-center leading-relaxed line-clamp-3 mb-6">
                      &ldquo;{member.bio}&rdquo;
                    </p>
                  )}

                  {/* Actions */}
                  <div className="mt-auto pt-5 border-t border-border flex flex-col gap-3">
                    <SecContactForm secId={member.id} secName={member.name} secRole={formattedRole} />
                    <Link
                      href={`/directory/members/${member.slug}`}
                      className="w-full bg-navy-50 hover:bg-navy-100 border border-navy-100 text-navy-600 flex items-center justify-center gap-2 rounded-full px-5 py-2.5 font-bold transition-colors text-sm"
                    >
                      <Target className="w-4 h-4" /> View Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  </div>
                </div>
              )
            })
          )}
        </div>

      </div>
    </main>
  )
}
