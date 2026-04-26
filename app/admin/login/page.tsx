import type { Metadata } from "next"
import AdminLoginForm from "@/components/forms/AdminLoginForm"

export const metadata: Metadata = {
  title: "Admin Login - Skillers",
  description: "Administrative access to the Skillers platform.",
}

export default function AdminLoginPage() {
  return (
    <main className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <AdminLoginForm />
      </div>
    </main>
  )
}
