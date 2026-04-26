import type { Metadata } from "next"
import SignupForm from "@/components/forms/SignupForm"

export const metadata: Metadata = {
  title: "Sign Up - Skillers",
  description: "Create an account to join the Skillers community directory."
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">

        {/* Branding */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold tracking-tight mb-2">
            Join <span className="gradient-text">Skillers</span>
          </h1>
        </div>

        {/* The signup form */}
        <SignupForm />

      </div>
    </main>
  )
}
