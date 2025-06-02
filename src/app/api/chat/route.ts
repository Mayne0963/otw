import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

interface ChatMessage {
  role: string;
  text: string;
}

interface ChatRequest {
  messages: ChatMessage[];
  userId?: string;
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// System prompt for the OTW assistant
const SYSTEM_PROMPT = `You are an AI assistant for OTW (On The Way), a comprehensive delivery and service platform. You help customers with:

1. Food delivery from Broski's Kitchen (luxury street gourmet cuisine)
2. OTW Services (rides, package delivery, grocery shopping)
3. Order tracking and support
4. Account and membership questions
5. General platform navigation

Key information about OTW:
- Broski's Kitchen specializes in luxury street food with items like gourmet burgers, truffle fries, and street tacos
- OTW Services offers rides, package delivery, and grocery shopping
- Users can track orders, manage profiles, and earn loyalty points
- The platform serves the Fort Wayne, Indiana area
- We have a membership program with bronze, silver, and gold tiers

Be helpful, friendly, and provide accurate information about our services. If you don't know something specific, direct users to contact support.`;

export async function POST(request: Request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Chat service is not configured. Please contact support." },
        { status: 503 }
      );
    }

    const data = await request.json();
    const { messages } = data as ChatRequest;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid request format" },
        { status: 400 },
      );
    }

    // Validate message format
    for (const message of messages) {
      if (
        typeof message !== "object" ||
        !message.role ||
        typeof message.text !== "string"
      ) {
        return NextResponse.json(
          { error: "Invalid message format" },
          { status: 400 },
        );
      }
    }

    // Convert messages to OpenAI format
    const openaiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map(msg => ({
        role: msg.role === "user" ? "user" : "assistant",
        content: msg.text
      }))
    ];

    // Generate response using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: openaiMessages,
      max_tokens: 500,
      temperature: 0.7,
    });

    const responseText = completion.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response. Please try again.";

    return NextResponse.json({
      message: {
        role: "assistant",
        text: responseText,
      },
    });
  } catch (error) {
    console.error("Chat API error:", error);
    
    // Handle specific OpenAI errors
    if (error instanceof Error && error.message.includes('API key')) {
      return NextResponse.json(
        { error: "Chat service configuration error. Please contact support." },
        { status: 503 }
      );
    }
    
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
