"use client"

// Import React hooks
import { useState, useTransition, useEffect } from "react"
// Import Lucide icons
import { User, Mail, FileText, Target, Upload, CheckCircle, AlertCircle } from "lucide-react"
// Import Server Action for registration
import { registerMember } from "@/lib/actions/signup.actions"
// Import action to fetch dynamic tags
import { getDirectoryTags } from "@/lib/actions/directory.actions"

// Export default Client Component for the Registration Form
export default function SignupForm() {
  // State for fetching available tags from DB
  const [availableTags, setAvailableTags] = useState<{id: string, label: string}[]>([])
  // State for user's selected tags
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  // State for UI errors
  const [error, setError] = useState<string | null>(null)
  // State for successful submission
  const [success, setSuccess] = useState(false)
  // Transition hook for form submission state
  const [isPending, startTransition] = useTransition()
  // State for the uploaded file preview label
  const [fileName, setFileName] = useState<string | null>(null)

  // Fetch tags and inject script on mount
  useEffect(() => {
    // Execute server action to get tags
    getDirectoryTags().then(({ data }) => {
      // If data exists, store it in state
      if (data) setAvailableTags(data)
    // End promise
    })
    
    // Inject Turnstile script
    const script = document.createElement("script")
    // Set Cloudflare source
    script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js"
    // Load async
    script.async = true
    // Defer execution
    script.defer = true
    // Append to head
    document.head.appendChild(script)
  // Run once
  }, [])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    // Prevent default browser page reload
    e.preventDefault()
    // Clear previous errors
    setError(null)
    
    // Create FormData object from form element
    const formData = new FormData(e.currentTarget)
    // Append the selected tags array as a JSON string so it can be parsed on the server
    formData.append("tags", JSON.stringify(selectedTags))

    // Start transition for server call
    startTransition(async () => {
      // Call server action with formData
      const result = await registerMember(formData)
      
      // Handle response
      if (result?.error) {
        // Show error message
        setError(result.error)
      // Else if successful
      } else if (result?.success) {
        // Show success state
        setSuccess(true)
      // End if block
      }
    // End transition
    })
  // End handler
  }

  // Handle Tag Selection Toggle
  const toggleTag = (id: string) => {
    // Update state functionally
    setSelectedTags(prev => 
      // Add or remove based on presence
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    // End setter
    )
  // End handler
  }

  // If successful submission, show success UI
  if (success) {
    // Return early with success element
    return (
      // Success Container
      <div className="text-center py-12 px-4 glass-panel rounded-2xl animate-fade-in max-w-lg mx-auto">
        {/* Check Icon */}
        <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-4" />
        {/* Title */}
        <h2 className="text-2xl font-bold mb-3">Application Submitted!</h2>
        {/* Message */}
        <p className="text-foreground/70 mb-6">
          Thank you for joining the Skillers community. Your profile is currently under review by our executive committee. 
          You will receive an email confirmation once approved.
        </p>
      {/* End container */}
      </div>
    // End return
    )
  // End conditional return
  }

  // Return the main form JSX
  return (
    // Form Container with premium styles
    <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-6 sm:p-8 rounded-3xl relative animate-fade-in">
      
      {/* Basic Info Section */}
      <div className="space-y-4">
        {/* Section Title */}
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
          <User className="w-5 h-5 text-brand-500" /> Personal Details
        </h3>
        
        {/* Account Details */}
        <div className="space-y-4">
          {/* Name block */}
          <div>
            {/* Label */}
            <label className="block text-sm font-medium mb-1">Full Name *</label>
            {/* Input */}
            <input name="name" required className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
          {/* End block */}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Email block */}
            <div>
              {/* Label */}
              <label className="block text-sm font-medium mb-1">Email Address *</label>
              {/* Input */}
              <input name="email" type="email" required className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
            {/* End block */}
            </div>
            {/* Password block */}
            <div>
              {/* Label */}
              <label className="block text-sm font-medium mb-1">Password *</label>
              {/* Input */}
              <input name="password" type="password" required minLength={6} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
            {/* End block */}
            </div>
          </div>
        {/* End Account Details */}
        </div>

        {/* Bio Input */}
        <div>
          {/* Label */}
          <label className="block text-sm font-medium mb-1">Short Bio</label>
          {/* Textarea */}
          <textarea name="bio" rows={3} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none resize-none" placeholder="Tell us about yourself..." />
        {/* End block */}
        </div>

        {/* Avatar Upload */}
        <div>
          {/* Label */}
          <label className="block text-sm font-medium mb-1">Profile Avatar</label>
          {/* Upload Wrapper */}
          <div className="relative">
            {/* Hidden Input File */}
            <input 
              type="file" 
              name="avatar" 
              accept="image/*" 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
              onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
            />
            {/* Custom styled file picker UI */}
            <div className="w-full px-4 py-3 bg-surface border border-border rounded-lg border-dashed flex items-center gap-3 text-foreground/60 hover:border-brand-500 transition-colors">
              <Upload className="w-5 h-5" />
              <span>{fileName ? fileName : "Click to upload an image"}</span>
            </div>
          {/* End wrapper */}
          </div>
        {/* End block */}
        </div>
      {/* End Basic Info Section */}
      </div>

      {/* Primary Goal Section */}
      <div className="space-y-4">
        {/* Section Title */}
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
          <Target className="w-5 h-5 text-brand-500" /> Primary Goal
        </h3>
        
        {/* Goal Title */}
        <div>
          {/* Label */}
          <label className="block text-sm font-medium mb-1">Goal Title *</label>
          {/* Input */}
          <input name="goal_title" required placeholder="e.g. Launch my first SaaS product" className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
        {/* End block */}
        </div>

        {/* Goal Description */}
        <div>
          {/* Label */}
          <label className="block text-sm font-medium mb-1">Goal Description</label>
          {/* Textarea */}
          <textarea name="goal_description" rows={2} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none resize-none" placeholder="Elaborate on how you plan to achieve this..." />
        {/* End block */}
        </div>
      {/* End Primary Goal Section */}
      </div>

      {/* Tags Section */}
      <div className="space-y-4">
        {/* Section Title */}
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
          <FileText className="w-5 h-5 text-brand-500" /> Area of Expertise
        </h3>
        {/* Helper text */}
        <p className="text-sm text-foreground/60 mb-2">Select the tags that best represent your skills.</p>
        
        {/* Tags flex container */}
        <div className="flex flex-wrap gap-2">
          {/* Map available tags */}
          {availableTags.map(tag => (
            // Tag button toggle
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                selectedTags.includes(tag.id) ? "bg-brand-600 border-brand-600 text-white" : "bg-surface border-border hover:border-brand-300 text-foreground/70"
              }`}
            >
              {/* Tag text */}
              {tag.label}
            {/* End button */}
            </button>
          // End map
          ))}
        {/* End container */}
        </div>
      {/* End Tags Section */}
      </div>

      {/* Cloudflare Turnstile CAPTCHA Box rendering target */}
      <div className="cf-turnstile" data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}></div>

      {/* Error Message rendering */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* Submit Button */}
      <button type="submit" disabled={isPending} className="w-full btn-primary text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {/* Dynamic button text */}
        {isPending ? "Submitting Application..." : "Join the Community"}
      {/* End button */}
      </button>

    {/* End Form */}
    </form>
  // End return
  )
// End component
}
