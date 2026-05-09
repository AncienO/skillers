import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("id, name, avatar_url, tokens, is_genius_circle, status")
    .eq("id", user.id)
    .single()

  if (!member || member.status !== "approved") redirect("/login")

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <DashboardSidebar
        memberId={member.id}
        userName={member.name}
        avatarUrl={member.avatar_url}
        tokens={member.tokens ?? 0}
        isGeniusCircle={member.is_genius_circle ?? false}
      />
      <main className="ml-64 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
