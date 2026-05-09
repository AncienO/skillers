"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { google } from "googleapis"

// ─── GOOGLE MEET (via Calendar API + Service Account) ────────────────────────

async function getGoogleCalendarClient() {
  const auth = new google.auth.JWT({
    email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    key:   process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
    scopes: ["https://www.googleapis.com/auth/calendar"],
  })
  return google.calendar({ version: "v3", auth })
}

export async function createGoogleMeetMeeting(title: string, scheduledAt: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  try {
    const calendar   = await getGoogleCalendarClient()
    const startTime  = new Date(scheduledAt)
    const endTime    = new Date(startTime.getTime() + 60 * 60 * 1000) // 1 hour

    const event = await calendar.events.insert({
      calendarId:              process.env.GOOGLE_CALENDAR_ID || "primary",
      conferenceDataVersion:   1,
      requestBody: {
        summary:   title,
        start:     { dateTime: startTime.toISOString(), timeZone: "Africa/Accra" },
        end:       { dateTime: endTime.toISOString(),   timeZone: "Africa/Accra" },
        conferenceData: {
          createRequest: {
            requestId:  `sec-${Date.now()}`,
            conferenceSolutionKey: { type: "hangoutsMeet" },
          },
        },
      },
    })

    const meetUrl = event.data.conferenceData?.entryPoints?.[0]?.uri

    if (!meetUrl) return { error: "Google Meet link could not be generated" }

    const { error: dbError } = await supabase.from("sec_meetings").insert({
      title,
      scheduled_at: startTime.toISOString(),
      platform:     "google_meet",
      meeting_url:  meetUrl,
      created_by:   user.id,
    })

    if (dbError) return { error: dbError.message }

    revalidatePath("/sec/workspace/meetings")
    revalidatePath("/sec/workspace")
    return { success: true, meetUrl }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Google Meet"
    return { error: message }
  }
}

// ─── ZOOM (Server-to-Server OAuth) ───────────────────────────────────────────

async function getZoomAccessToken(): Promise<string> {
  const accountId     = process.env.ZOOM_ACCOUNT_ID!
  const clientId      = process.env.ZOOM_CLIENT_ID!
  const clientSecret  = process.env.ZOOM_CLIENT_SECRET!

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64")

  const res = await fetch(
    `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${accountId}`,
    {
      method:  "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    }
  )

  if (!res.ok) throw new Error("Failed to obtain Zoom access token")
  const json = await res.json()
  return json.access_token as string
}

export async function createZoomMeeting(title: string, scheduledAt: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "Not authenticated" }

  try {
    const token      = await getZoomAccessToken()
    const startTime  = new Date(scheduledAt)

    const res = await fetch("https://api.zoom.us/v2/users/me/meetings", {
      method:  "POST",
      headers: {
        Authorization:  `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic:      title,
        type:       2, // scheduled meeting
        start_time: startTime.toISOString(),
        duration:   60,
        timezone:   "Africa/Accra",
        settings: {
          host_video:      true,
          participant_video: true,
          waiting_room:    false,
        },
      }),
    })

    if (!res.ok) {
      const err = await res.json()
      return { error: err.message || "Failed to create Zoom meeting" }
    }

    const meeting = await res.json()
    const joinUrl = meeting.join_url as string

    const { error: dbError } = await supabase.from("sec_meetings").insert({
      title,
      scheduled_at: startTime.toISOString(),
      platform:     "zoom",
      meeting_url:  joinUrl,
      created_by:   user.id,
    })

    if (dbError) return { error: dbError.message }

    revalidatePath("/sec/workspace/meetings")
    revalidatePath("/sec/workspace")
    return { success: true, joinUrl }

  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to create Zoom meeting"
    return { error: message }
  }
}

// ─── SHARED MEETING QUERIES ───────────────────────────────────────────────────

export async function getUpcomingMeetings() {
  const supabase = await createClient()
  const { data, error } = await supabase
    .from("sec_meetings")
    .select(`
      id, title, scheduled_at, platform, meeting_url,
      creator:members!sec_meetings_created_by_fkey ( name )
    `)
    .gte("scheduled_at", new Date().toISOString())
    .order("scheduled_at", { ascending: true })

  if (error) return { data: null, error: error.message }
  return { data, error: null }
}

export async function deleteMeeting(meetingId: string) {
  const supabase = await createClient()
  const { error } = await supabase
    .from("sec_meetings")
    .delete()
    .eq("id", meetingId)

  if (error) return { error: error.message }
  revalidatePath("/sec/workspace/meetings")
  revalidatePath("/sec/workspace")
  return { success: true }
}
