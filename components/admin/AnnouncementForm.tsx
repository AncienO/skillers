"use client"

// Import React hooks
import { useState, useTransition } from "react"
// Import Lucide icons
import { Send, CheckCircle, AlertCircle } from "lucide-react"

// Define props
interface AnnouncementFormProps {
  broadcastAction: (formData: FormData) => Promise<{ success?: boolean; error?: string; count?: number }>
}

// Export default client component
export default function AnnouncementForm({ broadcastAction }: AnnouncementFormProps) {
  // UI state
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const result = await broadcastAction(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(`Announcement sent to ${result.count || 0} members!`)
        // Reset the form
        e.currentTarget.reset()
      }
    })
  }

  return (
    <form onSubmit={handleSubmit} className="glass-panel p-6 sm:p-8 rounded-2xl space-y-6 animate-fade-in">

      {/* Subject */}
      <div>
        <label className="block text-sm font-medium mb-1">Subject *</label>
        <input
          name="subject"
          required
          placeholder="e.g. Community Update — April 2026"
          className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none"
        />
      </div>

      {/* Message body */}
      <div>
        <label className="block text-sm font-medium mb-1">Message *</label>
        <textarea
          name="message"
          required
          rows={6}
          placeholder="Write your announcement here..."
          className="w-full px-4 py-3 bg-surface border border-border rounded-xl focus:ring-2 focus:ring-brand-500/50 outline-none resize-none"
        />
      </div>

      {/* Feedback */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          <span>{success}</span>
        </div>
      )}

      {/* Submit */}
      <button
        type="submit"
        disabled={isPending}
        className="btn-primary flex items-center gap-2 text-sm px-6 py-3 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isPending ? "Sending..." : "Broadcast Announcement"}
        {!isPending && <Send className="w-4 h-4" />}
      </button>

    </form>
  )
}
