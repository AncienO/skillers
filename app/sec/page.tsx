// Import Metadata
import type { Metadata } from "next"
// Import Server action to fetch SEC members
import { getSecMembers } from "@/lib/actions/sec.actions"
// Import Next.js Link
import Link from "next/link"
// Import Client form
import SecContactForm from "@/components/forms/SecContactForm"
// Import Lucide icons
import { ShieldCheck, Target, ArrowRight } from "lucide-react"

// Export SEO metadata
export const metadata: Metadata = {
  title: "Meet the SEC",
  description: "Meet the Skillers Executive Committee.",
}

// Export default SEC Page Server Component
export default async function SecPage() {
  // Fetch the SEC members from the database
  const { data: secMembers } = await getSecMembers()

  // Return JSX
  return (
    // Main layout wrapper
    <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Max width container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-20 animate-fade-in">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-sm font-bold mb-6">
            <ShieldCheck className="w-4 h-4" />
            <span>Leadership Team</span>
          </div>
          {/* Main Title */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6">
            Skillers Executive <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-brand-500">Committee</span>
          </h1>
          {/* Description */}
          <p className="text-xl text-foreground/70">
            The driving force behind the Skillers directory. Our committee ensures the community remains supported, engaged, and connected to incredible opportunities.
          </p>
        {/* End Header Block */}
        </div>

        {/* Members Grid Container */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          
          {/* If there are no SEC members assigned yet */}
          {(!secMembers || secMembers.length === 0) ? (
            // Empty state container
            <div className="col-span-full glass-panel p-12 rounded-3xl text-center text-foreground/60 italic">
              The Executive Committee is currently being formed. Check back soon!
            </div>
          ) : (
            // Map over SEC members
            secMembers.map((member, index) => {
              // Format the SEC Role for display
              const formattedRole = member.sec_role?.replace(/_/g, ' ').toUpperCase() || 'SEC MEMBER'
              
              // Return Card
              return (
                // Card Wrapper with staggered animation delay
                <div key={member.id} className="glass-panel p-8 rounded-3xl relative overflow-hidden group hover:-translate-y-2 transition-all duration-300 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                  
                  {/* Decorative Background gradient */}
                  <div className="absolute top-0 right-0 w-32 h-32 bg-purple-500/10 rounded-full blur-[40px] pointer-events-none group-hover:bg-purple-500/20 transition-all" />

                  {/* Avatar and Role Header */}
                  <div className="flex flex-col items-center text-center mb-6 relative z-10">
                    {/* Avatar Bubble */}
                    <div className="w-24 h-24 rounded-full bg-surface border-4 border-purple-500/20 shadow-xl flex items-center justify-center text-3xl font-bold text-purple-600 overflow-hidden mb-4">
                      {/* Avatar Image Conditional */}
                      {member.avatar_url ? (
                        <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                      ) : (
                        member.name.charAt(0).toUpperCase()
                      )}
                    {/* End Avatar */}
                    </div>
                    
                    {/* Name */}
                    <h3 className="text-2xl font-bold mb-1">{member.name}</h3>
                    {/* Role Title */}
                    <span className="text-xs font-black tracking-widest text-purple-600 dark:text-purple-400">
                      {formattedRole}
                    </span>
                  {/* End Avatar Header */}
                  </div>

                  {/* Bio block */}
                  {member.bio && (
                    <p className="text-foreground/70 text-sm text-center line-clamp-3 mb-6 relative z-10">
                      "{member.bio}"
                    </p>
                  )}

                  {/* Actions Row */}
                  <div className="pt-6 border-t border-border/50 flex flex-col gap-3 relative z-10">
                    {/* Official Contact Modal Trigger */}
                    <SecContactForm secId={member.id} secName={member.name} secRole={formattedRole} />
                    
                    {/* View Full Profile Link */}
                    <Link href={`/directory/members/${member.slug}`} className="w-full sm:w-auto bg-surface hover:bg-surface-hover border border-border text-foreground flex items-center justify-center gap-2 rounded-full px-6 py-2 font-medium transition-colors text-sm">
                      <Target className="w-4 h-4" /> View Profile <ArrowRight className="w-3 h-3" />
                    </Link>
                  {/* End Actions */}
                  </div>

                {/* End Card Wrapper */}
                </div>
              )
            // End map callback
            })
          // End condition
          )}

        {/* End Members Grid Container */}
        </div>

      {/* End Max width container */}
      </div>
    {/* End Main layout wrapper */}
    </main>
  // End return
  )
// End component
}
