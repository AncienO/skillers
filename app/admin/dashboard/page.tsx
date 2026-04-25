// Import server action to fetch metrics
import { getDashboardMetrics } from "@/lib/actions/admin.actions"
// Import Lucide icons
import { Users, Target, Send, UserCheck } from "lucide-react"

// Prevent static generation, ensure dynamic rendering
export const dynamic = "force-dynamic"

// Export default Dashboard Overview Server Component
export default async function DashboardOverview() {
  // Fetch real-time metrics
  const metrics = await getDashboardMetrics()
  
  // Define stat cards configuration array
  const statCards = [
    { title: "Pending Approvals", value: metrics.pendingCount, icon: Users, color: "text-amber-500", bg: "bg-amber-500/10" },
    { title: "Approved Members", value: metrics.approvedCount, icon: UserCheck, color: "text-emerald-500", bg: "bg-emerald-500/10" },
    { title: "Total Goals", value: metrics.goalsCount, icon: Target, color: "text-brand-500", bg: "bg-brand-500/10" },
    { title: "Connections Made", value: metrics.connectionsCount, icon: Send, color: "text-purple-500", bg: "bg-purple-500/10" }
  ]

  // Return JSX
  return (
    // Main container
    <div className="space-y-8 animate-fade-in">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Dashboard Overview</h1>
        <p className="text-foreground/60">Manage the Skillers community and review pending applications.</p>
      </div>
      
      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Map over stats array */}
        {statCards.map((stat, i) => (
          // Stat Card
          <div key={i} className="glass-panel p-6 rounded-2xl flex items-center gap-4 hover:-translate-y-1 transition-transform duration-300">
            {/* Icon Bubble */}
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${stat.bg} ${stat.color} flex-shrink-0`}>
              <stat.icon className="w-6 h-6" />
            </div>
            {/* Values */}
            <div>
              <p className="text-sm font-semibold text-foreground/60 mb-1">{stat.title}</p>
              <h3 className="text-3xl font-black">{stat.value || 0}</h3>
            </div>
          {/* End Card */}
          </div>
        // End map
        ))}
      {/* End Grid */}
      </div>

    {/* End container */}
    </div>
  // End return
  )
// End DashboardOverview
}
