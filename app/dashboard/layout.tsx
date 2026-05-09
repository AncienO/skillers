import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import DashboardSidebar from "@/components/dashboard/DashboardSidebar"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("id, name, avatar_url, t1, t2, t3, t4, is_genius_circle, status")
    .eq("id", user.id)
    .single()

  if (!member || member.status !== "approved") redirect("/login")

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <DashboardSidebar
        memberId={member.id}
        userName={member.name}
        avatarUrl={member.avatar_url}
        t1={member.t1 ?? 0}
        t2={member.t2 ?? 0}
        t3={member.t3 ?? 0}
        t4={member.t4 ?? 0}
        isGeniusCircle={member.is_genius_circle ?? false}
      />
      <main className="ml-64 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
