import { type NextRequest, NextResponse } from "next/server"
import axios from "axios"
import { OpenAI } from "openai"

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json()

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "No messages provided" }, { status: 400 })
    }

    const encoder = new TextEncoder()
    const imageUrls: string[] = []

    const readable = new ReadableStream({
      async start(controller) {
        try {
          // === GPT-5-CHAT HANDLER WITH STREAMING ===
          const apiKey = process.env.GPT5_API_KEY
          if (!apiKey) {
            controller.enqueue(encoder.encode(JSON.stringify({ error: "GPT-5 API key not configured" })))
            controller.close()
            return
          }

          const openai = new OpenAI({ apiKey })
          const input = messages
            .map((msg: any) => `${msg.role === "user" ? "User" : "Assistant"}: ${msg.content}`)
            .join("\n")

          const stream = await openai.chat.completions.create({
            model: "gpt-5-nano",
            messages: messages.map((msg: any) => ({
              role: msg.role,
              content: msg.content,
            })),
            stream: true,
          })

          for await (const chunk of stream) {
            const content = chunk.choices[0]?.delta?.content
            if (content) {
              controller.enqueue(encoder.encode(content))
            }
          }

          if (imageUrls.length > 0) {
            controller.enqueue(encoder.encode(`\n__IMAGE_URLS__:${JSON.stringify(imageUrls)}`))
          }

          controller.close()
        } catch (error: any) {
          console.error("Streaming error:", error.message)
          controller.enqueue(
            encoder.encode(JSON.stringify({ error: "Failed to process request: " + error.message }))
          )
          controller.close()
        }
      },
    })

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    })
  } catch (error: any) {
    console.error("API error:", error)
    if (error.response) {
      console.error("OpenRouter response error:", error.response.data)
    }
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
  }
}