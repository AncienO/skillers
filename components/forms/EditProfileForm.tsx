"use client"

// Import React hooks
import { useState, useTransition, useEffect } from "react"
// Import Server Actions
import { getMyProfile, updateMyProfile } from "@/lib/actions/profile.actions"
import { getDirectoryTags } from "@/lib/actions/directory.actions"
// Import Lucide icons
import { User, Target, FileText, Upload, CheckCircle, AlertCircle, Save } from "lucide-react"

// Export default Edit Profile Form
export default function EditProfileForm() {
  // Profile data state
  const [name, setName] = useState("")
  const [bio, setBio] = useState("")
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [goalId, setGoalId] = useState("")
  const [goalTitle, setGoalTitle] = useState("")
  const [goalDescription, setGoalDescription] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [availableTags, setAvailableTags] = useState<{id: string, label: string}[]>([])
  const [fileName, setFileName] = useState<string | null>(null)

  // UI state
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch profile and tags on mount
  useEffect(() => {
    async function load() {
      // Fetch both in parallel
      const [profileRes, tagsRes] = await Promise.all([
        getMyProfile(),
        getDirectoryTags()
      ])

      // Populate profile fields
      if (profileRes.data) {
        setName(profileRes.data.name)
        setBio(profileRes.data.bio || "")
        setAvatarUrl(profileRes.data.avatar_url)
        setSelectedTags(profileRes.data.tagIds)
        // Populate the first goal if it exists
        if (profileRes.data.goals.length > 0) {
          setGoalId(profileRes.data.goals[0].id)
          setGoalTitle(profileRes.data.goals[0].title)
          setGoalDescription(profileRes.data.goals[0].description || "")
        }
      }

      // Populate available tags
      if (tagsRes.data) setAvailableTags(tagsRes.data)

      setLoading(false)
    }
    load()
  }, [])

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    const formData = new FormData(e.currentTarget)
    formData.append("goal_id", goalId)
    formData.append("tags", JSON.stringify(selectedTags))

    startTransition(async () => {
      const result = await updateMyProfile(formData)
      if (result?.error) {
        setError(result.error)
      } else if (result?.success) {
        setSuccess(true)
        // Auto-dismiss success after 3 seconds
        setTimeout(() => setSuccess(false), 3000)
      }
    })
  }

  // Tag toggle handler
  const toggleTag = (id: string) => {
    setSelectedTags(prev =>
      prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]
    )
  }

  // Loading skeleton
  if (loading) {
    return (
      <div className="glass-panel p-8 rounded-3xl animate-pulse space-y-6">
        <div className="h-8 bg-surface-hover rounded w-1/3" />
        <div className="h-12 bg-surface-hover rounded" />
        <div className="h-12 bg-surface-hover rounded" />
        <div className="h-24 bg-surface-hover rounded" />
      </div>
    )
  }

  // Render form
  return (
    <form onSubmit={handleSubmit} className="space-y-8 glass-panel p-6 sm:p-8 rounded-3xl relative animate-fade-in">

      {/* Personal Details Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
          <User className="w-5 h-5 text-brand-500" /> Personal Details
        </h3>

        {/* Avatar preview + upload */}
        <div className="flex items-center gap-6">
          {/* Current avatar */}
          <div className="w-20 h-20 rounded-full bg-surface border-2 border-border overflow-hidden flex items-center justify-center text-2xl font-bold text-foreground/40 flex-shrink-0">
            {avatarUrl ? (
              <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              name.charAt(0).toUpperCase() || "?"
            )}
          </div>
          {/* Upload new avatar */}
          <div className="flex-grow relative">
            <input
              type="file"
              name="avatar"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setFileName(e.target.files?.[0]?.name || null)}
            />
            <div className="w-full px-4 py-3 bg-surface border border-border rounded-lg border-dashed flex items-center gap-3 text-foreground/60 hover:border-brand-500 transition-colors text-sm">
              <Upload className="w-5 h-5" />
              <span>{fileName ? fileName : "Upload a new photo"}</span>
            </div>
          </div>
        </div>

        {/* Name */}
        <div>
          <label className="block text-sm font-medium mb-1">Full Name *</label>
          <input name="name" required value={name} onChange={e => setName(e.target.value)} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
        </div>

        {/* Bio */}
        <div>
          <label className="block text-sm font-medium mb-1">Short Bio</label>
          <textarea name="bio" rows={3} value={bio} onChange={e => setBio(e.target.value)} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none resize-none" />
        </div>
      </div>

      {/* Goal Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
          <Target className="w-5 h-5 text-brand-500" /> Primary Goal
        </h3>

        <div>
          <label className="block text-sm font-medium mb-1">Goal Title *</label>
          <input name="goal_title" required value={goalTitle} onChange={e => setGoalTitle(e.target.value)} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Goal Description</label>
          <textarea name="goal_description" rows={2} value={goalDescription} onChange={e => setGoalDescription(e.target.value)} className="w-full px-4 py-2 bg-surface border border-border rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none resize-none" />
        </div>
      </div>

      {/* Tags Section */}
      <div className="space-y-4">
        <h3 className="text-xl font-bold flex items-center gap-2 border-b border-border pb-2">
          <FileText className="w-5 h-5 text-brand-500" /> Area of Expertise
        </h3>
        <div className="flex flex-wrap gap-2">
          {availableTags.map(tag => (
            <button
              key={tag.id}
              type="button"
              onClick={() => toggleTag(tag.id)}
              className={`px-3 py-1.5 text-sm rounded-full border transition-all ${
                selectedTags.includes(tag.id) ? "bg-brand-600 border-brand-600 text-white" : "bg-surface border-border hover:border-brand-300 text-foreground/70"
              }`}
            >
              {tag.label}
            </button>
          ))}
        </div>
      </div>

      {/* Feedback */}
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}
      {success && (
        <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Profile updated successfully!</span>
        </div>
      )}

      {/* Submit */}
      <button type="submit" disabled={isPending} className="w-full btn-primary text-lg py-3 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed">
        {isPending ? "Saving..." : "Save Changes"}
        {!isPending && <Save className="w-5 h-5" />}
      </button>

    </form>
  )
}
