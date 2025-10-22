import { NextResponse } from "next/server"
import { syncKnessetData } from "@/lib/sync-knesset"

export const dynamic = "force-dynamic"

// This endpoint is called by Vercel Cron every Sunday at midnight
export async function GET(req: Request) {
  try {
    const authHeader = req.headers.get("authorization")
    if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await syncKnessetData()

    return NextResponse.json({
  ...result,
  success: true, // override if needed
  message: "עדכון שבועי הושלם בהצלחה", // override if needed
    })
  } catch (error) {
    console.error("[v0] Weekly update error:", error)
    return NextResponse.json({ error: "העדכון נכשל" }, { status: 500 })
  }
}
