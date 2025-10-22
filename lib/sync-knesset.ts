import { db } from "@/config/db"
import { knessetMembersTable, mkWeeklyStatsTable } from "@/config/schema"
import { fetchKnessetMembers, fetchWeeklySpeeches, getPreviousWeekDates } from "@/lib/knesset-api"
import { sql, and, eq } from "drizzle-orm"

interface SpeechData {
  speechCount: number
  wordCount: number
  topics: Set<string>
}

async function analyzeImpact(mkData: SpeechData): Promise<number> {
  try {
    const speechWeight = mkData.speechCount * 2.5
    const wordWeight = mkData.wordCount / 1000
    const diversityWeight = mkData.topics.size * 1.5
    const baseScore = speechWeight + wordWeight + diversityWeight
    return Math.round(baseScore * 10) / 10
  } catch (error) {
    console.error("[v0] Error analyzing impact:", error)
    return 0
  }
}

export async function syncKnessetData() {
  try {
    console.log("[v0] Starting Knesset data sync...")

    const members = await fetchKnessetMembers(120)
    console.log("[v0] Fetched", members.length, "Knesset members")

    if (members.length === 0) {
      throw new Error("לא נמצאו חברי כנסת מה-API")
    }

    // Sync members to DB
    for (const member of members) {
      await db
        .insert(knessetMembersTable)
        .values({
          mkId: member.id,
          name: member.name,
          nameEn: member.name || "",
          party: member.current_party_name || "ללא מפלגה",
          faction: member.current_role_descriptions || "",
          imgUrl: member.img_url || "",
          email: member.email || "",
          website: member.website || "",
          phone: member.phone || "",
          startDate: member.start_date || null,
          isCurrent: member.is_current,
        })
        .onConflictDoUpdate({
          target: knessetMembersTable.mkId,
          set: {
            name: sql`EXCLUDED.name`,
            party: sql`EXCLUDED.party`,
            isCurrent: sql`EXCLUDED.is_current`,
            updatedAt: new Date(),
          },
        })
    }

    console.log("[v0] ✓ Members synced successfully")

    const { weekStart, weekEnd } = getPreviousWeekDates()
    const weekStartStr = weekStart.toISOString().split("T")[0]
    const weekEndStr = weekEnd.toISOString().split("T")[0]

    console.log("[v0] Fetching REAL speeches for previous week:", weekStartStr, "to", weekEndStr)

    const speechesMap: Map<number, SpeechData> = await fetchWeeklySpeeches(weekStart, weekEnd)
    console.log("[v0] Found speeches from", speechesMap.size, "speakers")

    // Clear previous weekly stats
    await db
      .delete(mkWeeklyStatsTable)
      .where(and(eq(mkWeeklyStatsTable.weekStart, weekStartStr), eq(mkWeeklyStatsTable.weekEnd, weekEndStr)))

    let statsCount = 0

    for (const [mkId, speechData] of speechesMap.entries()) {
      const impactScore = await analyzeImpact(speechData)

      await db.insert(mkWeeklyStatsTable).values({
        mkId,
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        speechCount: speechData.speechCount,
        wordCount: speechData.wordCount,
        impactScore: impactScore.toString(),
        topics: {
          main: Array.from(speechData.topics)[0] || "דיון כללי",
          secondary: Array.from(speechData.topics).slice(1, 3),
        },
      })

      statsCount++
    }

    console.log("[v0] ✓ Generated", statsCount, "weekly stats from REAL data")
    console.log("[v0] ✓ Sync completed successfully!")

    return {
      success: true,
      synced: members.length,
      statsGenerated: statsCount,
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      message: `עודכן בהצלחה! ${members.length} חברי כנסת, ${statsCount} דוחות שבועיים מהשבוע הקודם`,
    }
  } catch (error: any) {
    console.error("[v0] Sync error:", error)
    throw new Error(`שגיאה בסנכרון: ${error.message}`)
  }
}
