"use client"

import { useState, useTransition } from "react"
import Image from "next/image"
import { postStory, deleteStory, toggleReaction } from "@/lib/actions/stories.actions"
import { getTokenTier } from "@/lib/tokens"
import { Trash2, Send, Flame, Heart, Trophy, Star } from "lucide-react"

interface Reaction { id: string; emoji: string; member_id: string }
interface Story {
  id: string
  content: string
  image_url: string | null
  created_at: string
  member: { id: string; name: string; avatar_url: string | null; tokens: number } | null
  story_reactions: Reaction[]
}

const EMOJI_OPTIONS = ["🔥", "❤️", "🏆", "⭐", "👏", "💡"]
const EMOJI_ICONS: Record<string, React.ReactNode> = {
  "🔥": <Flame className="w-3.5 h-3.5" />,
  "❤️": <Heart className="w-3.5 h-3.5" />,
  "🏆": <Trophy className="w-3.5 h-3.5" />,
  "⭐": <Star className="w-3.5 h-3.5" />,
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return "just now"
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function StoriesFeed({
  initialStories,
  currentUserId,
}: {
  initialStories: Story[]
  currentUserId: string
}) {
  const [stories, setStories] = useState<Story[]>(initialStories)
  const [draft, setDraft] = useState("")
  const [, startTransition] = useTransition()

  const handlePost = () => {
    if (!draft.trim()) return
    const optimistic: Story = {
      id: `opt-${Date.now()}`,
      content: draft.trim(),
      image_url: null,
      created_at: new Date().toISOString(),
      member: null,
      story_reactions: [],
    }
    setStories(prev => [optimistic, ...prev])
    const text = draft.trim()
    setDraft("")
    startTransition(async () => {
      const fd = new FormData()
      fd.set("content", text)
      await postStory(fd)
    })
  }

  const handleDelete = (id: string) => {
    setStories(prev => prev.filter(s => s.id !== id))
    startTransition(async () => { await deleteStory(id) })
  }

  const handleReact = (storyId: string, emoji: string) => {
    setStories(prev => prev.map(s => {
      if (s.id !== storyId) return s
      const existing = s.story_reactions.find(r => r.member_id === currentUserId)
      if (existing) {
        return { ...s, story_reactions: s.story_reactions.filter(r => r.member_id !== currentUserId) }
      }
      return { ...s, story_reactions: [...s.story_reactions, { id: `opt-r-${Date.now()}`, emoji, member_id: currentUserId }] }
    }))
    startTransition(async () => { await toggleReaction(storyId, emoji) })
  }

  return (
    <div className="space-y-5">
      {/* Compose box */}
      <div className="bg-white border border-border rounded-2xl p-4 shadow-sm">
        <textarea
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => { if (e.key === "Enter" && e.metaKey) handlePost() }}
          placeholder="Share a win, a project, an insight… what are you working on? ✨"
          rows={3}
          className="w-full text-sm font-medium text-navy-800 bg-transparent outline-none resize-none placeholder:text-muted"
        />
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <p className="text-xs text-muted font-medium">⌘ + Enter to post · earn 5 tokens</p>
          <button
            onClick={handlePost}
            disabled={!draft.trim()}
            className="flex items-center gap-1.5 px-4 py-2 bg-navy-600 text-white text-sm font-bold rounded-xl hover:bg-navy-700 disabled:opacity-40 transition-colors"
          >
            <Send className="w-3.5 h-3.5" /> Post
          </button>
        </div>
      </div>

      {/* Stories */}
      {stories.length === 0 ? (
        <div className="bg-white border-2 border-dashed border-border rounded-2xl p-12 text-center">
          <p className="font-bold text-muted">No stories yet.</p>
          <p className="text-sm text-muted mt-1">Be the first to share something!</p>
        </div>
      ) : (
        stories.map(story => {
          const tier = getTokenTier(story.member?.tokens ?? 0)
          const myReaction = story.story_reactions.find(r => r.member_id === currentUserId)
          const isOwn = story.member?.id === currentUserId

          // Count by emoji
          const counts: Record<string, number> = {}
          story.story_reactions.forEach(r => { counts[r.emoji] = (counts[r.emoji] ?? 0) + 1 })

          return (
            <div key={story.id} className="bg-white border border-border rounded-2xl p-5 shadow-sm">
              {/* Header */}
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-navy-100 overflow-hidden flex items-center justify-center text-navy-600 font-black text-sm">
                      {story.member?.avatar_url ? (
                        <Image src={story.member.avatar_url} alt={story.member.name} width={40} height={40} className="object-cover" />
                      ) : (
                        story.member?.name.charAt(0).toUpperCase() ?? "?"
                      )}
                    </div>
                    {/* Tier badge */}
                    {story.member && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4">
                        <Image
                          src="/ingeniusly-ghana-mark.png"
                          alt={tier.label}
                          width={16}
                          height={16}
                          className="object-contain"
                          style={{ filter: tier.filter }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-black text-navy-800">{story.member?.name ?? "Skiller"}</p>
                    <p className={`text-xs font-bold ${tier.color}`}>{tier.label} · {timeAgo(story.created_at)}</p>
                  </div>
                </div>
                {isOwn && !story.id.startsWith("opt-") && (
                  <button
                    onClick={() => handleDelete(story.id)}
                    className="text-muted hover:text-red-500 transition-colors p-1"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Content */}
              <p className="text-sm font-medium text-navy-800 leading-relaxed whitespace-pre-wrap mb-4">
                {story.content}
              </p>

              {/* Image */}
              {story.image_url && (
                <div className="rounded-xl overflow-hidden mb-4">
                  <img src={story.image_url} alt="Story" className="w-full max-h-64 object-cover" />
                </div>
              )}

              {/* Reactions */}
              <div className="flex items-center gap-2 flex-wrap">
                {EMOJI_OPTIONS.map(emoji => {
                  const count = counts[emoji] ?? 0
                  const isActive = myReaction?.emoji === emoji
                  return (
                    <button
                      key={emoji}
                      onClick={() => handleReact(story.id, emoji)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                        isActive
                          ? "bg-gold-100 text-gold-700 border border-gold-300"
                          : "bg-[#F7F8FA] text-muted hover:bg-navy-50 hover:text-navy-600 border border-transparent"
                      }`}
                    >
                      {EMOJI_ICONS[emoji] ?? <span>{emoji}</span>}
                      {count > 0 && <span>{count}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })
      )}
    </div>
  )
}
