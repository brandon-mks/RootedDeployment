import React, { useState } from "react";
import Chatbot from "./Chatbot";

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="chat-widget-root">
      {isOpen && (
        <div className="chat-widget-panel">
          <Chatbot onClose={() => setIsOpen(false)} />
        </div>
      )}

      <button
        type="button"
        className="chat-widget-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-expanded={isOpen}
        aria-label={isOpen ? "Close chat" : "Ask Rooted"}
      >
        {isOpen ? "✕" : "Ask Rooted"}
      </button>
    </div>
  );
}
