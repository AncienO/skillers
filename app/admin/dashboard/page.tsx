import { getDashboardMetrics } from "@/lib/actions/admin.actions"
import { Users, UserCheck, Star, Clock } from "lucide-react"
import Link from "next/link"

export const dynamic = "force-dynamic"

export default async function DashboardOverview() {
  const metrics = await getDashboardMetrics()

  const cards = [
    {
      title: "Pending Approvals",
      value: metrics.pendingCount ?? 0,
      icon: Clock,
      bg: "bg-amber-100",
      color: "text-amber-600",
      href: "/admin/dashboard/members",
    },
    {
      title: "Approved Members",
      value: metrics.approvedCount ?? 0,
      icon: UserCheck,
      bg: "bg-green-100",
      color: "text-green-600",
      href: "/admin/dashboard/members",
    },
    {
      title: "SEC Members",
      value: metrics.secCount ?? 0,
      icon: Users,
      bg: "bg-navy-100",
      color: "text-navy-600",
      href: "/admin/dashboard/sec",
    },
    {
      title: "Genius Circle",
      value: metrics.geniusCircleCount ?? 0,
      icon: Star,
      bg: "bg-gold-100",
      color: "text-gold-700",
      href: "/admin/dashboard/genius-circle",
    },
  ]

  return (
    <div className="max-w-5xl">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-navy-800">Admin Overview</h1>
        <p className="text-muted font-medium mt-1">Manage the Skillers community.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {cards.map((c) => (
          <Link key={c.title} href={c.href} className="bg-white rounded-2xl border border-border p-5 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${c.bg}`}>
              <c.icon className={`w-5 h-5 ${c.color}`} />
            </div>
            <div>
              <p className="text-2xl font-black text-navy-700">{c.value}</p>
              <p className="text-xs text-muted font-semibold leading-tight">{c.title}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* Quick links */}
      <div className="bg-white rounded-2xl border border-border p-6">
        <h2 className="font-black text-navy-800 mb-4">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/dashboard/members" className="px-4 py-2 bg-navy-600 text-white text-sm font-bold rounded-xl hover:bg-navy-700 transition-colors">
            Review Pending Members
          </Link>
          <Link href="/admin/dashboard/sec" className="px-4 py-2 bg-navy-100 text-navy-700 text-sm font-bold rounded-xl hover:bg-navy-200 transition-colors">
            Manage SEC
          </Link>
          <Link href="/admin/dashboard/genius-circle" className="px-4 py-2 bg-gold-100 text-gold-700 text-sm font-bold rounded-xl hover:bg-gold-200 transition-colors">
            Genius Circle Requests
          </Link>
          <Link href="/admin/dashboard/announcements" className="px-4 py-2 bg-navy-100 text-navy-700 text-sm font-bold rounded-xl hover:bg-navy-200 transition-colors">
            Send Announcement
          </Link>
        </div>
      </div>
    </div>
  )
}
