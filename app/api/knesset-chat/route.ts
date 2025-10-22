// app/api/knesset-chat/route.ts
import { NextResponse } from "next/server";

type SerpResult = {
  title?: string;
  snippet?: string;
  link?: string;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const messages = body.messages;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastUserMsg = messages[messages.length - 1].content;
    if (!lastUserMsg || typeof lastUserMsg !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // --- 1) Run web search with SerpAPI ---
    const serpKey = process.env.SERPAPI_KEY;
    if (!serpKey) {
      return NextResponse.json({ error: "SERPAPI_KEY not set in environment" }, { status: 500 });
    }

    const serpUrl = `https://serpapi.com/search.json?q=${encodeURIComponent(
      lastUserMsg
    )}&hl=he&gl=il&num=10&source=web&api_key=${serpKey}`;

    const serpResp = await fetch(serpUrl);
    if (!serpResp.ok) {
      const text = await serpResp.text();
      return NextResponse.json({ error: "SerpAPI error", details: text }, { status: 500 });
    }
    const serpJson = await serpResp.json();

    const organic: SerpResult[] = serpJson.organic_results || [];
    // Map to simple structure
    const sources = organic.map((r: any) => ({
      title: r.title || r.title_no_formatting || r.serpapi_link || "אין כותרת",
      snippet: r.snippet || r.snippet_highlighted || "",
      link: r.link || r.url || r.serpapi_link || "",
    }));

    // --- 2) Fetch MK list from OKnesset for mention identification ---
    // We'll try oknesset members endpoint (format=json)
    let mkNames: string[] = [];
    try {
      const okResp = await fetch("https://oknesset.org/api/v2/members/?format=json");
      if (okResp.ok) {
        const okJson = await okResp.json();
        const objects = okJson.objects || [];
        // The OKnesset member object may have fields like 'name' or 'name_he' depending on API.
        mkNames = objects
          .map((o: any) => (o.name ? o.name : o.full_name ? o.full_name : o.name_he ? o.name_he : null))
          .filter(Boolean)
          .map((n: string) => n.trim());
      } else {
        // fallback: small static list (if oknesset fails) — you can extend
        mkNames = [];
      }
    } catch (e) {
      console.error("OKnesset fetch error:", e);
      mkNames = [];
    }

    // Normalize helper
    const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();

    const normalizedMkNames = mkNames.map((n) => ({ raw: n, norm: normalize(n) }));

    // --- 3) Count occurrences (mentions) of MK names in search titles+snippets ---
    const countsMap: Record<string, number> = {};
    for (const src of sources) {
      const text = `${src.title || ""} ${src.snippet || ""}`.toLowerCase();
      for (const mk of normalizedMkNames) {
        // simple substring match — you can enhance with better tokenization
        if (mk.norm && text.includes(mk.norm)) {
          countsMap[mk.raw] = (countsMap[mk.raw] || 0) + 1;
        }
      }
    }

    // Convert to sorted array of {name, count}
    const stats = Object.keys(countsMap)
      .map((name) => ({ name, count: countsMap[name] }))
      .sort((a, b) => b.count - a.count);

    // If stats empty, fallback: try to extract candidate names heuristically from titles (Hebrew capital letters)
    if (stats.length === 0 && sources.length > 0) {
      // Quick heuristic: split titles into words and look for repeated words across results
      const freq: Record<string, number> = {};
      for (const s of sources) {
        const words = (`${s.title || ""} ${s.snippet || ""}`)
          .replace(/[^\p{L}\s]/gu, " ")
          .split(/\s+/)
          .filter(Boolean);
        words.forEach((w) => {
          const short = w.trim();
          if (short.length > 2 && short.length < 30) {
            freq[short] = (freq[short] || 0) + 1;
          }
        });
      }
      const heuristic = Object.entries(freq)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([word, c]) => ({ name: word, count: c }));
      // add to stats if any
      if (heuristic.length > 0) {
        // only include words that appear more than once
        const filtered = heuristic.filter((h) => h.count > 1);
        if (filtered.length > 0) {
          filtered.forEach((f) => (countsMap[f.name] = f.count));
        }
      }
    }

    const finalStats = Object.keys(countsMap)
      .map((name) => ({ name, count: countsMap[name] }))
      .sort((a, b) => b.count - a.count);

    // Build a concise context for the AI
    const topStatsText =
      finalStats.length > 0
        ? finalStats
            .slice(0, 20)
            .map((s) => `- ${s.name}: הופיע/אזכר ${s.count} פעמים בתוצאות חיפוש`)
            .join("\n")
        : 'לא נמצאו אזכורים ברורים של ח"כים בתוצאות החיפוש.';

    const sourcesText =
      sources.length > 0
        ? sources.slice(0, 10).map((s, i) => `${i + 1}. ${s.title}\n${s.snippet}\n${s.link}`).join("\n\n")
        : "לא נמצאו מקורות בחיפוש.";

    const finalPrompt = `
המשתמש שואל: "${lastUserMsg}"

להלן עיבוד ראשוני של התוצאות שנמצאו בגוגל (באמצעות SerpAPI) ובהן מקורות:
${sourcesText}

נתוני אזכורים מגובשים (מניתוח כותרות ותקצירים): 
${topStatsText}

ענה על השאלה בעברית בהתבסס על המידע למעלה — תקצר, תתייחס למקורות (ציין מהם שלושה מקורות מובילים), ואם יש חוסר ודאות אמור את זה במפורש.
      `;

    // --- 4) Call OpenAI to generate the final answer ---
    const openaiKey = process.env.OPENAI_API_KEY;
    if (!openaiKey) {
      return NextResponse.json({ error: "OPENAI_API_KEY not set in environment" }, { status: 500 });
    }

    // Use the OpenAI Chat Completions API
    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${openaiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // change model as you prefer
        messages: [
          { role: "system", content: "אתה עוזר AI דובר עברית שמסכם תוצאות חיפוש ומספק תשובות מבוססות מקור." },
          { role: "user", content: finalPrompt },
        ],
        temperature: 0.2,
        max_tokens: 800,
      }),
    });

    if (!openaiRes.ok) {
      const txt = await openaiRes.text();
      console.error("OpenAI error:", txt);
      return NextResponse.json({ error: "OpenAI error", details: txt }, { status: 500 });
    }
    const openaiJson = await openaiRes.json();
    const answer = openaiJson.choices?.[0]?.message?.content || "אין תשובה מהמנוע.";

    // Return JSON with answer, sources and stats (for frontend graph)
    return NextResponse.json({
      answer,
      sources,
      stats: finalStats,
    });
  } catch (error: any) {
    console.error("knesset-chat route error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}
