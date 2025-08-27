import React from "react";

export default function ChatInput({ input, setInput, onSend, placeholder }) {
  return (
    <footer className="px-4 py-4 border-t border-[var(--border)] bg-transparent">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-1 bg-[#0b0b0d]/90 border border-[var(--border)] rounded-full px-3 py-2 flex items-center gap-3">
          {/* Left badge */}
          <div className="flex items-center gap-2 bg-[#0f1724] px-3 py-1 rounded-full border border-zinc-800">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              className="text-green-400"
            >
              <circle
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="0"
                fill="#10b981"
              />
            </svg>
            <span className="text-xs text-[var(--muted)] hidden sm:inline">
              Open AI
            </span>
          </div>

          {/* Input */}
          <textarea
            rows={1}
            className="flex-1 resize-none bg-transparent text-[var(--text)] placeholder:text-[var(--muted)] outline-none px-2 py-1"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />

          {/* Shortcut / tool icon (optional) */}
          <div className="hidden sm:flex items-center text-xs text-[var(--muted)] px-2">
            ⌘K
          </div>
        </div>

        {/* Send button - yellow circular */}
        <button
          onClick={onSend}
          disabled={input.trim() === ""}
          aria-label="Send"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-amber-400 hover:bg-amber-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="currentColor"
            className="w-5 h-5 text-white rotate-0"
          >
            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
          </svg>
        </button>
      </div>
    </footer>
  );
}
