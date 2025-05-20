import { NextResponse } from "next/server"
import { generateChatResponse } from "../../../lib/services/openai-chat"
import { indexAllContent } from "../../../lib/utils/contentIndexer"

interface ChatMessage {
  role: string;
  text: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
}

// Ensure content is indexed before handling requests
let isIndexed = false

export async function POST(request: Request) {
  try {
    // Index content if not already indexed
    if (!isIndexed) {
      await indexAllContent()
      isIndexed = true
    }

    const data = await request.json();
    const { messages } = data as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Invalid request format" }, { status: 400 })
    }

    // Validate message format
    for (const message of messages) {
      if (typeof message !== 'object' || !message.role || typeof message.text !== 'string') {
        return NextResponse.json({ error: "Invalid message format" }, { status: 400 })
      }
    }

    // Get the last user message
    const userMessages = messages.filter((msg) => msg.role === "user")
    const lastUserMessage = userMessages.length > 0 ? userMessages[userMessages.length - 1].text : ""

    // Generate response using OpenAI
    const responseText = await generateChatResponse(messages, lastUserMessage)

    return NextResponse.json({
      role: "assistant",
      text: responseText,
    })
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json({
      role: "assistant",
      text: "I'm having trouble processing your request. Please try again later.",
    })
  }
}
