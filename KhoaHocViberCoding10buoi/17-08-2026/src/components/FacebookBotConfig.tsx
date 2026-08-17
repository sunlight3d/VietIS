"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";

const MODELS = [
  "gemini-3.5-flash",
  "glm-5.2:cloud",
  "qwen3.5:397b-cloud",
  "nomic-embed-text:latest",
  "llama3.1:8b",
  "gpt-oss:120b-cloud",
  "deepseek-v4-pro:cloud",
  "kimi-k2.7-code:cloud",
  "minimax-m2.5:cloud"
];

export default function FacebookBotConfig() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"settings" | "logs">("settings");

  const [selectedModel, setSelectedModel] = useState(MODELS[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");

  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Do not show on auth pages
  if (pathname === "/login" || pathname === "/register") {
    return null;
  }

  const toggleConfig = () => {
    setIsOpen(!isOpen);
    if (!isOpen) {
      fetchSettings();
    }
  };

  const fetchSettings = async () => {
    try {
      const res = await fetch("/api/fb-settings");
      if (res.ok) {
        const data = await res.json();
        setSelectedModel(data.selectedModel || MODELS[0]);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchLogs = async () => {
    setIsLoadingLogs(true);
    try {
      const res = await fetch("/api/fb-logs");
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    setSaveStatus("Đang lưu...");
    try {
      const res = await fetch("/api/fb-settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ selectedModel })
      });
      if (res.ok) {
        setSaveStatus("Lưu thành công!");
        setTimeout(() => setSaveStatus(""), 3000);
      } else {
        setSaveStatus("Lỗi khi lưu.");
      }
    } catch (e) {
      setSaveStatus("Lỗi kết nối.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (isOpen && activeTab === "logs") {
      fetchLogs();
    }
  }, [isOpen, activeTab]);

  return (
    <div style={{ position: "fixed", bottom: "90px", right: "20px", zIndex: 9999 }}>
      {isOpen ? (
        <div
          style={{
            width: "400px",
            height: "550px",
            backgroundColor: "#fff",
            border: "1px solid #ccc",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
            overflow: "hidden"
          }}
        >
          <div style={{ backgroundColor: "#1877F2", color: "white", padding: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h3 style={{ margin: 0, fontSize: "16px", fontWeight: "bold" }}>Facebook Bot Config</h3>
            <button onClick={toggleConfig} style={{ background: "transparent", border: "none", color: "white", cursor: "pointer", fontSize: "16px", fontWeight: "bold" }}>X</button>
          </div>

          <div style={{ display: "flex", borderBottom: "1px solid #eee", backgroundColor: "#f9f9f9" }}>
            <button 
              onClick={() => setActiveTab("settings")}
              style={{ flex: 1, padding: "10px", border: "none", background: activeTab === "settings" ? "#eef5ff" : "transparent", color: activeTab === "settings" ? "#1877F2" : "#555", fontWeight: activeTab === "settings" ? "bold" : "normal", cursor: "pointer", borderBottom: activeTab === "settings" ? "2px solid #1877F2" : "none" }}
            >
              Cài Đặt
            </button>
            <button 
              onClick={() => setActiveTab("logs")}
              style={{ flex: 1, padding: "10px", border: "none", background: activeTab === "logs" ? "#eef5ff" : "transparent", color: activeTab === "logs" ? "#1877F2" : "#555", fontWeight: activeTab === "logs" ? "bold" : "normal", cursor: "pointer", borderBottom: activeTab === "logs" ? "2px solid #1877F2" : "none" }}
            >
              Lịch Sử Tin Nhắn
            </button>
          </div>
          
          <div style={{ flex: 1, padding: "15px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "15px" }}>
            {activeTab === "settings" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
                <div style={{ fontSize: "12px", color: "#555", backgroundColor: "#fff3cd", padding: "10px", borderRadius: "5px", border: "1px solid #ffeeba" }}>
                  <strong>Lưu ý:</strong> Cấu hình Facebook Webhook và Access Token hiện đã được lưu trữ bảo mật trong file <code>.env</code>. Vui lòng mở file <code>.env</code> để cấu hình các giá trị sau:
                  <ul style={{ margin: "5px 0 0 20px", padding: 0 }}>
                    <li><code>FB_PAGE_ACCESS_TOKEN</code></li>
                    <li><code>FB_VERIFY_TOKEN</code></li>
                  </ul>
                </div>
                
                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "5px", fontWeight: "bold" }}>Webhook URL (Dùng cho Meta App):</label>
                  <input 
                    type="text" 
                    readOnly 
                    value={typeof window !== "undefined" ? `${window.location.origin}/api/fb-webhook` : ""} 
                    style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", backgroundColor: "#f1f1f1", color: "#555", fontSize: "12px", outline: "none" }}
                  />
                </div>

                <div>
                  <label style={{ display: "block", fontSize: "12px", color: "#555", marginBottom: "5px", fontWeight: "bold" }}>Model AI Sử Dụng:</label>
                  <select 
                    value={selectedModel} 
                    onChange={(e) => setSelectedModel(e.target.value)}
                    style={{ width: "100%", padding: "8px", borderRadius: "5px", border: "1px solid #ccc", color: "black", outline: "none" }}
                  >
                    {MODELS.map(m => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>
                </div>

                <div style={{ marginTop: "10px" }}>
                  <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    style={{ width: "100%", padding: "10px", backgroundColor: "#1877F2", color: "white", border: "none", borderRadius: "5px", cursor: "pointer", fontWeight: "bold", opacity: isSaving ? 0.7 : 1 }}
                  >
                    {isSaving ? "Đang lưu..." : "Lưu Cài Đặt"}
                  </button>
                  {saveStatus && <p style={{ fontSize: "12px", color: saveStatus.includes("thành công") ? "green" : "red", marginTop: "10px", textAlign: "center" }}>{saveStatus}</p>}
                </div>
              </div>
            )}

            {activeTab === "logs" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#555" }}>Log tự động phản hồi</span>
                  <button onClick={fetchLogs} style={{ padding: "4px 8px", fontSize: "12px", cursor: "pointer", border: "1px solid #ccc", borderRadius: "4px", background: "white" }}>Làm mới</button>
                </div>
                {isLoadingLogs ? (
                  <div style={{ fontSize: "12px", color: "#777", textAlign: "center", marginTop: "20px" }}>Đang tải log...</div>
                ) : logs.length === 0 ? (
                  <div style={{ fontSize: "12px", color: "#777", textAlign: "center", marginTop: "20px" }}>Chưa có tin nhắn nào.</div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} style={{ border: "1px solid #eee", padding: "10px", borderRadius: "8px", fontSize: "12px", display: "flex", flexDirection: "column", gap: "5px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: "#888", fontSize: "10px" }}>
                        <span>Khách: {log.senderId}</span>
                        <span>{new Date(log.createdAt).toLocaleString()}</span>
                      </div>
                      <div style={{ color: "#333", backgroundColor: "#f1f1f1", padding: "6px", borderRadius: "4px" }}>
                        <strong>Hỏi:</strong> {log.message}
                      </div>
                      <div style={{ color: "#fff", backgroundColor: "#1877F2", padding: "6px", borderRadius: "4px" }}>
                        <strong>Bot:</strong> {log.reply}
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      ) : (
        <button
          onClick={toggleConfig}
          style={{
            width: "60px",
            height: "60px",
            borderRadius: "50%",
            backgroundColor: "#1877F2",
            color: "white",
            border: "none",
            boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
            cursor: "pointer",
            fontSize: "24px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
          title="Facebook Bot Settings"
        >
          FB
        </button>
      )}
    </div>
  );
}
