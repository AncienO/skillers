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
        // Redirect to directory using standard window location to trigger full reload
        window.location.href = "/directory"
      }
    // End transition
    })
  // End handler
  }

  // Return the main form JSX
  return (
    // Form Container
    <form onSubmit={handleSubmit} className="space-y-5 glass-panel p-6 sm:p-8 rounded-3xl relative animate-fade-in max-w-md mx-auto w-full">
      
      {/* Header section inside the form */}
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold mb-2">Welcome Back</h2>
        <p className="text-sm text-foreground/60">Enter your credentials to access the directory.</p>
      </div>

      {/* Email block */}
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <input name="email" type="email" required placeholder="you@example.com" className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none" />
      </div>

      {/* Password block */}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <input name="password" type="password" required placeholder="••••••••" className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none" />
      </div>

      {/* Error Message rendering */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" disabled={isPending} className="w-full btn-primary text-lg py-3 mt-4 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {isPending ? "Authenticating..." : "Sign In"}
        {!isPending && <LogIn className="w-5 h-5" />}
      </button>

    </form>
  // End return
  )
// End component
}
