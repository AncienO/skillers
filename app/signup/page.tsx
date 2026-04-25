import type { Metadata } from "next"
import SignupForm from "@/components/forms/SignupForm"

export const metadata: Metadata = {
  title: "Sign Up - Skillers",
  description: "Apply to join the Skillers community directory."
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-background pt-32 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h1 className="text-4xl font-extrabold tracking-tight mb-4">
            Join the <span className="gradient-text">Community</span>
          {/* End title */}
          </h1>
          {/* Subtitle */}
          <p className="text-lg text-foreground/70">
            Showcase your skills, share your goals, and connect with like-minded individuals.
          {/* End subtitle */}
          </p>
        {/* End Header Section */}
        </div>
        
        {/* Render the SignupForm client component */}
        <SignupForm />
        
      {/* End container */}
      </div>
    {/* End Main Wrapper */}
    </main>
  // End return
  )
// End component
}
