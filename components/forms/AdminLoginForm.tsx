"use client"

import { useState, useTransition } from "react"
import { loginWithPassword } from "@/lib/actions/auth.actions"
import { ShieldCheck, AlertCircle } from "lucide-react"

export default function AdminLoginForm() {
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await loginWithPassword(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        // Always go to admin dashboard from this page
        window.location.href = "/admin/dashboard"
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5 glass-panel p-6 sm:p-8 rounded-3xl relative animate-fade-in max-w-md mx-auto w-full">

      <div className="text-center mb-6">
        <div className="w-14 h-14 rounded-full bg-purple-500/10 text-purple-500 flex items-center justify-center mx-auto mb-4">
          <ShieldCheck className="w-7 h-7" />
        </div>
        <h2 className="text-2xl font-bold mb-1">Admin Access</h2>
        <p className="text-sm text-foreground/50">Restricted to authorized personnel only.</p>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Email</label>
        <input name="email" type="email" required placeholder="admin@skillers.com" className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none" />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input name="password" type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-purple-500/50 outline-none" />
      </div>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <button type="submit" disabled={isPending} className="w-full py-3 mt-4 flex items-center justify-center gap-2 rounded-full font-semibold text-white bg-purple-600 hover:bg-purple-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
        {isPending ? "Authenticating..." : "Enter Admin Panel"}
      </button>

    </form>
  )
}
