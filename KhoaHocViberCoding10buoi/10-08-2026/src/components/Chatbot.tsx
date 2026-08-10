"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function Chatbot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "bot"; text: string }[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const toggleChat = () => setIsOpen(!isOpen);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setMessages((prev) => [...prev, { role: "user", text: userMessage }]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: userMessage }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessages((prev) => [...prev, { role: "bot", text: data.reply }]);
      } else {
        setMessages((prev) => [...prev, { role: "bot", text: `Error: ${data.error}` }]);
      }
    } catch (err) {
      setMessages((prev) => [...prev, { role: "bot", text: "Something went wrong." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: "fixed", bottom: "20px", right: "20px", zIndex: 9999 }}>
      {isOpen ? (
        <div
          style={{
            width: "400px",
            height: "500px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}
        >
          <div style={{ backgroundColor: "#0070f3", color: "white", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "16px" }}>Gemini Assistant</h3>
            <button onClick={toggleChat} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "16px" }}>X</button>
          </div>
          
          <div style={{ flex: 1, padding: "10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "10px" }}>
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  alignSelf: msg.role === "user" ? "flex-end" : "flex-start",
                  backgroundColor: msg.role === "user" ? "#0070f3" : "#f1f1f1",
                  color: msg.role === "user" ? "white" : "black",
                  padding: "8px 12px",
                  borderRadius: "10px",
                  maxWidth: "85%",
                  wordWrap: "break-word"
                }}
              >
                {msg.role === "bot" ? (
                  <div style={{ fontSize: "14px", lineHeight: "1.5" }}>
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text
                )}
              </div>
            ))}
            {isLoading && <div style={{ alignSelf: "flex-start", color: "gray", fontSize: "12px" }}>Gemini is typing...</div>}
          </div>

          <div style={{ padding: "10px", borderTop: "1px solid #eee", display: "flex", gap: "5px" }}>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me anything..."
              style={{ flex: 1, padding: "8px", borderRadius: "5px", border: "1px solid #ccc", color: "black" }}
            />
            <button
              onClick={sendMessage}
              disabled={isLoading}
              style={{ padding: "8px 12px", backgroundColor: "#0070f3", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
            >
              Send
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={toggleChat}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#0070f3",
            color: "white",
            border: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          💬
        </button>
      )}
    </div>
  );
}
