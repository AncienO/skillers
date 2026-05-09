import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import WorkspaceSidebar from "@/components/sec/WorkspaceSidebar"

export default async function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect("/login")

  const { data: member } = await supabase
    .from("members")
    .select("name, avatar_url, sec_role, is_sec, status")
    .eq("id", user.id)
    .single()

  if (!member?.is_sec || member?.status !== "approved") redirect("/directory")

  return (
    <div className="flex min-h-screen bg-[#F7F8FA]">
      <WorkspaceSidebar
        userName={member.name}
        userRole={member.sec_role ?? "sec_member"}
        avatarUrl={member.avatar_url}
      />
      {/* Main content — offset by sidebar width */}
      <main className="ml-60 flex-1 min-h-screen overflow-y-auto">
        {children}
      </main>
    </div>
  )
}
