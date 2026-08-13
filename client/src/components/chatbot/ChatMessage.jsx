import React from "react";

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";

  return (
    <div className={`chat-message-bubble ${isUser ? "user" : "assistant"}`}>
      {message.content}
    </div>
  );
}
