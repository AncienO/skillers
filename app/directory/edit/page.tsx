import type { Metadata } from "next"
import EditProfileForm from "@/components/forms/EditProfileForm"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Edit Profile - Skillers",
  description: "Update your Skillers community profile."
}

export default function EditProfilePage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">

        {/* Back link */}
        <Link href="/directory" className="inline-flex items-center gap-2 text-foreground/60 hover:text-foreground mb-8 transition-colors text-sm font-medium">
          <ArrowLeft className="w-4 h-4" /> Back to Directory
        </Link>

        {/* Page Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Edit Your <span className="gradient-text">Profile</span>
          </h1>
          <p className="text-lg text-foreground/70">
            Update your details, goals, and expertise tags.
          </p>
        </div>

        {/* Edit Profile Form */}
        <EditProfileForm />

      </div>
    </main>
  )
}
