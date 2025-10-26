// app/api/knesset-chat/route.ts
import { NextResponse } from "next/server";

type SerpResult = {
  title?: string;
  snippet?: string;
  link?: string;
  images?: string[]; // New: for images
};

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { messages, model } = body;
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 });
    }

    const lastUserMsg = messages[messages.length - 1].content;
    if (!lastUserMsg || typeof lastUserMsg !== "string") {
      return NextResponse.json({ error: "Invalid message" }, { status: 400 });
    }

    // --- 1) Run web search with SerpAPI for main results ---
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
    const sources = organic.map((r: any) => ({
      title: r.title || r.title_no_formatting || r.serpapi_link || "אין כותרת",
      snippet: r.snippet || r.snippet_highlighted || "",
      link: r.link || r.url || r.serpapi_link || "",
      images: r.thumbnail ? [r.thumbnail] : [], // Use thumbnail if available
    }));

    // --- 2) Search for images using SerpAPI ---
    const imageUrl = `https://serpapi.com/search.json?engine=google_images&q=${encodeURIComponent(lastUserMsg + ' images')}&num=10&api_key=${serpKey}`;
    const imageResp = await fetch(imageUrl);
    let images: string[] = [];
    if (imageResp.ok) {
      const imageJson = await imageResp.json();
      images = imageJson.images_results?.map((img: any) => img.thumbnail || img.original) || [];
    }

    // --- 3) Fetch MK list from OKnesset (for politics focus) ---
    let mkNames: string[] = [];
    try {
      const okResp = await fetch("https://oknesset.org/api/v2/members/?format=json");
      if (okResp.ok) {
        const okJson = await okResp.json();
        const objects = okJson.objects || [];
        mkNames = objects
          .map((o: any) => (o.name ? o.name : o.full_name ? o.full_name : o.name_he ? o.name_he : null))
          .filter(Boolean)
          .map((n: string) => n.trim());
      }
    } catch (e) {
      console.error("OKnesset fetch error:", e);
      mkNames = [];
    }

    const normalize = (s: string) => s.replace(/\s+/g, " ").trim().toLowerCase();
    const normalizedMkNames = mkNames.map((n) => ({ raw: n, norm: normalize(n) }));

    // --- 4) Count MK mentions ---
    const countsMap: Record<string, number> = {};
    for (const src of sources) {
      const text = `${src.title || ""} ${src.snippet || ""}`.toLowerCase();
      for (const mk of normalizedMkNames) {
        if (mk.norm && text.includes(mk.norm)) {
          countsMap[mk.raw] = (countsMap[mk.raw] || 0) + 1;
        }
      }
    }

    const stats = Object.keys(countsMap)
      .map((name) => ({ name, count: countsMap[name] }))
      .sort((a, b) => b.count - a.count);

    if (stats.length === 0 && sources.length > 0) {
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
      if (heuristic.length > 0) {
        const filtered = heuristic.filter((h) => h.count > 1);
        if (filtered.length > 0) {
          filtered.forEach((f) => (countsMap[f.name] = f.count));
        }
      }
    }

    const finalStats = Object.keys(countsMap)
      .map((name) => ({ name, count: countsMap[name] }))
      .sort((a, b) => b.count - a.count);

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
אתה PoliticsAI, עוזר AI המתמחה בפוליטיקה ישראלית והכנסת. השאלה של המשתמש: "${lastUserMsg}"

להלן תוצאות חיפוש מגוגל (SerpAPI):
${sourcesText}

אזכורים של ח"כים:
${topStatsText}

ענה בעברית בצורה תמציתית, מקצועית וטבעית. התמקד בהיבטים פוליטיים אם רלוונטי. ציין 3 מקורות מובילים. אם חסר מידע, אמור זאת. התשובה צריכה להיות מלאה, ללא קטיעות.
      `;

    // --- 5) Call AI based on selected model ---
    const selectedModel = model === "gemini" ? "gemini" : "gpt";
    let apiUrl = "";
    let headers: Record<string, string> = { "Content-Type": "application/json" };
    let apiKey = "";

    if (selectedModel === "gemini") {
      apiKey = process.env.GEMINI_API_KEY || "";
      apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
    } else {
      apiKey = process.env.OPENAI_API_KEY || "";
      apiUrl = "https://api.openai.com/v1/chat/completions";
      headers["Authorization"] = `Bearer ${apiKey}`;
    }

    if (!apiKey) {
      return NextResponse.json({ error: `${selectedModel.toUpperCase()}_API_KEY not set` }, { status: 500 });
    }

    const requestBody =
      selectedModel === "gemini"
        ? {
            contents: [{ parts: [{ text: finalPrompt }] }],
            generationConfig: { temperature: 0.2, maxOutputTokens: 800 },
          }
        : {
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: "אתה PoliticsAI, עוזר AI דובר עברית שמתמחה בפוליטיקה ישראלית, מסכם תוצאות חיפוש ומספק תשובות מבוססות מקור." },
              { role: "user", content: finalPrompt },
            ],
            temperature: 0.2,
            max_tokens: 800,
            stream: false, // Non-streaming for simplicity; adjust if needed
          };

    const aiRes = await fetch(apiUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
    });

    if (!aiRes.ok) {
      const txt = await aiRes.text();
      console.error(`${selectedModel} error:`, txt);
      return NextResponse.json({ error: `${selectedModel} error`, details: txt }, { status: 500 });
    }

    let aiResponse;
    if (selectedModel === "gemini") {
      const aiJson = await aiRes.json();
      aiResponse = aiJson.candidates?.[0]?.content?.parts?.[0]?.text || "לא התקבלה תשובה.";
    } else {
      const aiJson = await aiRes.json();
      aiResponse = aiJson.choices?.[0]?.message?.content || "לא התקבלה תשובה.";
    }

    // --- 6) Return full response ---
    return NextResponse.json({
      answer: aiResponse,
      sources,
      stats: finalStats,
      images,
    });
  } catch (error: any) {
    console.error("knesset-chat route error:", error);
    return NextResponse.json({ error: error.message || "Unknown error" }, { status: 500 });
  }
}