import { NextResponse } from 'next/server';
import { callGemini } from '@/lib/gemini';
import { db } from '@/config/db';
import { knessetMembersTable, mkWeeklyStatsTable } from '@/config/schema';
import { desc, sql } from 'drizzle-orm';
import fs from 'fs/promises';
import path from 'path';

// Utility function for retrying with exponential backoff
async function retryWithBackoff(fn: () => Promise<string>, maxRetries: number = 3, baseDelay: number = 1000) {
  let lastError: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error: any) {
      lastError = error;
      if (error.message.includes('503') && attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1);
        console.warn(`Attempt ${attempt} failed with 503, retrying after ${delay}ms...`);
        await new Promise((resolve) => setTimeout(resolve, delay));
        continue;
      }
      throw error;
    }
  }
  throw lastError;
}

// Helper function to fetch image from Unsplash API
async function fetchUnsplashImage(query: string): Promise<string> {
  const apiKey = process.env.UNSPLASH_API_KEY;
  if (!apiKey) {
    throw new Error('Unsplash API key is not configured');
  }

  const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape&client_id=${apiKey}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Unsplash API error: ${response.status} - ${await response.text()}`);
  }

  const data = await response.json();
  return data.results[0]?.urls?.regular || 'https://images.unsplash.com/photo-1542281286-9e0a16bb7366?ixlib=rb-4.0.3&q=80&fm=jpg&crop=entropy&cs=tinysrgb';
}

export async function GET() {
  const cacheFile = path.join(process.cwd(), 'public', 'posts_cache.json');
  const threeDaysInMs = 3 * 24 * 60 * 60 * 1000;
  let cachedData = null;

  try {
    // Try to read cached data
    try {
      const cacheContent = await fs.readFile(cacheFile, 'utf-8');
      cachedData = JSON.parse(cacheContent);
    } catch (err) {
      console.log('No cache file or invalid cache, generating new posts...');
    }

    const now = Date.now();
    const shouldRegenerate = !cachedData || !cachedData.timestamp || (now - cachedData.timestamp > threeDaysInMs);

    if (shouldRegenerate) {
      const lastWeek = new Date(now - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch Knesset context for accurate member statistics
      let knessetContext = '';
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
          .limit(20);

        if (recentStats.length > 0) {
          knessetContext = `\n\nמידע עדכני על חברי כנסת מהשבוע האחרון:\n${recentStats
            .map((mk) => `- ${mk.name} (${mk.party}): ${mk.speech_count} נאומים, ציון השפעה: ${mk.impact_score}`)
            .join('\n')}\n\nבהתבסס על מידע זה, צור את הפוסטים כמבוקש.`;
        } else {
          knessetContext = '\n\nאין נתונים זמינים על חברי כנסת מהשבוע האחרון.\n\nצור את הפוסטים כמבוקש.';
        }
      } catch (error: any) {
        console.error('Detailed Database Error:', {
          message: error.message,
          stack: error.stack,
          cause: error.cause,
        });
        knessetContext = '\n\nשגיאה בטעינת נתוני חברי כנסת.\n\nצור את הפוסטים כמבוקש.';
      }

      const prompt = `צור 5 פוסטים חדשותיים קצרים, מעניינים ומסקרנים על הדיונים המשפיעים ביותר בכנסת ישראל השבוע (מ-${lastWeek}). התמקד בדוברים מרכזיים כמו נתניהו או מנהיגי האופוזיציה. לכל פוסט כלול:
- title: כותרת קצרה וקליטה
- summary: סיכום קצר של עד 400 מילים בעברית, מעניין וקולע
- quote: ציטוט קצר ומשמעותי של דובר
- sources: מערך של 2-3 קישורים חדשותיים אמיתיים (למשל: haaretz.com, timesofisrael.com)
- imageDescription: תיאור קצר של תמונה רלוונטית (למשל: 'דיון בכנסת', 'נתניהו נואם')
- videoUrl: URL של וידאו YouTube רלוונטי (חיפוש: Israel Knesset [topic])
- category: בחר קטגוריה אחת שמתאימה: פוליטיקה, כלכלה, ביטחון, יחסי חוץ, חברה
${knessetContext}
החזר רק JSON תקין של מערך אובייקטים, ללא טקסט נוסף מחוץ ל-JSON.`;

      // Call Gemini with retry logic
      let jsonStr = await retryWithBackoff(() => callGemini(prompt));
      jsonStr = jsonStr.replace(/```json|```/g, '').trim();

      // Parse and enhance posts with Unsplash images
      try {
        const posts = JSON.parse(jsonStr);
        for (const post of posts.slice(0, 5)) {
          const imageQuery = post.imageDescription || 'Israeli Knesset discussion';
          post.imageUrl = await fetchUnsplashImage(imageQuery);
          delete post.imageDescription;
          post.id = `post-${posts.indexOf(post)}`; // Assign IDs for linking
        }
        const newCache = { posts, timestamp: now };
        await fs.writeFile(cacheFile, JSON.stringify(newCache));
        return NextResponse.json({ posts });
      } catch (parseErr: any) {
        console.error('JSON Parse Error:', {
          message: parseErr.message,
          stack: parseErr.stack,
          rawResponse: jsonStr,
        });
        return NextResponse.json(
          { error: 'Failed to parse Gemini API response', details: parseErr.message },
          { status: 500 }
        );
      }
    } else {
      return NextResponse.json({ posts: cachedData.posts });
    }
  } catch (err: any) {
    console.error('API Error:', {
      message: err.message,
      stack: err.stack,
    });
    return NextResponse.json(
      { error: 'Internal server error', details: err.message },
      { status: 500 }
    );
  }
}