// Import Next.js notFound utility to handle missing profiles
import { notFound } from "next/navigation"
// Import Supabase Server Client
import { createClient } from "@/lib/supabase/server"
// Import Next.js Link
import Link from "next/link"
// Import Connect Form Component
import ConnectForm from "@/components/forms/ConnectForm"
// Import Lucide icons
import { ArrowLeft, Mail, Target, Tag, ShieldCheck } from "lucide-react"

// Define the shape of the Page props expecting dynamic params
interface MemberProfileProps {
  // The params promise containing the slug string
  params: Promise<{ slug: string }>
}

// Export the default async Server Component for the profile page
export default async function MemberProfilePage({ params }: MemberProfileProps) {
  // Await the params to extract the slug
  const { slug } = await params
  
  // Initialize Supabase client
  const supabase = await createClient()

  // Query the specific member by slug, joining goals and tags
  const { data: member, error } = await supabase
    .from("members")
    .select(`
      id, name, slug, avatar_url, bio, sec_role, is_sec,
      goals ( id, title, description ),
      tags ( id, label )
    `)
    // Filter by the URL slug
    .eq("slug", slug)
    // Only fetch approved members
    .eq("status", "approved")
    // Retrieve a single record
    .maybeSingle()

  // If there's an error or the member doesn't exist, return a 404 page
  if (error || !member) {
    // Trigger Next.js standard 404
    notFound()
  // End if
  }

  // Return the JSX interface
  return (
    // Main wrapper
    <main className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Centered container */}
      <div className="max-w-4xl mx-auto animate-fade-in">
        
        {/* Back navigation link */}
        <Link href="/directory" className="inline-flex items-center gap-2 text-sm font-medium text-foreground/60 hover:text-brand-600 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Profile Card Container */}
        <div className="glass-panel rounded-3xl overflow-hidden relative">
          
          {/* Decorative Top Banner */}
          <div className="h-32 bg-gradient-to-r from-brand-500/20 to-purple-500/20 w-full" />
          
          {/* Main content padding */}
          <div className="px-8 pb-10">
            
            {/* Header row (Avatar + Connect Button) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 -mt-16 mb-8">
              {/* Avatar Wrapper */}
              <div className="w-32 h-32 rounded-2xl bg-surface border-4 border-surface shadow-xl flex items-center justify-center text-4xl font-bold text-brand-600 overflow-hidden shrink-0 relative z-10">
                {/* If avatar URL exists, render img, else fallback */}
                {member.avatar_url ? (
                  <img src={member.avatar_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  member.name.charAt(0).toUpperCase()
                )}
              {/* End Avatar Wrapper */}
              </div>
              
              {/* Connect Form Modal Trigger */}
              <ConnectForm memberId={member.id} memberName={member.name} goals={member.goals || []} />
            {/* End Header row */}
            </div>

            {/* Profile Info */}
            <div className="mb-10">
              {/* Name */}
              <h1 className="text-3xl font-extrabold mb-2 flex items-center gap-3">
                {member.name}
                {/* Conditional SEC Badge */}
                {member.is_sec && (
                  <span className="text-sm font-bold text-purple-600 bg-purple-100 dark:bg-purple-500/20 px-3 py-1 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-4 h-4" />
                    {member.sec_role?.replace(/_/g, ' ').toUpperCase()}
                  </span>
                )}
              {/* End Name */}
              </h1>
              
              {/* Bio block */}
              {member.bio && (
                <p className="text-lg text-foreground/80 leading-relaxed max-w-3xl">
                  {member.bio}
                </p>
              )}
            {/* End Profile Info */}
            </div>

            {/* Content Grid (Goals & Tags) */}
            <div className="grid md:grid-cols-3 gap-8">
              
              {/* Goals Column (takes 2/3 space) */}
              <div className="md:col-span-2 space-y-6">
                {/* Section Header */}
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
                  <Target className="w-5 h-5 text-brand-500" /> Current Goals
                </h2>
                
                {/* Map over goals */}
                {member.goals?.length > 0 ? (
                  member.goals.map((goal: any) => (
                    // Goal Card
                    <div key={goal.id} className="bg-surface/50 border border-border p-5 rounded-2xl hover:border-brand-300 transition-colors">
                      {/* Goal Title */}
                      <h3 className="font-bold text-lg mb-2">{goal.title}</h3>
                      {/* Goal Description */}
                      {goal.description && (
                        <p className="text-foreground/70">{goal.description}</p>
                      )}
                    {/* End Goal Card */}
                    </div>
                  ))
                ) : (
                  // Empty Goals state
                  <p className="text-foreground/50 italic">No goals showcased yet.</p>
                )}
              {/* End Goals Column */}
              </div>

              {/* Tags Column (takes 1/3 space) */}
              <div className="space-y-6">
                {/* Section Header */}
                <h2 className="text-xl font-bold flex items-center gap-2 mb-4 border-b border-border pb-2">
                  <Tag className="w-5 h-5 text-brand-500" /> Expertise & Interests
                </h2>
                
                {/* Tags Flex Container */}
                <div className="flex flex-wrap gap-2">
                  {/* Map over tags */}
                  {member.tags?.length > 0 ? (
                    member.tags.map((tag: any) => (
                      // Tag Pill
                      <span key={tag.id} className="px-3 py-1.5 bg-surface-hover border border-border rounded-lg text-sm font-medium">
                        {tag.label}
                      </span>
                    ))
                  ) : (
                    // Empty Tags state
                    <p className="text-foreground/50 italic">No tags selected.</p>
                  )}
                {/* End Tags Flex Container */}
                </div>
              {/* End Tags Column */}
              </div>

            {/* End Content Grid */}
            </div>

          {/* End Main content padding */}
          </div>
        {/* End Profile Card Container */}
        </div>
      {/* End Centered container */}
      </div>
    {/* End Main wrapper */}
    </main>
  // End return
  )
// End MemberProfilePage component
}
