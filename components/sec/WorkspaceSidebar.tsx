"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import {
  LayoutDashboard, MessageSquare, CheckSquare,
  Video, Users, ArrowLeft, LogOut,
} from "lucide-react"

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard",  href: "/sec/workspace"          },
  { icon: MessageSquare,   label: "Messages",   href: "/sec/workspace/messages" },
  { icon: CheckSquare,     label: "Tasks",      href: "/sec/workspace/tasks"    },
  { icon: Video,           label: "Meetings",   href: "/sec/workspace/meetings" },
  { icon: Users,           label: "Directory",  href: "/directory"              },
]

interface Props {
  userName: string
  userRole: string
  avatarUrl: string | null
}

export default function WorkspaceSidebar({ userName, userRole, avatarUrl }: Props) {
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/sec/workspace" ? pathname === href : pathname.startsWith(href)

  return (
    <aside className="fixed top-0 left-0 h-screen w-60 bg-navy-900 flex flex-col z-40 select-none">

      {/* Logo */}
      <div className="px-4 py-5 border-b border-navy-700">
        <Link href="/sec/workspace" className="flex items-center gap-2">
          <Image
            src="/ingeniusly-ghana-mark.png"
            alt="inGeniusly Ghana"
            width={32}
            height={32}
            className="object-contain"
          />
          <div className="leading-tight">
            <p className="text-white font-black text-sm">inGeniusly</p>
            <p className="text-gold-400 font-bold text-xs">SEC Workspace</p>
          </div>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-0.5">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = isActive(href)
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

        <div className="pt-4 mt-4 border-t border-navy-700 space-y-0.5">
          <Link
            href="/directory"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-navy-400 hover:text-navy-200 hover:bg-navy-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Directory
          </Link>
          <form action="/auth/logout" method="POST">
            <button
              type="submit"
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-bold text-navy-400 hover:text-red-400 hover:bg-navy-800 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              Sign Out
            </button>
          </form>
        </div>
      </nav>

      {/* User info */}
      <div className="px-4 py-4 border-t border-navy-700 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-navy-600 flex items-center justify-center text-white font-black text-sm overflow-hidden flex-shrink-0">
          {avatarUrl ? (
            <Image src={avatarUrl} alt={userName} width={32} height={32} className="object-cover w-full h-full" />
          ) : (
            userName.charAt(0).toUpperCase()
          )}
        </div>
        <div className="min-w-0">
          <p className="text-white font-bold text-sm truncate">{userName}</p>
          <p className="text-gold-400 text-xs font-semibold truncate capitalize">
            {userRole.replace(/_/g, " ")}
          </p>
        </div>
      </div>

    </aside>
  )
}
