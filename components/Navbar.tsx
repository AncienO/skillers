"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import Image from "next/image"

const publicLinks = [
  { label: "Directory", href: "/directory" },
  { label: "SEC",       href: "/sec"       },
]

export default function Navbar() {
  const pathname = usePathname()

  // Hide the public navbar inside authenticated app layouts
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/sec/workspace") ||
    pathname.startsWith("/genius-circle") ||
    pathname.startsWith("/admin")
  ) return null

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-border shadow-sm">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 h-[70px] flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 group flex-shrink-0">
          <Image
            src="/ingeniusly-wordmark.png"
            alt="inGeniusly"
            width={148}
            height={38}
            className="object-contain"
            priority
          />
          <span
            className="hidden sm:inline-block text-sm font-extrabold px-2.5 py-0.5 rounded-full border"
            style={{ color: "#2BAF9C", borderColor: "#2BAF9C40", backgroundColor: "#2BAF9C0D" }}
          >
            Ghana
          </span>
        </Link>

        {/* Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {publicLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`px-4 py-2 rounded-full text-sm font-bold transition-colors ${
                pathname === link.href
                  ? "bg-navy-50 text-navy-600"
                  : "text-muted hover:text-navy-600 hover:bg-navy-50"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Auth */}
        <div className="flex items-center gap-3">
          <Link
            href="/login"
            className="hidden sm:inline text-sm font-bold text-navy-600 hover:text-navy-800 transition-colors"
          >
            Sign In
          </Link>
          <Link href="/signup" className="btn-primary text-sm px-5 py-2.5">
            Join Now
          </Link>
        </div>

      </div>
    </header>
  )
}
