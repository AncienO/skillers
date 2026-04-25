import type { Metadata } from "next"
import LoginForm from "@/components/forms/LoginForm"
import Link from "next/link"

export const metadata: Metadata = {
  title: "Sign In - Skillers",
  description: "Sign in to access the Skillers community directory."
}

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">
        
        {/* Main Branding / Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Skillers <span className="gradient-text">Directory</span>
          </h1>
        </div>

        {/* The interactive Login Form */}
        <LoginForm />

        {/* Link to Signup */}
        <div className="mt-8 text-center">
          <p className="text-foreground/70">
            Don't have an account?{" "}
            <Link href="/signup" className="text-brand-600 font-semibold hover:underline transition-all">
              Sign up here
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
