import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Users, Target, ShieldCheck } from "lucide-react"

export default function HomePage() {
  return (
    <main className="min-h-screen bg-white text-navy-600 flex flex-col">

      {/* ── Hero ── */}
      <section className="pt-36 pb-28 px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto animate-fade-in">

          {/* Ghana G mark — hero brand icon */}
          <div className="flex justify-center mb-8">
            <Image
              src="/ingeniusly-ghana-mark.png"
              alt="inGeniusly Ghana"
              width={100}
              height={100}
              className="object-contain"
              priority
            />
          </div>

          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gold-100 text-gold-700 text-sm font-extrabold mb-6 tracking-wide">
            inGeniusly Ghana · Skillers Programme
          </div>

          {/* Headline */}
          <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-navy-600 leading-tight mb-6">
            The <span className="gradient-text">Skillers</span><br />
            Community Directory
          </h1>

          {/* Sub-headline */}
          <p className="text-lg md:text-xl text-muted font-medium leading-relaxed max-w-2xl mx-auto mb-10">
            A living showcase where our community members highlight who they are
            and the goals they are building toward. Find support, partnerships,
            and your next big opportunity.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="btn-gold text-base px-8 py-3.5 flex items-center gap-2 w-full sm:w-auto justify-center">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/directory" className="btn-outline text-base px-8 py-3.5 w-full sm:w-auto justify-center flex items-center">
              Browse Members
            </Link>
          </div>

        </div>
      </section>

      {/* ── Divider ── */}
      <div className="w-full h-px bg-border" />

      {/* ── Feature Cards ── */}
      <section className="section-alt py-24 px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">

          <div className="text-center mb-14">
            <p className="text-sm font-extrabold tracking-widest uppercase text-gold-600 mb-3">
              What You&apos;ll Find Here
            </p>
            <h2 className="text-3xl md:text-4xl font-black text-navy-600">
              Built for Ghana&apos;s next generation
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-8">

            <div className="card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-navy-600" />
              </div>
              <h3 className="text-xl font-black text-navy-600 mb-3">Discover Talent</h3>
              <p className="text-muted font-medium leading-relaxed">
                Browse profiles of driven individuals, filter by skills, and find
                the perfect collaborator for your next project.
              </p>
            </div>

            <div className="card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-xl bg-gold-50 flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-gold-600" />
              </div>
              <h3 className="text-xl font-black text-navy-600 mb-3">Share Your Goals</h3>
              <p className="text-muted font-medium leading-relaxed">
                Put your ambitions on display. Let the community know what
                you&apos;re working toward to attract support and resources.
              </p>
            </div>

            <div className="card p-8 flex flex-col items-start hover:-translate-y-1 transition-transform duration-200">
              <div className="w-12 h-12 rounded-xl bg-navy-50 flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-navy-600" />
              </div>
              <h3 className="text-xl font-black text-navy-600 mb-3">Meet the SEC</h3>
              <p className="text-muted font-medium leading-relaxed mb-5">
                Connect with the Skillers Executive Council to get guidance,
                mentorship, and official support for your endeavors.
              </p>
              <Link href="/sec" className="inline-flex items-center gap-1.5 text-navy-600 font-extrabold text-sm hover:text-gold-600 transition-colors mt-auto">
                View the SEC <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="py-24 px-6 lg:px-8 bg-navy-600">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-gold-400 font-extrabold text-sm tracking-widest uppercase mb-4">
            Skillers Executive Council
          </p>
          <h2 className="text-3xl md:text-4xl font-black text-white mb-5 leading-tight">
            Ready to showcase your potential?
          </h2>
          <p className="text-navy-200 font-medium text-lg mb-10 max-w-xl mx-auto leading-relaxed">
            Join the inGeniusly Ghana Skillers community. Create your profile,
            set your goals, and connect with a network of ambitious peers.
          </p>
          <Link href="/signup" className="btn-gold text-base px-8 py-3.5 inline-flex items-center gap-2">
            Create Your Profile <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-navy-800 py-10 px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-6">

          {/* Wordmark + Ghana label */}
          <div className="flex items-center gap-3">
            <Image
              src="/ingeniusly-wordmark.png"
              alt="inGeniusly"
              width={120}
              height={30}
              className="object-contain brightness-0 invert opacity-80"
            />
            <span className="text-gold-400 font-extrabold text-sm">Ghana</span>
          </div>

          <nav className="flex items-center gap-6 text-sm font-bold text-navy-300">
            <Link href="/directory" className="hover:text-white transition-colors">Directory</Link>
            <Link href="/sec"       className="hover:text-white transition-colors">SEC</Link>
            <Link href="/login"     className="hover:text-white transition-colors">Sign In</Link>
          </nav>

        </div>
      </footer>

    </main>
  )
}
