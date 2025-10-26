// app/chat/page.tsx
"use client";

import { useState, useRef, useEffect } from "react";
import { Loader2Icon, Send, Upload, Search, Mic, Image as ImageIcon, Link } from "lucide-react";

type ChatMessage = {
  id: number;
  role: "user" | "assistant";
  content: string;
  sources?: { title?: string; snippet?: string; link?: string }[];
  stats?: { name: string; count: number }[];
  images?: string[];
};

export default function ChatPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [userInput, setUserInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedModel, setSelectedModel] = useState<"gpt" | "gemini">("gpt");
  const [activeTab, setActiveTab] = useState<{ [key: number]: "answer" | "politicsai" | "images" | "sources" }>({});
  const [messageIdCounter, setMessageIdCounter] = useState(0);
  const chatContainerRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // TODO: Handle file upload (e.g., convert to base64 and append to userInput)
      console.log("Uploaded files:", files);
    }
  };

  const sendMessage = async () => {
    if (!userInput.trim() || loading) return;
    const newUserMsg: ChatMessage = { 
      id: messageIdCounter, 
      role: "user", 
      content: userInput 
    };
    setMessages((prev) => [...prev, newUserMsg]);
    setUserInput("");
    setMessageIdCounter((prev) => prev + 1);
    setLoading(true);

    try {
      const res = await fetch("/api/knesset-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...messages, newUserMsg], model: selectedModel }),
      });

      if (!res.ok) {
        throw new Error("שגיאה בשרת");
      }

      const data = await res.json();
      const newAssistantMsg: ChatMessage = {
        id: messageIdCounter + 1,
        role: "assistant",
        content: data.answer || "לא התקבלה תשובה.",
        sources: data.sources || [],
        stats: data.stats || [],
        images: data.images || [],
      };
      setMessages((prev) => [...prev, newAssistantMsg]);
      setActiveTab((prev) => ({ ...prev, [newAssistantMsg.id]: "answer" }));
    } catch (error) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        { id: messageIdCounter + 1, role: "assistant", content: "שגיאה בחיבור. נסה שוב מאוחר יותר." },
      ]);
    } finally {
      setLoading(false);
      setMessageIdCounter((prev) => prev + 1);
      // Scroll to bottom
      setTimeout(() => {
        if (chatContainerRef.current) {
          chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }
      }, 100);
    }
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const getFaviconUrl = (url: string) => {
    try {
      return `https://www.google.com/s2/favicons?domain=${new URL(url).hostname}`;
    } catch {
      return "";
    }
  };

  const getChartData = (stats?: { name: string; count: number }[]) =>
    stats
      ? stats
          .filter((s) => s.count > 0 && s.name.length > 1)
          .slice(0, 12)
          .map((s) => ({ name: s.name, value: s.count }))
      : [];

  return (
    <div className="h-screen flex bg-white text-black font-sans">
      <div className="flex-1 flex flex-col">
        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-8" ref={chatContainerRef}>
          {messages.map((msg) => (
            <div key={msg.id} className="mb-8 max-w-4xl mx-auto">
              {msg.role === "user" ? (
              <div>
                <div className="text-right">
                  <div className="inline-block bg-[#b4c9d663] p-4 rounded-2xl max-w-md">
                    <p className="text-black-300">{msg.content}</p>
                  </div>
                </div>
                <div>
                <h1 className="text-[22px] text-black font-sans font-light ">{msg.content.split('\n')[0] || 'תשובה'} {/* Use first line as title */}</h1>
                </div>
              </div>
              ) : (
                <div className="text-left">
                  {/* Query Title */}                  
                  {/* Top Tabs: PoliticsAI, Images, Sources */}
                  <div className="flex mb-6 border-b">
                    <button
                      onClick={() => setActiveTab((prev) => ({ ...prev, [msg.id]: "politicsai" }))}
                      className={`flex items-center space-x-2 px-4 py-2 font-sans font-light rounded-lg rounded-b-none ${
                        activeTab[msg.id] === "politicsai" ? "bg-[#b4c9d663] text-black" : "bg-[#b4c9d600]"
                      }`}
                    >
                      <span>PoliticsAI</span>
                    </button>
                    <button
                      onClick={() => setActiveTab((prev) => ({ ...prev, [msg.id]: "images" }))}
                      className={`flex items-center space-x-2 px-4 py-2 font-sans font-light rounded-lg rounded-b-none ${
                        activeTab[msg.id] === "images" ? "bg-[#b4c9d663] text-black" : "bg-[#b4c9d600]"
                      }`}
                    >
                      <ImageIcon className="w-4 h-4" />
                      <span>תמונות</span>
                    </button>
                    <button
                      onClick={() => setActiveTab((prev) => ({ ...prev, [msg.id]: "sources" }))}
                      className={`flex items-center space-x-2 px-4 py-2 font-sans font-light rounded-lg rounded-b-none ${
                        activeTab[msg.id] === "sources" ? "bg-[#b4c9d663] text-black" : "bg-[#b4c9d600]"
                      }`}
                    >
                      <Link className="w-4 h-4" />
                      <span>מקורות</span>
                    </button>
                  </div>

                  {/* Content based on tab */}
                  <div className="space-y-6">
                    {activeTab[msg.id] === "politicsai" && (
                      <div className="p-6 rounded-2xl">
                        <p className="text-black leading-relaxed">{msg.content.replace(/\n/g, '<br>')}</p>
                        {/* If stats/graph, add here as mini graph */}
                        {/* {getChartData(msg.stats).length > 0 && (
                          <div className="mt-4 p-4 rounded">
                            <h3 className="text-sm font-semibold mb-2">גרף אזכורים פוליטיים</h3>
                            <ul className="space-y-1">
                              {getChartData(msg.stats).slice(0, 5).map((item, idx) => (
                                <li key={idx} className="flex justify-between text-sm">
                                  <span>{item.name}</span>
                                  <span>{item.value}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        )} */}
                      </div>
                    )}

                    {activeTab[msg.id] === "images" && (
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {msg.images?.length ? (
                          msg.images.map((img, idx) => (
                            <div key={idx} className="bg-gray-800 rounded-lg overflow-hidden">
                              <img src={img} alt={`תמונה ${idx + 1}`} className="w-full h-48 object-cover" />
                            </div>
                          ))
                        ) : (
                          <p className="col-span-full text-gray-500">לא נמצאו תמונות.</p>
                        )}
                      </div>
                    )}

                    {activeTab[msg.id] === "sources" && (
                      <div className="space-y-4">
                        {msg.sources?.length ? (
                          msg.sources.slice(0, 10).map((s, idx) => (
                            <div key={idx} className="flex items-start space-x-3 bg-[#b4c9d663] p-4 rounded-xl border">
                              <img
                                src={getFaviconUrl(s.link || "")}
                                alt="Favicon"
                                className="w-8 h-8 mt-1 flex-shrink-0"
                              />
                              <div className="flex-1 min-w-0">
                                <a
                                  href={s.link}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="block text-[#0099FF] hover:text-blue-300 font-medium truncate"
                                >
                                  {s.title || "קישור"}
                                </a>
                                <p className="text-sm text-black mt-1 line-clamp-2">{s.snippet}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <p className="text-gray-500">לא נמצאו מקורות.</p>
                        )}
                      </div>
                    )}

                    {activeTab[msg.id] !== "politicsai" && activeTab[msg.id] !== "images" && activeTab[msg.id] !== "sources" && (
                      <div className="p-6 rounded-2xl">
                        <p className="text-black leading-relaxed">{msg.content.replace(/\n/g, '<br>')}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
          {loading && (
            <div className="text-center py-8">
              <Loader2Icon className="w-8 h-8 animate-spin mx-auto text-blue-500" />
              <p className="text-gray-500 mt-2">חושב...</p>
            </div>
          )}
          {messages.length === 0 && !loading && (
            <div className="text-center py-20 text-gray-500">
              <p>שאל שאלה על פוליטיקה והכנסת...</p>
            </div>
          )}
        </div>

        {/* Fixed Bottom Input */}
<div className="fixed bottom-0 left-1/2 -translate-x-1/2 bg-white border-t rounded-2xl rounded-b-none p-4 z-10 w-[50%]">
  <div className="relative flex items-center bg-[#b4c9d663] rounded-xl p-3">
    {/* Textarea */}
    <textarea
      value={userInput}
      onChange={(e) => setUserInput(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter" && !e.shiftKey) {
          e.preventDefault();
          sendMessage();
        }
      }}
      placeholder="רוצים להבין מה קורה בכנסת? מה החוק החדש? או כל דבר אחר פשוט תרשמו..."
      className="flex-1 bg-transparent text-black resize-none focus:outline-none text-base min-h-[60px]"
      rows={2}
    />

    {/* Buttons inside */}
    <div className="absolute left-3 top-3 flex items-center">
      {/* Model Select */}
{/* <select
  value={selectedModel}
  onChange={(e) => setSelectedModel(e.target.value as "gpt" | "gemini")}
  className="text-black p-1 rounded focus:outline-none appearance-none bg-black/5 rounded-l-none"
>
    <span className="ml-10">
      <option value="gpt">GPT</option>
      <option value="gemini">Gemini</option>
    </span>
</select> */}

      {/* Send */}
      <button
        onClick={sendMessage}
        disabled={loading}
        className="p-2 rounded-lg bg-black/5 text-gray-500 hover:text-blue-500 disabled:opacity-50"
      >
        <Send className="w-4 h-4" />
      </button>
    </div>
  </div>
</div>
      </div>
    </div>
  );
}