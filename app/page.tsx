// Import Next.js Link component for client-side navigation
import Link from "next/link"
// Import Lucide icons for UI enhancement
import { ArrowRight, Users, Target, ShieldCheck } from "lucide-react"

// Export the default Home page component
export default function HomePage() {
  // Return the JSX interface
  return (
    // Main wrapper for the entire page
    <main className="min-h-screen bg-background text-foreground flex flex-col">
      
      {/* Hero Section Container */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex-grow flex flex-col items-center justify-center text-center">
        
        {/* Background decorative blob 1 */}
        <div className="absolute top-0 -left-1/4 w-[800px] h-[800px] bg-brand-400/10 rounded-full blur-[150px] pointer-events-none animate-float" />
        
        {/* Background decorative blob 2 */}
        <div className="absolute top-1/4 -right-1/4 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[150px] pointer-events-none animate-float" style={{ animationDelay: "1.5s" }} />

        {/* Hero Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel text-sm font-medium mb-8 z-10 animate-fade-in text-brand-600 dark:text-brand-400">
          {/* Sparkle or Target Icon */}
          <Target className="w-4 h-4" />
          {/* Badge text */}
          <span>Showcase your goals to the world</span>
        {/* End Hero Badge */}
        </div>

        {/* Main Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 z-10 animate-fade-in" style={{ animationDelay: "0.1s" }}>
          {/* First part of headline */}
          The <span className="gradient-text">Skillers</span> 
          {/* Line break for mobile */}
          <br className="hidden sm:block" />
          {/* Second part of headline */}
           Community Directory
        {/* End Main Headline */}
        </h1>

        {/* Hero Description */}
        <p className="max-w-2xl text-lg md:text-xl text-foreground/70 mb-10 z-10 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          A living showcase where our community members highlight who they are and the goals they are building toward. Find support, partnerships, and your next big opportunity.
        {/* End Hero Description */}
        </p>

        {/* Action Buttons Container */}
        <div className="flex flex-col sm:flex-row items-center gap-4 z-10 animate-fade-in" style={{ animationDelay: "0.3s" }}>
          {/* Primary CTA - Sign Up */}
          <Link href="/signup" className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4">
            {/* CTA Text */}
            Sign Up
            {/* CTA Icon */}
            <ArrowRight className="w-5 h-5" />
          {/* End Primary CTA */}
          </Link>
          
          {/* Secondary CTA - Sign In */}
          <Link href="/login" className="w-full sm:w-auto flex items-center justify-center gap-2 text-lg px-8 py-4 rounded-full font-medium border border-border bg-surface/50 hover:bg-surface transition-all">
            {/* Secondary CTA Text */}
            Sign In
          {/* End Secondary CTA */}
          </Link>
        {/* End Action Buttons Container */}
        </div>

      {/* End Hero Section Container */}
      </section>

      {/* Features / Teaser Section */}
      <section className="py-24 bg-surface-hover border-t border-border relative z-10">
        {/* Container for grid */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid md:grid-cols-3 gap-8">
          
          {/* Feature Card 1 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300">
            {/* Feature Icon Wrapper */}
            <div className="w-14 h-14 bg-brand-500/10 text-brand-600 rounded-full flex items-center justify-center mb-6">
              <Users className="w-7 h-7" />
            </div>
            {/* Feature Title */}
            <h3 className="text-xl font-bold mb-3">Discover Talent</h3>
            {/* Feature Description */}
            <p className="text-foreground/70">Browse profiles of driven individuals, filter by skills, and find the perfect collaborator for your next project.</p>
          {/* End Feature Card 1 */}
          </div>

          {/* Feature Card 2 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: "0.1s" }}>
            {/* Feature Icon Wrapper */}
            <div className="w-14 h-14 bg-emerald-500/10 text-emerald-600 rounded-full flex items-center justify-center mb-6">
              <Target className="w-7 h-7" />
            </div>
            {/* Feature Title */}
            <h3 className="text-xl font-bold mb-3">Share Your Goals</h3>
            {/* Feature Description */}
            <p className="text-foreground/70">Put your ambitions on display. Let the community know what you're working toward to attract support and resources.</p>
          {/* End Feature Card 2 */}
          </div>

          {/* Feature Card 3 */}
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center text-center hover:-translate-y-2 transition-transform duration-300" style={{ animationDelay: "0.2s" }}>
            {/* Feature Icon Wrapper */}
            <div className="w-14 h-14 bg-purple-500/10 text-purple-600 rounded-full flex items-center justify-center mb-6">
              <ShieldCheck className="w-7 h-7" />
            </div>
            {/* Feature Title */}
            <h3 className="text-xl font-bold mb-3">Meet the SEC</h3>
            {/* Feature Description */}
            <p className="text-foreground/70">Connect with the Skillers Executive Committee to get guidance, mentorship, and official support for your endeavors.</p>
            {/* Link to SEC */}
            <Link href="/sec" className="mt-4 text-brand-600 font-medium hover:underline inline-flex items-center gap-1">
              View the SEC <ArrowRight className="w-4 h-4" />
            </Link>
          {/* End Feature Card 3 */}
          </div>

        {/* End Container */}
        </div>
      {/* End Features Section */}
      </section>

    {/* End Main Wrapper */}
    </main>
  // End return
  )
// End HomePage component
}
