import React, { useState } from "react";
import ChatWindow from "./ChatWindow";
import ChatInput from "./ChatInput";

export default function Chatbot({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: "assistant",
      content: "Hello! Welcome to Rooted. How can I assist you today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendMessage = async (text) => {
    if (!text.trim()) return;
    const userMessage = { role: "user", content: text };
    const updatedMessages = [...messages, userMessage];

    setMessages(updatedMessages);
    setIsLoading(true);

    try {
      const response = await fetch("https://rooteddeployment.onrender.com/api/chatbot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      if (!response.ok) throw new Error("Network response failure.");
      const data = await response.json();
      setMessages([...updatedMessages, data.message]);
    } catch (err) {
      console.error("Chat error:", err);
      setMessages([
        ...updatedMessages,
        {
          role: "assistant",
          content: "Sorry, I am having trouble connecting to the server.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="chatbot-main-container">
      <div className="chatbot-header-bar">
        <span>Rooted Assistant</span>
        <div className="chatbot-header-actions">
          <button
            className="chatbot-clear-btn"
            onClick={() =>
              setMessages([
                {
                  role: "assistant",
                  content: "Hello! History cleared. How can I help you fresh today?",
                },
              ])
            }
          >
            Clear Chat
          </button>
          {onClose && (
            <button className="chatbot-close-btn" onClick={onClose} aria-label="Close chat">
              ✕
            </button>
          )}
        </div>
      </div>
      <ChatWindow messages={messages} isLoading={isLoading} />
      <ChatInput onSend={handleSendMessage} disabled={isLoading} />
    </div>
  );
}
