import { type NextRequest, NextResponse } from "next/server"
import { OpenAI } from "openai"
import { db } from "@/config/db"
import { knessetMembersTable, mkWeeklyStatsTable } from "@/config/schema"
import { desc, sql } from "drizzle-orm"

export const dynamic = "force-dynamic"

interface ChatMessage {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "לא נשלחו הודעות" }, { status: 400 })
    }

    for (const msg of messages) {
      if (!msg.role || !msg.content || !["user", "assistant", "system"].includes(msg.role)) {
        return NextResponse.json({ error: "מבנה הודעה לא תקין" }, { status: 400 })
      }
    }

    let knessetContext = ""
    try {
      const recentStats = await db
        .select({
          name: knessetMembersTable.name,
          party: knessetMembersTable.party,
          speech_count: mkWeeklyStatsTable.speechCount,
          impact_score: mkWeeklyStatsTable.impactScore,
        })
        .from(mkWeeklyStatsTable)
        .innerJoin(knessetMembersTable, sql`${mkWeeklyStatsTable.mkId} = ${knessetMembersTable.mkId}`)
        .orderBy(desc(mkWeeklyStatsTable.weekStart))
        .limit(20)

      if (recentStats.length > 0) {
        knessetContext = `\n\nמידע עדכני על חברי כנסת מהשבוע האחרון:\n${recentStats
          .map((mk) => `- ${mk.name} (${mk.party}): ${mk.speech_count} נאומים, ציון השפעה: ${mk.impact_score}`)
          .join("\n")}\n\nענה על השאלות בעברית ובהתבסס על המידע הזה.`
      } else {
        knessetContext = "\n\nאין נתונים זמינים על חברי כנסת מהשבוע האחרון.\n\nענה על השאלות בעברית."
      }
    } catch (error) {
      console.error("[v0] Error fetching Knesset context:", error)
      knessetContext = "\n\nשגיאה בטעינת נתוני חברי כנסת. אנא נסה שוב מאוחר יותר.\n\nענה על השאלות בעברית."
    }

    const encoder = new TextEncoder()

    const readable = new ReadableStream({
      async start(controller) {
        try {
          const apiKey = process.env.OPENAI_API_KEY
          if (!apiKey) {
            controller.enqueue(encoder.encode("שגיאה: מפתח API של OpenAI לא מוגדר. אנא הוסף OPENAI_API_KEY למשתני הסביבה."))
            controller.close()
            return
          }

          const openai = new OpenAI({ apiKey })

          const messagesWithContext: ChatMessage[] = [...messages]
          if (knessetContext && messagesWithContext.length > 0) {
            messagesWithContext[0] = {
              ...messagesWithContext[0],
              content: messagesWithContext[0].content + knessetContext,
            }
          }

          const stream = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: messagesWithContext.map((msg) => ({
              role: msg.role,
              content: msg.content,
            })),
            stream: true,
          })

          for await (const chunk of stream) {
            try {
              if (chunk.choices[0]?.delta?.content) {
                controller.enqueue(encoder.encode(chunk.choices[0].delta.content))
              }
            } catch (chunkError) {
              console.error("Stream chunk error:", chunkError)
              controller.enqueue(encoder.encode("שגיאה בעיבוד התגובה מהמודל"))
              controller.close()
              return
            }
          }

          controller.close()
        } catch (error: any) {
          console.error("Streaming error:", error.message)
          controller.enqueue(encoder.encode(`שגיאה: ${error.message}`))
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error: any) {
    console.error("API error:", error)
    return NextResponse.json({ error: `שגיאה פנימית בשרת: ${error.message}` }, { status: 500 })
  }
}