// app/chat/page.tsx
"use client";

import { useState } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  sources?: { title?: string; snippet?: string; link?: string }[];
  stats?: { name: string; count: number }[];
};

export default function ChatPage() {
  const { user, isLoaded } = useUser();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const newUserMsg: ChatMessage = { role: "user", content: userInput };
    // append user message
    setMessages((prev) => [...prev, newUserMsg]);
    setUserInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/knesset-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newUserMsg] }),
      });

      if (!res.ok) {
        const txt = await res.text();
        console.error("Server error:", txt);
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "שגיאה בשרת בעת חיפוש. נסה שוב." },
        ]);
        setLoading(false);
        return;
      }

      const data = await res.json();

      const assistantMsg: ChatMessage = {
        role: "assistant",
        content: data.answer || "לא התקבלה תשובה.",
        sources: data.sources || [],
        stats: data.stats || [],
      };

      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      console.error("Fetch error:", e);
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "שגיאה בחיבור. נסה שוב מאוחר יותר." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // prepare chart data from last assistant message's stats (if any)
  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const chartData = lastAssistant?.stats
    ? lastAssistant.stats.slice(0, 12).map((s) => ({ name: s.name, value: s.count }))
    : [];

  return (
    <div className="h-screen flex flex-col p-4 bg-white">
      <h1 className="text-2xl font-bold mb-4">שיחה עם חברי הכנסת — תשובות בזמן אמת</h1>

      <div className="flex-1 flex flex-col gap-4 overflow-y-auto mb-4">
        <div className="flex-1 border rounded-lg p-4 bg-gray-50">
          {messages.length === 0 && <p className="text-gray-500">התחל שאלה על הכנסת...</p>}
          {messages.map((msg, i) => (
            <div key={i} className="mb-4">
              <div
                className={`p-3 rounded-lg max-w-[85%] ${
                  msg.role === "user" ? "bg-blue-600 text-white ml-auto" : "bg-gray-100 text-gray-900"
                }`}
                style={{ alignSelf: msg.role === "user" ? "flex-end" : "flex-start" }}
              >
                {msg.content}
              </div>

              {/* If assistant and has sources, show them */}
              {msg.role === "assistant" && msg.sources && msg.sources.length > 0 && (
                <div className="mt-2 ml-4 text-sm text-gray-600">
                  <div className="font-semibold mb-1">מקורות (Top results):</div>
                  <ul className="space-y-1">
                    {msg.sources.slice(0, 5).map((s, idx) => (
                      <li key={idx}>
                        <a
                          className="text-blue-600 hover:underline"
                          href={s.link || "#"}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {s.title || s.link || "קישור"}
                        </a>
                        {s.snippet ? <div className="text-xs text-gray-500">{s.snippet}</div> : null}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Chart area */}
        <div className="border rounded-lg p-4 bg-white">
          <h2 className="text-lg font-semibold mb-2">גרף אזכורים / "השפעה" (מהתוצאה האחרונה)</h2>
          {chartData.length === 0 ? (
            <p className="text-gray-500">לא נמצאו נתונים להצגה בגרף. שאל שאלה שתביא נתונים (למשל: מי השפיע השבוע?).</p>
          ) : (
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="value" name="אזכורים" fill="#2563EB" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>

      {/* Input */}
      <div className="flex gap-2">
        <input
          value={userInput}
          onChange={(e) => setUserInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="כתוב שאלה על הכנסת (למשל: מי השפיע הכי הרבה השבוע?)"
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={sendMessage}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {loading ? <Loader2Icon className="animate-spin" /> : "שלח"}
        </button>
      </div>
    </div>
  );
}
