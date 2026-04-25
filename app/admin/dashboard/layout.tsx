// Import Next.js Link
import Link from "next/link"
// Import Lucide icons
import { Users, LayoutDashboard, Megaphone, LogOut } from "lucide-react"

// Export default Admin Layout wrapper
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  // Return JSX Layout
  return (
    // Main full-height container with flex
    <div className="min-h-screen bg-background flex flex-col md:flex-row">
      
      {/* Sidebar Navigation */}
      <aside className="w-full md:w-64 bg-surface border-r border-border p-6 flex flex-col gap-6 flex-shrink-0">
        
        {/* Branding */}
        <div>
          <h2 className="text-xl font-black gradient-text mb-1">Skillers Admin</h2>
          <p className="text-xs text-foreground/50 font-medium">Command Center</p>
        </div>
        
        {/* Navigation Links */}
        <nav className="flex-grow space-y-2 mt-4">
          {/* Dashboard Overview */}
          <Link href="/admin/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors font-medium text-sm text-foreground/80 hover:text-foreground">
            <LayoutDashboard className="w-4 h-4" /> Overview
          </Link>
          {/* Member Management */}
          <Link href="/admin/dashboard/members" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors font-medium text-sm text-foreground/80 hover:text-foreground">
            <Users className="w-4 h-4" /> Member Approvals
          </Link>
          {/* Announcements */}
          <Link href="/admin/dashboard/announcements" className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-surface-hover transition-colors font-medium text-sm text-foreground/80 hover:text-foreground">
            <Megaphone className="w-4 h-4" /> Announcements
          </Link>
        {/* End Navigation Links */}
        </nav>
        
        {/* Logout Form Button */}
        <form action="/auth/logout" method="POST">
          <button className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl hover:bg-red-500/10 hover:text-red-500 text-foreground/60 transition-colors font-medium text-sm">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </form>
        
      {/* End Sidebar */}
      </aside>
      
      {/* Main Content Area */}
      <main className="flex-grow p-6 lg:p-10 max-h-screen overflow-y-auto">
        {/* Render child routes */}
        {children}
      {/* End Main Content */}
      </main>
      
    {/* End container */}
    </div>
  // End return
  )
// End AdminLayout
}
