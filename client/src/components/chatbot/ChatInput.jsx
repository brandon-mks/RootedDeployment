import React, { useState } from "react";

export default function ChatInput({ onSend, disabled }) {
  const [text, setText] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;
    onSend(text);
    setText("");
  };

  return (
    <form onSubmit={handleSubmit} className="chat-input-form">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={
          disabled ? "Waiting for response..." : "Ask Rooted something..."
        }
        disabled={disabled}
        className="chat-input-field"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="chat-submit-btn"
      >
        Send
      </button>
    </form>
  );
}
