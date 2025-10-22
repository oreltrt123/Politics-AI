// Open Knesset API integration
const OPEN_KNESSET_BASE_URL = "https://oknesset.org/api/v2"

export interface KnessetMember {
  id: number
  name: string
  current_party_name?: string
  current_role_descriptions?: string
  img_url?: string
  email?: string
  website?: string
  phone?: string
  start_date?: string
  end_date?: string
  is_current: boolean
}

export interface CommitteeMeeting {
  id: number
  committee_name: string
  date: string
  protocol_text?: string
  topics?: string
}

export async function fetchKnessetMembers(limit = 100): Promise<KnessetMember[]> {
  try {
    const response = await fetch(
      `${OPEN_KNESSET_BASE_URL}/member/?is_current=true&limit=${limit}`,
      { next: { revalidate: 3600 } }, // Cache for 1 hour
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch members: ${response.statusText}`)
    }

    const data = await response.json()
    return data.objects || []
  } catch (error) {
    console.error("[v0] Error fetching Knesset members:", error)
    return []
  }
}

export async function fetchMemberById(id: number): Promise<KnessetMember | null> {
  try {
    const response = await fetch(`${OPEN_KNESSET_BASE_URL}/member/${id}/`, { next: { revalidate: 3600 } })

    if (!response.ok) {
      return null
    }

    return await response.json()
  } catch (error) {
    console.error("[v0] Error fetching member:", error)
    return null
  }
}

export async function fetchRecentCommitteeMeetings(days = 7): Promise<CommitteeMeeting[]> {
  try {
    const date = new Date()
    date.setDate(date.getDate() - days)
    const dateStr = date.toISOString().split("T")[0]

    const response = await fetch(
      `${OPEN_KNESSET_BASE_URL}/committee-meeting/?date__gte=${dateStr}&limit=50`,
      { next: { revalidate: 1800 } }, // Cache for 30 minutes
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch meetings: ${response.statusText}`)
    }

    const data = await response.json()
    return data.objects || []
  } catch (error) {
    console.error("[v0] Error fetching committee meetings:", error)
    return []
  }
}

export async function searchKnessetData(query: string): Promise<any> {
  try {
    // Search across members, bills, and meetings
    const [members, bills] = await Promise.all([
      fetch(`${OPEN_KNESSET_BASE_URL}/member/?search=${encodeURIComponent(query)}&limit=10`).then((r) =>
        r.ok ? r.json() : { objects: [] },
      ),
      fetch(`${OPEN_KNESSET_BASE_URL}/bill/?search=${encodeURIComponent(query)}&limit=10`).then((r) =>
        r.ok ? r.json() : { objects: [] },
      ),
    ])

    return {
      members: members.objects || [],
      bills: bills.objects || [],
    }
  } catch (error) {
    console.error("[v0] Error searching Knesset data:", error)
    return { members: [], bills: [] }
  }
}

export async function fetchWeeklySpeeches(weekStart: Date, weekEnd: Date): Promise<Map<number, any>> {
  try {
    const startStr = weekStart.toISOString().split("T")[0]
    const endStr = weekEnd.toISOString().split("T")[0]

    console.log("[v0] Fetching committee meetings from", startStr, "to", endStr)

    const response = await fetch(
      `${OPEN_KNESSET_BASE_URL}/committee-meeting/?date__gte=${startStr}&date__lte=${endStr}&limit=200`,
      { cache: "no-store" },
    )

    if (!response.ok) {
      console.error("[v0] Failed to fetch meetings:", response.statusText)
      return new Map()
    }

    const data = await response.json()
    const meetings = data.objects || []

    console.log("[v0] Found", meetings.length, "committee meetings")

    // Map MK ID to their speech data
    const mkSpeeches = new Map<number, any>()

    for (const meeting of meetings) {
      // Fetch detailed meeting info with protocol
      try {
        const detailResponse = await fetch(`${OPEN_KNESSET_BASE_URL}/committee-meeting/${meeting.id}/`, {
          cache: "no-store",
        })

        if (detailResponse.ok) {
          const detail = await detailResponse.json()
          const protocol = detail.protocol_text || ""
          const parts = detail.parts || []

          // Count speeches per MK in this meeting
          for (const part of parts) {
            if (part.header && part.body) {
              // Try to extract MK name from header
              const mkName = part.header.trim()
              const wordCount = part.body.split(/\s+/).length

              // Store speech data (we'll match to MK IDs later)
              if (!mkSpeeches.has(mkName)) {
                mkSpeeches.set(mkName, {
                  name: mkName,
                  speechCount: 0,
                  wordCount: 0,
                  topics: new Set(),
                  meetings: [],
                })
              }

              const mkData = mkSpeeches.get(mkName)!
              mkData.speechCount++
              mkData.wordCount += wordCount
              mkData.meetings.push({
                committee: meeting.committee_name,
                date: meeting.date,
                text: part.body.substring(0, 500), // First 500 chars for AI analysis
              })

              // Extract topics from committee name
              if (meeting.committee_name) {
                mkData.topics.add(meeting.committee_name)
              }
            }
          }
        }
      } catch (err) {
        console.error("[v0] Error fetching meeting detail:", err)
      }
    }

    console.log("[v0] Processed speeches for", mkSpeeches.size, "speakers")
    return mkSpeeches
  } catch (error) {
    console.error("[v0] Error fetching weekly speeches:", error)
    return new Map()
  }
}

export function getPreviousWeekDates(): { weekStart: Date; weekEnd: Date } {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 6 = Saturday

  // Calculate last Sunday (start of previous week)
  const weekEnd = new Date(now)
  weekEnd.setDate(now.getDate() - dayOfWeek - 1) // Last Saturday
  weekEnd.setHours(23, 59, 59, 999)

  const weekStart = new Date(weekEnd)
  weekStart.setDate(weekEnd.getDate() - 6) // 7 days before (last Sunday)
  weekStart.setHours(0, 0, 0, 0)

  return { weekStart, weekEnd }
}
