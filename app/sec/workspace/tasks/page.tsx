import { getTasks } from "@/lib/actions/workspace.actions"
import { createClient } from "@/lib/supabase/server"
import KanbanBoard from "@/components/sec/KanbanBoard"

export const metadata = { title: "Tasks – SEC Workspace" }

export default async function TasksPage() {
  const supabase = await createClient()

  const [{ data: tasks }, { data: secMembers }] = await Promise.all([
    getTasks(),
    supabase
      .from("members")
      .select("id, name, avatar_url")
      .eq("is_sec", true)
      .eq("status", "approved"),
  ])

  return (
    <div className="flex flex-col h-screen">
      <div className="px-6 py-5 border-b border-border bg-white flex-shrink-0">
        <h1 className="text-xl font-black text-navy-800">Task Board</h1>
        <p className="text-sm text-muted font-medium">Manage and track SEC tasks across the team</p>
      </div>

      <div className="flex-1 overflow-hidden p-6">
        <KanbanBoard
          initialTasks={(tasks ?? []).map(t => ({
            ...t,
            assignee: Array.isArray(t.assignee) ? (t.assignee[0] ?? null) : t.assignee,
            creator:  Array.isArray(t.creator)  ? (t.creator[0]  ?? null) : t.creator,
          })) as Parameters<typeof KanbanBoard>[0]["initialTasks"]}
          secMembers={secMembers ?? []}
        />
      </div>
    </div>
  )
}
