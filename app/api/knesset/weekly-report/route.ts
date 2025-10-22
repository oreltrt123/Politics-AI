import { NextResponse } from "next/server"
import { db } from "@/config/db"
import { knessetMembersTable, mkWeeklyStatsTable } from "@/config/schema"
import { desc, eq, sql } from "drizzle-orm"
import { getPreviousWeekDates } from "@/lib/knesset-api"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const { weekStart, weekEnd } = getPreviousWeekDates()
    const weekStartStr = weekStart.toISOString().split("T")[0]
    const weekEndStr = weekEnd.toISOString().split("T")[0]

    console.log("[v0] Fetching weekly report for:", weekStartStr, "to", weekEndStr)

    const topSpeakers = await db
      .select({
        mk_id: knessetMembersTable.mkId,
        name: knessetMembersTable.name,
        party: knessetMembersTable.party,
        img_url: knessetMembersTable.imgUrl,
        speech_count: mkWeeklyStatsTable.speechCount,
        word_count: mkWeeklyStatsTable.wordCount,
        impact_score: mkWeeklyStatsTable.impactScore,
        topics: mkWeeklyStatsTable.topics,
      })
      .from(mkWeeklyStatsTable)
      .innerJoin(knessetMembersTable, eq(mkWeeklyStatsTable.mkId, knessetMembersTable.mkId))
      .where(eq(mkWeeklyStatsTable.weekStart, weekStartStr))
      .orderBy(desc(mkWeeklyStatsTable.impactScore))
      .limit(10)

    console.log("[v0] Found", topSpeakers.length, "top speakers")

    const totalStats = await db
      .select({
        totalSpeeches: sql<number>`SUM(${mkWeeklyStatsTable.speechCount})`,
        totalWords: sql<number>`SUM(${mkWeeklyStatsTable.wordCount})`,
        activeMKs: sql<number>`COUNT(DISTINCT ${mkWeeklyStatsTable.mkId})`,
      })
      .from(mkWeeklyStatsTable)
      .where(eq(mkWeeklyStatsTable.weekStart, weekStartStr))

    return NextResponse.json({
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      topSpeakers,
      stats: totalStats[0] || { totalSpeeches: 0, totalWords: 0, activeMKs: 0 },
    })
  } catch (error) {
    console.error("[v0] Error fetching weekly report:", error)
    return NextResponse.json({ error: "שגיאה בטעינת הדוח השבועי" }, { status: 500 })
  }
}
