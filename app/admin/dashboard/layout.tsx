"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { Users, LayoutDashboard, Megaphone, LogOut, ShieldCheck, Star } from "lucide-react"

const navItems = [
  { href: "/admin/dashboard",                label: "Overview",         icon: LayoutDashboard },
  { href: "/admin/dashboard/members",        label: "Member Approvals", icon: Users           },
  { href: "/admin/dashboard/sec",            label: "SEC Management",   icon: ShieldCheck     },
  { href: "/admin/dashboard/genius-circle",  label: "Genius Circle",    icon: Star            },
  { href: "/admin/dashboard/announcements",  label: "Announcements",    icon: Megaphone       },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex">

      {/* Sidebar */}
      <aside className="fixed top-0 left-0 h-screen w-60 bg-navy-900 flex flex-col z-40">

        {/* Logo */}
        <div className="px-5 py-5 border-b border-navy-700">
          <Link href="/admin/dashboard" className="flex items-center gap-2">
            <Image src="/ingeniusly-ghana-mark.png" alt="inGeniusly" width={30} height={30} className="object-contain" />
            <div className="leading-tight">
              <p className="text-white font-black text-sm">inGeniusly</p>
              <p className="text-gold-400 font-bold text-xs">Admin Panel</p>
            </div>
          </Link>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-0.5 overflow-y-auto">
          {navItems.map(({ href, label, icon: Icon }) => {
            const active = href === "/admin/dashboard" ? pathname === href : pathname.startsWith(href)
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold transition-colors ${
                  active
                    ? "bg-gold-500/15 text-gold-400 border-l-2 border-gold-500"
                    : "text-navy-300 hover:bg-navy-700 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Sign out */}
        <div className="px-2 py-4 border-t border-navy-700">
          <form action="/auth/logout" method="POST">
            <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-navy-400 hover:text-red-400 hover:bg-navy-800 transition-colors">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </form>
        </div>

      </aside>

      {/* Main content */}
      <main className="ml-60 flex-1 min-h-screen overflow-y-auto p-8">
        {children}
      </main>

    </div>
  )
}
