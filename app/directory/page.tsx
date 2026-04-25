// Import Next.js Metadata type
import type { Metadata } from "next"
// Import Next.js Link
import Link from "next/link"
// Import the interactive client component Grid
import DirectoryGrid from "@/components/directory/DirectoryGrid"
// Import icons
import { Pencil, LogOut } from "lucide-react"

// Export SEO metadata for this specific page
export const metadata: Metadata = {
  // Set the browser tab title
  title: "Directory",
  // Set the meta description
  description: "Browse the Skillers community directory to discover talent and goals.",
// End metadata object
}

// Export the default Server Component for the Directory Page
export default function DirectoryPage() {
  // Return the JSX interface
  return (
    // Main wrapper with top padding to account for fixed navbars (if added later)
    <main className="min-h-screen bg-background pt-24 pb-20 px-4 sm:px-6 lg:px-8">
      {/* Centered maximum width container */}
      <div className="max-w-7xl mx-auto">
        
        {/* Header section */}
        <div className="mb-12 flex flex-col md:flex-row md:items-end md:justify-between gap-6">
          <div>
            {/* Page Title */}
            <h1 className="text-4xl font-extrabold tracking-tight mb-4">
              Community <span className="gradient-text">Directory</span>
            </h1>
            {/* Subtitle description */}
            <p className="text-lg text-foreground/70 max-w-2xl">
              Explore the active members of our community. Filter by skills, discover ambitious goals, and find the right people to connect with.
            </p>
          </div>
          {/* Action buttons */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/directory/edit" className="btn-primary flex items-center gap-2 text-sm px-5 py-2.5">
              <Pencil className="w-4 h-4" /> Edit Profile
            </Link>
            <form action="/auth/logout" method="POST">
              <button className="flex items-center gap-2 text-sm px-5 py-2.5 rounded-full border border-border bg-surface hover:bg-surface-hover transition-colors font-medium text-foreground/70 hover:text-foreground">
                <LogOut className="w-4 h-4" /> Sign Out
              </button>
            </form>
          </div>
        {/* End Header section */}
        </div>

        {/* Render the interactive Directory Grid client component */}
        <DirectoryGrid />

      {/* End max-width container */}
      </div>
    {/* End Main wrapper */}
    </main>
  // End return
  )
// End DirectoryPage component
}
