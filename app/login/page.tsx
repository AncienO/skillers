import type { Metadata } from "next"
import LoginForm from "@/components/forms/LoginForm"
import Link from "next/link"
import Image from "next/image"

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to access the Skillers community directory.",
}

export default function LoginPage() {
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
          <h1 className="text-3xl font-black text-navy-600">Welcome Back</h1>
          <p className="text-muted font-medium mt-1">Sign in to the Skillers Directory</p>
        </div>

        <LoginForm />

        <div className="mt-6 text-center">
          <p className="text-muted font-medium text-sm">
            Don&apos;t have an account?{" "}
            <Link href="/signup" className="text-navy-600 font-extrabold hover:text-gold-600 transition-colors">
              Sign up here
            </Link>
          </p>
        </div>

      </div>
    </main>
  )
}
