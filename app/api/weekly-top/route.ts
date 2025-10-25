// app/api/weekly-top/route.ts
import { NextResponse } from "next/server";
import { db } from "@/config/db";
import { knessetMembersTable, mkWeeklyStatsTable } from "@/config/schema";
import { desc, sql } from "drizzle-orm";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // Step 1: find the latest weekStart value for which stats exist
    const latest = await db
      .select({ weekStart: mkWeeklyStatsTable.weekStart })
      .from(mkWeeklyStatsTable)
      .orderBy(desc(mkWeeklyStatsTable.weekStart))
      .limit(1);

    if (!latest || latest.length === 0) {
      return NextResponse.json({ first: null, second: null, third: null, others: [] });
    }

    const weekStartValue = latest[0].weekStart;

    // Step 2: query top MKs for that week
    const results = await db
      .select({
        mkId: mkWeeklyStatsTable.mkId,
        name: knessetMembersTable.name,
        party: knessetMembersTable.party,
        speech_count: mkWeeklyStatsTable.speechCount,
        impact_score: mkWeeklyStatsTable.impactScore,
      })
      .from(mkWeeklyStatsTable)
      .innerJoin(
        knessetMembersTable,
        sql`${mkWeeklyStatsTable.mkId} = ${knessetMembersTable.mkId}`
      )
      .where(sql`${mkWeeklyStatsTable.weekStart} = ${weekStartValue}`)
      .orderBy(desc(mkWeeklyStatsTable.impactScore))
      .limit(10);

    if (!results || results.length === 0) {
      return NextResponse.json({ first: null, second: null, third: null, others: [] });
    }

    const mapped = results.map((r) => ({
      name: r.name,
      party: r.party,
      speech_count: r.speech_count,
      impact_score: r.impact_score,
      highlights: [], // You can fill later if you capture highlight data
    }));

    const [first, second, third, ...others] = mapped;

    return NextResponse.json({ first, second, third, others });
  } catch (error: any) {
    console.error("[weekly-top] error:", error);
    return NextResponse.json(
      { error: "שגיאה בטעינת הנתונים השבועיים: " + error.message },
      { status: 500 }
    );
  }
}
