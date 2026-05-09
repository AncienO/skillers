import type { Metadata } from "next"
import Link from "next/link"
import DirectoryGrid from "@/components/directory/DirectoryGrid"
import { Pencil, LogOut } from "lucide-react"

export const metadata: Metadata = {
  title: "Directory",
  description: "Browse the Skillers community directory to discover talent and goals.",
}

export default function DirectoryPage() {
  return (
    <main className="min-h-screen bg-white pt-28 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black text-navy-600 tracking-tight mb-3">
              Community <span className="gradient-text">Directory</span>
            </h1>
            <p className="text-lg text-muted font-medium max-w-2xl">
              Explore the active members of our community. Filter by skills,
              discover ambitious goals, and find the right people to connect with.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-shrink-0">
            <Link
              href="/directory/edit"
              className="btn-primary text-sm px-5 py-2.5 flex items-center gap-2"
            >
              <Pencil className="w-4 h-4" /> Edit Profile
            </Link>
            <form action="/auth/logout" method="POST">
              <button className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-full border-2 border-border text-muted font-bold hover:border-navy-600/30 hover:text-navy-600 transition-colors">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        </div>

        <DirectoryGrid />

      </div>
    </main>
  )
}
