"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { createTask, updateTaskStatus, deleteTask, type TaskStatus } from "@/lib/actions/workspace.actions"
import { Plus, Trash2, ArrowRight, ArrowLeft, Calendar } from "lucide-react"

interface Task {
  id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null
  assignee: { id: string; name: string; avatar_url: string | null } | null
  creator: { id: string; name: string } | null
}

interface SecMember {
  id: string
  name: string
  avatar_url: string | null
}

const COLUMNS: { key: TaskStatus; label: string; color: string; bg: string }[] = [
  { key: "todo",        label: "To Do",       color: "text-navy-700",  bg: "bg-navy-100"  },
  { key: "in_progress", label: "In Progress", color: "text-gold-700",  bg: "bg-gold-100"  },
  { key: "done",        label: "Done",        color: "text-green-700", bg: "bg-green-100" },
]

interface Props {
  initialTasks: Task[]
  secMembers: SecMember[]
}

export default function KanbanBoard({ initialTasks, secMembers }: Props) {
  const [tasks, setTasks]       = useState<Task[]>(initialTasks)
  const [adding, setAdding]     = useState<TaskStatus | null>(null)
  const [newTitle, setNewTitle] = useState("")
  const [newAssign, setNewAssign] = useState("")
  const [newDue, setNewDue]     = useState("")
  const [isPending, startTransition] = useTransition()

  const tasksFor = (status: TaskStatus) => tasks.filter(t => t.status === status)

  const handleAddTask = (status: TaskStatus) => {
    if (!newTitle.trim()) return
    const formData = new FormData()
    formData.set("title",       newTitle.trim())
    formData.set("status",      status)
    formData.set("assigned_to", newAssign)
    formData.set("due_date",    newDue)

    // Optimistic
    const optimistic: Task = {
      id:          `optimistic-${Date.now()}`,
      title:       newTitle.trim(),
      description: null,
      status,
      due_date:    newDue || null,
      assignee:    secMembers.find(m => m.id === newAssign) ? { id: newAssign, name: secMembers.find(m => m.id === newAssign)!.name, avatar_url: secMembers.find(m => m.id === newAssign)!.avatar_url } : null,
      creator:     null,
    }
    setTasks(prev => [...prev, optimistic])
    setAdding(null)
    setNewTitle("")
    setNewAssign("")
    setNewDue("")

    startTransition(async () => { await createTask(formData) })
  }

  const handleMove = (taskId: string, direction: "left" | "right") => {
    const task = tasks.find(t => t.id === taskId)
    if (!task) return
    const idx = COLUMNS.findIndex(c => c.key === task.status)
    const newIdx = direction === "right" ? idx + 1 : idx - 1
    if (newIdx < 0 || newIdx >= COLUMNS.length) return
    const newStatus = COLUMNS[newIdx].key

    setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: newStatus } : t))
    startTransition(async () => { await updateTaskStatus(taskId, newStatus) })
  }

  const handleDelete = (taskId: string) => {
    if (taskId.startsWith("optimistic-")) return
    setTasks(prev => prev.filter(t => t.id !== taskId))
    startTransition(async () => { await deleteTask(taskId) })
  }

  return (
    <div className="flex gap-5 h-full overflow-x-auto pb-4">
      {COLUMNS.map((col, colIdx) => (
        <div key={col.key} className="flex-1 min-w-[280px] flex flex-col">

          {/* Column header */}
          <div className={`flex items-center justify-between px-4 py-3 rounded-xl ${col.bg} mb-3`}>
            <div className="flex items-center gap-2">
              <span className={`font-black text-sm ${col.color}`}>{col.label}</span>
              <span className={`text-xs font-bold px-1.5 py-0.5 rounded-full bg-white/60 ${col.color}`}>
                {tasksFor(col.key).length}
              </span>
            </div>
            <button
              onClick={() => { setAdding(col.key); setNewTitle("") }}
              className={`w-6 h-6 flex items-center justify-center rounded-lg hover:bg-white/50 transition-colors ${col.color}`}
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* Add task inline form */}
          {adding === col.key && (
            <div className="bg-white border-2 border-navy-300 rounded-xl p-3 mb-3 space-y-2">
              <input
                autoFocus
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleAddTask(col.key)}
                placeholder="Task title…"
                className="w-full text-sm font-medium text-navy-800 bg-transparent outline-none placeholder:text-muted"
              />
              <select
                value={newAssign}
                onChange={e => setNewAssign(e.target.value)}
                className="w-full text-xs font-semibold text-muted bg-[#F7F8FA] border border-border rounded-lg px-2 py-1.5 outline-none"
              >
                <option value="">Assign to…</option>
                {secMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
              <input
                type="date"
                value={newDue}
                onChange={e => setNewDue(e.target.value)}
                className="w-full text-xs font-semibold text-muted bg-[#F7F8FA] border border-border rounded-lg px-2 py-1.5 outline-none"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleAddTask(col.key)}
                  disabled={!newTitle.trim()}
                  className="flex-1 text-xs font-bold bg-navy-600 text-white rounded-lg py-1.5 hover:bg-navy-700 disabled:opacity-40 transition-colors"
                >
                  Add Task
                </button>
                <button
                  onClick={() => setAdding(null)}
                  className="text-xs font-bold text-muted hover:text-navy-600 px-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Task cards */}
          <div className="flex flex-col gap-3 flex-1">
            {tasksFor(col.key).map(task => (
              <div key={task.id} className="bg-white border border-border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow group">

                <div className="flex items-start justify-between gap-2 mb-2">
                  <p className="text-sm font-bold text-navy-800 leading-tight">{task.title}</p>
                  <button
                    onClick={() => handleDelete(task.id)}
                    className="opacity-0 group-hover:opacity-100 transition-opacity text-muted hover:text-red-500 flex-shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Due date */}
                {task.due_date && (
                  <div className="flex items-center gap-1 mb-2">
                    <Calendar className="w-3 h-3 text-muted" />
                    <span className="text-xs text-muted font-semibold">
                      {new Date(task.due_date).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}
                    </span>
                  </div>
                )}

                {/* Assignee + move buttons */}
                <div className="flex items-center justify-between mt-3">
                  {task.assignee ? (
                    <div className="flex items-center gap-1.5">
                      <div className="w-5 h-5 rounded-full bg-navy-100 overflow-hidden flex items-center justify-center text-xs font-black text-navy-600">
                        {task.assignee.avatar_url ? (
                          <Image src={task.assignee.avatar_url} alt={task.assignee.name} width={20} height={20} className="object-cover" />
                        ) : task.assignee.name.charAt(0)}
                      </div>
                      <span className="text-xs font-semibold text-muted truncate max-w-[80px]">{task.assignee.name}</span>
                    </div>
                  ) : <span />}

                  <div className="flex gap-1">
                    {colIdx > 0 && (
                      <button
                        onClick={() => handleMove(task.id, "left")}
                        className="w-6 h-6 rounded-lg bg-[#F7F8FA] hover:bg-navy-100 flex items-center justify-center text-muted hover:text-navy-600 transition-colors"
                      >
                        <ArrowLeft className="w-3 h-3" />
                      </button>
                    )}
                    {colIdx < COLUMNS.length - 1 && (
                      <button
                        onClick={() => handleMove(task.id, "right")}
                        className="w-6 h-6 rounded-lg bg-[#F7F8FA] hover:bg-navy-100 flex items-center justify-center text-muted hover:text-navy-600 transition-colors"
                      >
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            ))}

            {tasksFor(col.key).length === 0 && adding !== col.key && (
              <div className="border-2 border-dashed border-border rounded-xl p-6 text-center text-muted text-xs font-medium">
                No tasks here
              </div>
            )}
          </div>

        </div>
      ))}
    </div>
  )
}
