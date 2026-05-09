"use client"

import { useEffect, useRef, useState, useTransition } from "react"
import Image from "next/image"
import { createBrowserClient } from "@supabase/ssr"
import { postMessage } from "@/lib/actions/workspace.actions"
import { Send } from "lucide-react"

interface Message {
  id: string
  content: string
  created_at: string
  member: { id: string; name: string; avatar_url: string | null; sec_role: string | null } | null
}

interface Props {
  initialMessages: Message[]
  currentUserId: string
}

export default function MessageFeed({ initialMessages, currentUserId }: Props) {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [isPending, startTransition] = useTransition()
  const [draft, setDraft] = useState("")
  const bottomRef = useRef<HTMLDivElement>(null)

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Supabase real-time subscription
  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )

    const channel = supabase
      .channel("sec_messages_feed")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "sec_messages" },
        async (payload) => {
          // Fetch the full message with member info
          const { data } = await supabase
            .from("sec_messages")
            .select(`id, content, created_at, member:members ( id, name, avatar_url, sec_role )`)
            .eq("id", payload.new.id)
            .single()

          if (data) {
            setMessages((prev) => {
              // Avoid duplicates (optimistic already added it)
              if (prev.find((m) => m.id === data.id)) return prev
              return [...prev, data as unknown as Message]
            })
          }
        }
      )
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  const handleSend = () => {
    const content = draft.trim()
    if (!content) return
    setDraft("")

    const formData = new FormData()
    formData.set("content", content)
    startTransition(async () => { await postMessage(formData) })
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  // Group consecutive messages from the same sender
  const formatTime = (iso: string) =>
    new Date(iso).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })

  return (
    <div className="flex flex-col h-full">

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted italic text-sm pt-12">
            No messages yet. Say hello to the team!
          </div>
        )}

        {messages.map((msg, i) => {
          const isOwn    = msg.member?.id === currentUserId
          const prevSame = i > 0 && messages[i - 1].member?.id === msg.member?.id
          return (
            <div key={msg.id} className={`flex items-end gap-2.5 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>

              {/* Avatar — only show for first of a run */}
              <div className={`w-8 h-8 flex-shrink-0 ${prevSame ? "invisible" : ""}`}>
                <div className="w-8 h-8 rounded-full bg-navy-200 flex items-center justify-center text-navy-700 font-black text-xs overflow-hidden">
                  {msg.member?.avatar_url ? (
                    <Image src={msg.member.avatar_url} alt={msg.member.name ?? ""} width={32} height={32} className="object-cover" />
                  ) : (
                    msg.member?.name?.charAt(0).toUpperCase()
                  )}
                </div>
              </div>

              <div className={`max-w-[70%] ${isOwn ? "items-end" : "items-start"} flex flex-col gap-0.5`}>
                {/* Name + time */}
                {!prevSame && (
                  <div className={`flex items-center gap-2 ${isOwn ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-extrabold text-navy-700">
                      {isOwn ? "You" : msg.member?.name}
                    </span>
                    <span className="text-xs text-muted">{formatTime(msg.created_at)}</span>
                  </div>
                )}

                {/* Bubble */}
                <div className={`px-4 py-2.5 rounded-2xl text-sm font-medium leading-relaxed ${
                  isOwn
                    ? "bg-navy-600 text-white rounded-br-sm"
                    : "bg-white border border-border text-navy-800 rounded-bl-sm"
                }`}>
                  {msg.content}
                </div>
              </div>
            </div>
          )
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="px-6 py-4 border-t border-border bg-white">
        <div className="flex items-end gap-3">
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Send a message… (Enter to send, Shift+Enter for new line)"
            rows={1}
            className="flex-1 resize-none bg-[#F7F8FA] border border-border rounded-xl px-4 py-3 text-sm font-medium text-navy-800 placeholder:text-muted focus:outline-none focus:ring-2 focus:ring-navy-600/30 focus:border-navy-600 transition-colors"
            style={{ maxHeight: "120px" }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || isPending}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-navy-600 text-white hover:bg-navy-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  )
}
