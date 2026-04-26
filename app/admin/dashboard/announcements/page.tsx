import { broadcastAnnouncement } from "@/lib/actions/admin.actions"
import AnnouncementForm from "@/components/admin/AnnouncementForm"
import { Megaphone } from "lucide-react"

// Force dynamic rendering
export const dynamic = "force-dynamic"

export default function AnnouncementsPage() {
  return (
    <div className="space-y-8 animate-fade-in">

      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
          <Megaphone className="w-7 h-7 text-brand-500" />
          Announcements
        </h1>
        <p className="text-foreground/60">
          Broadcast an email announcement to all approved members of the community.
        </p>
      </div>

      {/* The announcement form — pass server action as prop */}
      <AnnouncementForm broadcastAction={broadcastAnnouncement} />

    </div>
  )
}
