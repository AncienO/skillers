"use client"

// Import React hooks
import { useState, useTransition } from "react"
// Import Server action
import { loginWithPassword } from "@/lib/actions/auth.actions"
// Import Lucide icons
import { LogIn, AlertCircle } from "lucide-react"

// Export default Client Component for the Login Form
export default function LoginForm() {
  // State for UI errors
  const [error, setError] = useState<string | null>(null)
  // Transition hook for form submission state
  const [isPending, startTransition] = useTransition()

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page reload
    e.preventDefault()
    // Clear previous errors
    setError(null)
    
    // Create FormData object
    const formData = new FormData(e.currentTarget)

    // Start transition for server call
    startTransition(async () => {
      // Call server action
      const result = await loginWithPassword(formData)
      
      // Handle response
      if (result?.error) {
        // Show error message
        setError(result.error)
      } else if (result?.success) {
        // Redirect to the appropriate page (admin dashboard or directory)
        window.location.href = result.redirect || "/directory"
      }
    // End transition
    })
  // End handler
  }

  // Return the main form JSX
  return (
    // Form Container
    <form onSubmit={handleSubmit} className="space-y-5 bg-white border border-border rounded-2xl shadow-sm p-6 sm:p-8 animate-fade-in w-full">

      {/* Email */}
      <div>
        <label className="block text-sm font-extrabold text-navy-600 mb-1.5">Email Address</label>
        <input
          name="email" type="email" required placeholder="you@example.com"
          className="w-full px-4 py-3 bg-white border border-border rounded-xl text-navy-600 placeholder:text-muted font-medium focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 transition-colors"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-extrabold text-navy-600 mb-1.5">Password</label>
        <input
          name="password" type="password" required placeholder="••••••••"
          className="w-full px-4 py-3 bg-white border border-border rounded-xl text-navy-600 placeholder:text-muted font-medium focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 transition-colors"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-600 text-sm font-semibold">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit" disabled={isPending}
        className="w-full btn-primary text-base py-3.5 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Signing in…" : "Sign In"}
        {!isPending && <LogIn className="w-4 h-4" />}
      </button>

    </form>
  // End return
  )
// End component
}
