import { NextResponse } from "next/server"
import { syncKnessetData } from "@/lib/sync-knesset"

export const dynamic = "force-dynamic"

// Sync Knesset data to database
export async function POST() {
  try {
    const result = await syncKnessetData()
    return NextResponse.json(result)
  } catch (error) {
    console.error("[v0] Sync error:", error)
    return NextResponse.json({ error: "שגיאה בסנכרון נתונים: " + (error as Error).message }, { status: 500 })
  }
}
