"use client"

import Link from "next/link"
import Image from "next/image"
import { usePathname } from "next/navigation"
import { BookOpen, User, Gem, ArrowLeft, LogOut } from "lucide-react"
import { getTokenTier, playerScore, TOKEN_DEFS, TOKEN_FILTERS, type PlayerTokens } from "@/lib/tokens"

interface Props {
  memberId: string
  userName: string
  avatarUrl: string | null
  t1: number
  t2: number
  t3: number
  t4: number
  isGeniusCircle: boolean
}

export default function DashboardSidebar({ userName, avatarUrl, t1, t2, t3, t4, isGeniusCircle }: Props) {
  const pathname = usePathname()
  const tokens: PlayerTokens = { t1, t2, t3, t4 }
  const tierKey = getTokenTier(tokens)
  const tier    = TOKEN_DEFS[tierKey]
  const score   = playerScore(tokens)

  const navItems = [
    { icon: BookOpen, label: "Feed",         href: "/dashboard"         },
    { icon: User,     label: "My Profile",   href: "/dashboard/profile" },
    ...(isGeniusCircle ? [{ icon: Gem, label: "Genius Circle", href: "/genius-circle" }] : []),
  ]

  return (
    <aside className="fixed top-0 left-0 h-screen w-64 bg-white border-r border-border flex flex-col z-40">

      {/* Logo */}
      <div className="px-5 py-5 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/ingeniusly-ghana-mark.png" alt="inGeniusly" width={30} height={30} className="object-contain" />
          <div className="leading-tight">
            <p className="text-navy-800 font-black text-sm">inGeniusly</p>
            <p className="text-muted font-bold text-xs">Ghana Skillers</p>
          </div>
        </Link>
      </div>

      {/* Token summary */}
      <div className="px-4 py-3 border-b border-border">
        <div className={`flex items-center gap-2.5 rounded-xl px-3 py-2.5 ${tier.bg} border ${tier.border}`}>
          <div className="relative w-8 h-8 flex-shrink-0">
            <Image
              src="/ingeniusly-ghana-mark.png"
              alt={tier.name}
              width={32}
              height={32}
              className="object-contain"
              style={{ filter: TOKEN_FILTERS[tierKey] }}
            />
          </div>
          <div className="min-w-0">
            <p className="text-xs font-black text-navy-800">{score} pts</p>
            <p className={`text-xs font-bold ${tier.color}`}>{tier.name} Tier</p>
          </div>
        </div>

        {/* Mini token counts */}
        <div className="flex gap-2 mt-2">
          {(["t1","t2","t3","t4"] as const).map(k => {
            const def = TOKEN_DEFS[k]
            const count = tokens[k]
            return (
              <div key={k} title={`${count} ${def.name} (${def.val} pt each)`}
                className={`flex-1 flex flex-col items-center rounded-lg py-1 ${def.bg} border ${def.border}`}>
                <span className={`text-xs font-black ${def.color}`}>{count}</span>
                <span className={`text-[9px] font-bold ${def.color} opacity-70`}>{def.name.slice(0,2)}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ icon: Icon, label, href }) => {
          const active = href === "/dashboard" ? pathname === href : pathname.startsWith(href)
          return (
            <Link key={href} href={href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                active ? "bg-navy-50 text-navy-700 border border-navy-100"
                       : "text-muted hover:bg-[#F7F8FA] hover:text-navy-700"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />{label}
            </Link>
          )
        })}

        <div className="pt-4 mt-4 border-t border-border space-y-0.5">
          <Link href="/directory" className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold text-muted hover:bg-[#F7F8FA] hover:text-navy-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Directory
          </Link>
        </div>
      </nav>

      {/* User + sign out */}
      <div className="px-4 py-4 border-t border-border">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-navy-100 flex items-center justify-center text-navy-600 font-black text-sm overflow-hidden flex-shrink-0">
            {avatarUrl ? (
              <Image src={avatarUrl} alt={userName} width={32} height={32} className="object-cover" />
            ) : userName.charAt(0).toUpperCase()}
          </div>
          <p className="text-sm font-bold text-navy-800 truncate">{userName}</p>
        </div>
        <form action="/auth/logout" method="POST">
          <button className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-muted hover:text-red-500 hover:bg-red-50 transition-colors">
            <LogOut className="w-3.5 h-3.5" /> Sign Out
          </button>
        </form>
      </div>

    </aside>
  )
}
