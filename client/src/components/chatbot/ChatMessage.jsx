import React from "react";

// Turns "**bold**" segments into <strong>, leaves the rest as plain text
function renderInline(text, keyPrefix) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return (
        <strong key={`${keyPrefix}-${i}`} className="chat-emphasis">
          {part.slice(2, -2)}
        </strong>
      );
    }
    return <React.Fragment key={`${keyPrefix}-${i}`}>{part}</React.Fragment>;
  });
}

// Groups raw message text into paragraph and bullet-list blocks
function parseContent(content) {
  const lines = content
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean);
  const blocks = [];
  let currentList = null;

  lines.forEach((line) => {
    const isBullet = /^[-*]\s+/.test(line);

    if (isBullet) {
      const text = line.replace(/^[-*]\s+/, "");
      if (!currentList) {
        currentList = { type: "list", items: [] };
        blocks.push(currentList);
      }
      currentList.items.push(text);
    } else {
      currentList = null;
      blocks.push({ type: "paragraph", text: line });
    }
  });

  return blocks;
}

export default function ChatMessage({ message }) {
  const isUser = message.role === "user";
  const blocks = parseContent(message.content || "");

  return (
    <div className={`chat-message-bubble ${isUser ? "user" : "assistant"}`}>
      {blocks.map((block, i) =>
        block.type === "list" ? (
          <ul className="chat-bullet-list" key={i}>
            {block.items.map((item, j) => (
              <li key={j}>{renderInline(item, `${i}-${j}`)}</li>
            ))}
          </ul>
        ) : (
          <p className="chat-paragraph" key={i}>
            {renderInline(block.text, `${i}`)}
          </p>
        ),
      )}
    </div>
  );
}
