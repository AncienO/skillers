"use client"

// Import React hooks
import { useState, useTransition } from "react"
// Import Server Action for registration
import { registerMember } from "@/lib/actions/signup.actions"
// Import Lucide icons
import { Mail, Lock, CheckCircle, AlertCircle, ArrowRight, Star } from "lucide-react"
// Import Link for navigation
import Link from "next/link"

// Export default Client Component for the Sign Up Form
export default function SignupForm() {
  // State for UI errors
  const [error, setError] = useState<string | null>(null)
  // State for successful submission
  const [success, setSuccess] = useState(false)
  // Transition hook for form submission state
  const [isPending, startTransition] = useTransition()

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page reload
    e.preventDefault()
    // Clear previous errors
    setError(null)

    // Create FormData object from form element
    const formData = new FormData(e.currentTarget)

    // Client-side password match validation
    const password = formData.get("password") as string
    const confirmPassword = formData.get("confirm_password") as string
    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    // Start transition for server call
    startTransition(async () => {
      // Call server action with formData
      const result = await registerMember(formData)

      // Handle response
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
      }
    })
  }

  // If successful submission, show pending approval UI
  if (success) {
    return (
      <div className="text-center py-12 px-6 glass-panel rounded-3xl animate-fade-in max-w-md mx-auto">
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-3">Account Created!</h2>
        <p className="text-foreground/70 mb-6">
          Your account is pending approval by an administrator. You will receive an email once your account has been approved and you can sign in.
        </p>
        <Link href="/" className="text-brand-600 font-semibold hover:underline inline-flex items-center gap-1">
          Back to Home <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    )
  }

  // Render form
  return (
    <form onSubmit={handleSubmit} className="space-y-6 glass-panel p-6 sm:p-8 rounded-3xl relative animate-fade-in max-w-md mx-auto w-full">

      {/* Header inside the form */}
      <div className="text-center mb-2">
        <h2 className="text-2xl font-bold mb-2">Create Your Account</h2>
        <p className="text-sm text-foreground/60">Sign up to join the Skillers community.</p>
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium mb-1">Email Address</label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            name="email"
            type="email"
            required
            placeholder="you@example.com"
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none"
          />
        </div>
      </div>

      {/* Password */}
      <div>
        <label className="block text-sm font-medium mb-1">Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            name="password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none"
          />
        </div>
        <p className="text-xs text-foreground/50 mt-1">Minimum 6 characters</p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium mb-1">Confirm Password</label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-foreground/40" />
          <input
            name="confirm_password"
            type="password"
            required
            minLength={6}
            placeholder="••••••••"
            className="w-full pl-10 pr-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none"
          />
        </div>
      </div>

      {/* Genius Circle */}
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          name="genius_circle_requested"
          type="checkbox"
          value="true"
          className="mt-0.5 w-4 h-4 accent-gold-500 cursor-pointer flex-shrink-0"
        />
        <div>
          <div className="flex items-center gap-1.5 text-sm font-bold text-navy-700">
            <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
            I&apos;m part of the Genius Circle
          </div>
          <p className="text-xs text-muted font-medium mt-0.5">
            Request access to the exclusive Genius Circle community. An admin will verify and approve your access.
          </p>
        </div>
      </label>

      {/* Error Message */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button
        type="submit"
        disabled={isPending}
        className="w-full btn-primary text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Creating Account..." : "Sign Up"}
        {!isPending && <ArrowRight className="w-5 h-5" />}
      </button>

      {/* Link to login */}
      <p className="text-center text-sm text-foreground/60">
        Already have an account?{" "}
        <Link href="/login" className="text-brand-600 font-semibold hover:underline">
          Sign in
        </Link>
      </p>

    </form>
  )
}
