// app/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import { Loader2Icon, Send, Lightbulb } from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import Sidebar from "@/components/Layout/sidebar";
import Header from "@/components/Layout/Header/Header_";

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
  const [showThink, setShowThink] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Stream handling state
  const [streamingMessage, setStreamingMessage] = useState<string>("");

  // Function to handle streaming response
  const streamMessage = async (newUserMsg: ChatMessage) => {
    setLoading(true);
    setShowThink(false);
    setStreamingMessage("");

    try {
      const res = await fetch("/api/knesset-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newUserMsg] }),
      });

      if (!res.ok || !res.body) {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "שגיאה בשרת בעת חיפוש. נסה שוב." },
        ]);
        setLoading(false);
        return;
      }

      // Create a temporary message for streaming
      const tempMessage: ChatMessage = {
        role: "assistant",
        content: "",
        sources: [],
        stats: [],
      };
      setMessages((prev) => [...prev, tempMessage]);

      // Stream the response
      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let finalData: { answer?: string; sources?: any[]; stats?: any[] } = {};

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        try {
          // Assuming the backend sends JSON chunks (modify based on your backend)
          const parsedChunk = JSON.parse(chunk);
          finalData = { ...finalData, ...parsedChunk };

          // Update streaming message content
          if (parsedChunk.answer) {
            setStreamingMessage((prev) => prev + parsedChunk.answer);
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                content: streamingMessage + parsedChunk.answer,
                sources: finalData.sources || [],
                stats: finalData.stats || [],
              };
              return updated;
            });
          }
        } catch (e) {
          // Handle non-JSON chunks or partial data
          setStreamingMessage((prev) => prev + chunk);
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              ...updated[updated.length - 1],
              content: streamingMessage + chunk,
              sources: finalData.sources || [],
              stats: finalData.stats || [],
            };
            return updated;
          });
        }
      }

      // Finalize the message with complete data
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          role: "assistant",
          content: finalData.answer || streamingMessage || "לא התקבלה תשובה.",
          sources: finalData.sources || [],
          stats: finalData.stats || [],
        };
        return updated;
      });
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "שגיאה בחיבור. נסה שוב מאוחר יותר." },
      ]);
    } finally {
      setLoading(false);
      setStreamingMessage("");
      if (chatContainerRef.current) {
        chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
      }
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim()) return;
    const newUserMsg: ChatMessage = { role: "user", content: userInput };
    setMessages((prev) => [...prev, newUserMsg]);
    setUserInput("");
    await streamMessage(newUserMsg);
  };

  // Auto-scroll when streaming
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [streamingMessage]);

  const lastAssistant = [...messages].reverse().find((m) => m.role === "assistant");
  const chartData = lastAssistant?.stats
    ? lastAssistant.stats
        .filter((s) => s.count > 0 && s.name.length > 1)
        .slice(0, 12)
        .map((s) => ({ name: s.name, value: s.count }))
    : [];

  return (
    <div className="h-screen flex flex-col md:flex-row bg-gray-100">
      {/* Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>
      <div className="w-full md:w-[20%] p-4 bg-white border-b md:border-b-0 md:border-r border-l border-gray-200 flex flex-col gap-4 max-h-[45vh] md:max-h-none">
        <h2 className="text-lg font-semibold mb-2 text-gray-800">
          שיחה עם חברי הכנסת
        </h2>
        {messages.length === 0 && (
          <p className="text-gray-500 text-center">
            התחל לשאול על הכנסת...
          </p>
        )}
        <div className="flex-1 overflow-y-auto" ref={chatContainerRef}>
          {messages.map((msg, i) => (
            <div key={i} className="mb-4">
              <div
                className={`p-3 rounded-lg max-w-[85%] text-[14px] ${
                  msg.role === "user"
                    ? "bg-gray-300 text-black ml-auto"
                    : "bg--none text-gray-900"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
        </div>

        {/* Input */}
<div className="relative flex items-center">
  {/* Play sound button on the left */}
  <textarea
    value={userInput}
    onChange={(e) => setUserInput(e.target.value)}
    onKeyDown={(e) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    }}
    placeholder="כתוב שאלה על הכנסת..."
    className="w-full h-24 p-3 pl-12  border border-gray-300 rounded-lg resize-none focus:outline-none bg-white"
  />

  {/* Send button on the right */}
  <button
    onClick={sendMessage}
    disabled={loading}
    className="absolute left-2 top-6 -translate-y-1/2 bg-gray-300 p-2 rounded-lg ml-[2px] text-gray-600 hover:text-[#0099FF]"
  >
    {loading ? <Loader2Icon className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
  </button>
</div>

      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex flex-col md:flex-row h-full p-10 ">
          {/* Sources */}
          <div className="w-full md:w-1/2 bg-white border border-l-0 p-4 overflow-y-auto rounded-r-2xl">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">מקורות מידע</h2>
            {lastAssistant?.sources?.length ? (
              <ul className="space-y-4">
                {lastAssistant.sources.slice(0, 10).map((s, idx) => (
                  <li key={idx} className="border-b pb-2">
                    <a
                      className="text-[#0099FF] hover:underline font-medium"
                      href={s.link || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {s.title || s.link || "קישור"}
                    </a>
                    {s.snippet && (
                      <p className="text-sm text-gray-500 mt-1">{s.snippet}</p>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">לא נמצאו מקורות.</p>
            )}
          </div>

          {/* Chart */}
          <div className="w-full md:w-1/2 bg-white p-4 overflow-y-auto border">
            <h2 className="text-lg font-semibold mb-2 text-gray-800">
              גרף אזכורים (מהתוצאה האחרונה)
            </h2>
            {chartData.length === 0 ? (
              <p className="text-gray-500">לא נמצאו נתונים להצגה.</p>
            ) : (
              <div style={{ width: "100%", height: 320 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={chartData}
                    margin={{ top: 10, right: 10, left: 0, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" interval={0} height={60} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#0099FF" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}