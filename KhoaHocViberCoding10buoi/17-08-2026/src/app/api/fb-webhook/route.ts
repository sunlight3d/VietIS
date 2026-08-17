import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import { GoogleGenerativeAI } from "@google/generative-ai";

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const mode = searchParams.get("hub.mode");
  const token = searchParams.get("hub.verify_token");
  const challenge = searchParams.get("hub.challenge");

  if (mode === "subscribe" && token) {
    const verifyToken = process.env.FB_VERIFY_TOKEN;

    if (verifyToken && token === verifyToken) {
      console.log("WEBHOOK_VERIFIED");
      return new NextResponse(challenge, { status: 200 });
    } else {
      return new NextResponse("Forbidden", { status: 403 });
    }
  }

  return new NextResponse("Bad Request", { status: 400 });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    if (body.object === "page") {
      for (const entry of body.entry) {
        const webhook_event = entry.messaging[0];
        const sender_psid = webhook_event.sender.id;

        if (webhook_event.message && webhook_event.message.text) {
          const messageText = webhook_event.message.text;
          await handleMessage(sender_psid, messageText);
        }
      }
      return new NextResponse("EVENT_RECEIVED", { status: 200 });
    } else {
      return new NextResponse("Not Found", { status: 404 });
    }
  } catch (error) {
    console.error("FB Webhook Error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

async function handleMessage(sender_psid: string, received_message: string) {
  const pageAccessToken = process.env.FB_PAGE_ACCESS_TOKEN;

  if (!pageAccessToken) {
    console.error("Facebook settings not configured in .env");
    return;
  }

  // Get selected model from DB
  const settings = await prisma.facebookSettings.findUnique({
    where: { id: "default" }
  });
  const modelName = settings?.selectedModel || "gemini-3.5-flash";
  let botReply = "";

  try {
    // LLM Call
    if (modelName.startsWith("gemini")) {
      const apiKey = process.env.GOOGLE_API_KEY;
      if (!apiKey) throw new Error("Missing GOOGLE_API_KEY");
      
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using 1.5-flash as default gemini for compatibility
      const result = await model.generateContent(received_message);
      const response = await result.response;
      botReply = response.text();
    } else {
      // Ollama/Other endpoints
      const ollamaRes = await fetch("http://localhost:11434/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: modelName,
          messages: [{ role: "user", content: received_message }],
          stream: false
        })
      });
      if (ollamaRes.ok) {
        const data = await ollamaRes.json();
        botReply = data.message?.content || "No response";
      } else {
        throw new Error("Ollama API Error");
      }
    }
  } catch (err: any) {
    console.error("LLM Error:", err);
    botReply = "Xin lỗi, hiện tại tôi không thể kết nối tới AI.";
  }

  // Send back to Facebook
  try {
    const fbRes = await fetch(`https://graph.facebook.com/v19.0/me/messages?access_token=${pageAccessToken}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        recipient: { id: sender_psid },
        message: { text: botReply }
      })
    });

    if (!fbRes.ok) {
      const fbErr = await fbRes.json();
      console.error("Facebook API Error:", fbErr);
    } else {
      // Log successful reply
      await prisma.facebookLog.create({
        data: {
          senderId: sender_psid,
          message: received_message,
          reply: botReply
        }
      });
    }
  } catch (err) {
    console.error("Error sending message to Facebook:", err);
  }
}
