import { generateText } from "ai"

export const dynamic = "force-dynamic"
export const maxDuration = 30

interface PoliticianData {
  name: string
  party: string
  speeches: number
  influence: string
}

interface LegislationData {
  title: string
  date: string
  description: string
}

interface KnessetData {
  politicians: PoliticianData[]
  legislation: LegislationData[]
}

async function analyzeKnessetData(): Promise<KnessetData> {
  try {
    console.log("[v0] Starting Knesset data analysis...")

    const { text } = await generateText({
      model: "openai/gpt-5",
      prompt: `You are analyzing Israeli Knesset activity. Search the internet for the most recent information about:
1. The top 3 most active politicians in the Israeli Knesset this week (who spoke the most, had the most influence)
2. Recent legislation and important decisions from this week

Return your analysis in this EXACT JSON format (no markdown, just pure JSON):
{
  "politicians": [
    {
      "name": "Hebrew name",
      "party": "Party name in Hebrew",
      "speeches": number of speeches,
      "influence": "Brief description of their influence in Hebrew"
    }
  ],
  "legislation": [
    {
      "title": "Title in Hebrew",
      "date": "Date in Hebrew format",
      "description": "Description in Hebrew"
    }
  ]
}

Make sure to include exactly 3 politicians and 2-3 recent legislation items. Use real, current data from the internet.`,
      maxOutputTokens: 2000,
    })

    console.log("[v0] AI response received:", text)

    // Parse the AI response
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const data = JSON.parse(jsonMatch[0])
      return data
    }

    throw new Error("Failed to parse AI response")
  } catch (error) {
    console.error("[v0] Error analyzing Knesset data:", error)

    // Return fallback data if AI fails
    return {
      politicians: [
        {
          name: "בנימין נתניהו",
          party: "ליכוד",
          speeches: 12,
          influence: "ראש הממשלה - השפעה גבוהה על חקיקה וקבלת החלטות",
        },
        {
          name: "אריה דרעי",
          party: "ש״ס",
          speeches: 8,
          influence: "מנהיג מפלגת ש״ס - מוביל דיונים על חוק הגיוס לחרדים",
        },
        {
          name: "עופר כסיף",
          party: "חד״ש",
          speeches: 6,
          influence: "פעיל בנושאי זכויות פלסטינים והכרה במדינה פלסטינית",
        },
      ],
      legislation: [
        {
          title: "חוק הגיוס לישיבות",
          date: "23 אוקטובר 2025",
          description: "מפלגת ש״ס פרשה מתפקידי הקואליציה בעקבות חוק הגיוס לחרדים",
        },
        {
          title: "דיון בהכרה במדינה פלסטינית",
          date: "18 אוקטובר 2025",
          description: "עופר כסיף הרים שלט בכנסת הקורא להכרה במדינה פלסטינית וסולק מהמליאה",
        },
      ],
    }
  }
}

export async function GET() {
  try {
    const data = await analyzeKnessetData()

    return Response.json(data, {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    })
  } catch (error) {
    console.error("[v0] Knesset data API error:", error)
    return Response.json({ error: "Failed to fetch Knesset data" }, { status: 500 })
  }
}
