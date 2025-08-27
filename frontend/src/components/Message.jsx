import React from "react";
import ReactMarkdown from "react-markdown";

export default function Message({ from, children }) {
  const bubbleClass =
    from === "me"
      ? "max-w-[70%] p-3 rounded-xl bg-[var(--accent)] text-black"
      : "max-w-[70%] p-3 rounded-xl bg-[var(--glass)] text-[var(--text)]";

  return (
    <div
      className={`w-full flex ${
        from === "me" ? "justify-end" : "justify-start"
      }`}
    >
      <div className={bubbleClass}>
        <div className="text-sm">
          {from === "me" ? (
            children
          ) : (
            <ReactMarkdown>{String(children)}</ReactMarkdown>
          )}
        </div>
      </div>
    </div>
  );
}
