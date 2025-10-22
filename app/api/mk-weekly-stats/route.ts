import { NextResponse } from "next/server"
import { db } from "@/config/db"
import { knessetMembersTable, mkWeeklyStatsTable } from "@/config/schema"
import { desc, sql } from "drizzle-orm"

export async function GET() {
  try {
    const stats = await db
      .select({
        mk_id: knessetMembersTable.mkId,
        name: knessetMembersTable.name,
        party: knessetMembersTable.party,
        speech_count: mkWeeklyStatsTable.speechCount,
        impact_score: mkWeeklyStatsTable.impactScore,
      })
      .from(mkWeeklyStatsTable)
      .innerJoin(knessetMembersTable, sql`${mkWeeklyStatsTable.mkId} = ${knessetMembersTable.mkId}`)
      .orderBy(desc(mkWeeklyStatsTable.weekStart))
      .limit(20)

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Error fetching weekly stats:", error)
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 })
  }
}
