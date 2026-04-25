"use client"

// Import React hooks
import { useState, useTransition } from "react"
// Import Server action
import { sendConnectionRequest } from "@/lib/actions/connect.actions"
// Import Lucide icons
import { Mail, X, Send, CheckCircle, AlertCircle } from "lucide-react"

// Define Props
interface ConnectFormProps {
  memberId: string
  memberName: string
  goals: { id: string; title: string }[]
}

// Export default Connect Form Client Component
export default function ConnectForm({ memberId, memberName, goals }: ConnectFormProps) {
  // State to control modal visibility
  const [isOpen, setIsOpen] = useState(false)
  // Form submission state hooks
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent reload
    e.preventDefault()
    // Reset error
    setError(null)
    
    // Wrap form in FormData
    const formData = new FormData(e.currentTarget)
    // Append the target member ID securely
    formData.append("to_member_id", memberId)

    // Execute server action inside transition
    startTransition(async () => {
      // Call action
      const result = await sendConnectionRequest(formData)
      
      // Check error
      if (result?.error) {
        // Set error
        setError(result.error)
      } else if (result?.success) {
        // Set success
        setSuccess(true)
      }
    // End transition
    })
  // End handleSubmit
  }

  // Handle modal closing
  const handleClose = () => {
    // Close modal visually
    setIsOpen(false)
    // Reset state after closing animation duration
    setTimeout(() => {
      setSuccess(false)
      setError(null)
    }, 300)
  // End handleClose
  }

  // Return JSX
  return (
    // Fragment wrapper
    <>
      {/* Trigger Button */}
      <button 
        onClick={() => setIsOpen(true)}
        className="btn-primary flex items-center justify-center gap-2 relative z-10"
      >
        <Mail className="w-4 h-4" /> Reach Out
      {/* End Button */}
      </button>

      {/* Modal Overlay */}
      {isOpen && (
        // Fixed Container
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
          {/* Backdrop Clickable Area */}
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={handleClose}
          />
          
          {/* Modal Content Box */}
          <div className="glass-panel w-full max-w-lg rounded-3xl relative z-10 overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-border/50 bg-surface/50">
              {/* Header Title */}
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Mail className="w-5 h-5 text-brand-500" />
                Connect with {memberName}
              </h2>
              {/* Close Button */}
              <button 
                onClick={handleClose}
                className="p-2 text-foreground/50 hover:text-foreground hover:bg-surface-hover rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            {/* End Header */}
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              {/* Conditional Success Render */}
              {success ? (
                // Success State Container
                <div className="text-center py-8">
                  {/* Success Icon */}
                  <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
                  {/* Title */}
                  <h3 className="text-xl font-bold mb-2">Message Sent!</h3>
                  {/* Body Text */}
                  <p className="text-foreground/70 mb-6">
                    Your connection request has been sent to {memberName}. They will reply to your email address directly if they are interested!
                  </p>
                  {/* Close action */}
                  <button onClick={handleClose} className="btn-primary">
                    Close Window
                  </button>
                {/* End Success State */}
                </div>
              ) : (
                // Form State Container
                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Helper Text */}
                  <p className="text-sm text-foreground/70 mb-4">
                    Send a direct message. Your email address will be shared so they can reply.
                  </p>

                  {/* Two column grid */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {/* Name Input */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Name *</label>
                      <input name="from_name" required className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
                    </div>
                    {/* Email Input */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Your Email *</label>
                      <input name="from_email" type="email" required className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
                    </div>
                  {/* End grid */}
                  </div>

                  {/* Optional Goal selection if target member has goals */}
                  {goals.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Regarding Goal (Optional)</label>
                      <select name="goal_id" className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none appearance-none">
                        <option value="">Just saying hi...</option>
                        {goals.map(goal => (
                          <option key={goal.id} value={goal.id}>{goal.title}</option>
                        ))}
                      </select>
                    </div>
                  )}

                  {/* Message Body */}
                  <div>
                    <label className="block text-sm font-medium mb-1">Message *</label>
                    <textarea 
                      name="message" 
                      required 
                      rows={4} 
                      className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none resize-none"
                      placeholder="Hi, I saw your profile and wanted to reach out because..."
                    />
                  </div>

                  {/* Error display */}
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Action row */}
                  <div className="pt-4 flex justify-end gap-3 border-t border-border/50">
                    {/* Cancel Button */}
                    <button type="button" onClick={handleClose} className="px-5 py-2 font-medium text-foreground/70 hover:bg-surface-hover rounded-xl transition-colors">
                      Cancel
                    </button>
                    {/* Submit Button */}
                    <button type="submit" disabled={isPending} className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
                      {isPending ? "Sending..." : "Send Message"}
                      {!isPending && <Send className="w-4 h-4" />}
                    </button>
                  {/* End Action row */}
                  </div>
                {/* End Form */}
                </form>
              // End Conditional
              )}
            {/* End Modal Body */}
            </div>
          {/* End Modal Content Box */}
          </div>
        {/* End Fixed Container */}
        </div>
      // End conditional render
      )}
    {/* End Fragment */}
    </>
  // End return
  )
// End ConnectForm
}
