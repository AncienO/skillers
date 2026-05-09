import type { Metadata } from "next"
import SignupForm from "@/components/forms/SignupForm"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Sign Up",
  description: "Create an account to join the Skillers community directory.",
}

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-surface-alt pt-28 pb-20 px-4 flex flex-col items-center justify-center">
      <div className="w-full max-w-md mx-auto">

        {/* Branding */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-5">
            <Image
              src="/ingeniusly-wordmark.png"
              alt="inGeniusly"
              width={160}
              height={40}
              className="object-contain"
              priority
            />
            <span
              className="text-sm font-extrabold px-2.5 py-0.5 rounded-full border"
              style={{ color: "#2BAF9C", borderColor: "#2BAF9C40", backgroundColor: "#2BAF9C0D" }}
            >
              Ghana
            </span>
          </div>
          <h1 className="text-3xl font-black text-navy-600">Join Skillers</h1>
          <p className="text-muted font-medium mt-1">Create your profile and showcase your goals</p>
        </div>

        <SignupForm />

        <div className="mt-6 text-center">
          <p className="text-muted font-medium text-sm">
            Already have an account?{" "}
            <Link href="/login" className="text-navy-600 font-extrabold hover:text-gold-600 transition-colors">
              Sign in here
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
