import React from "react";

export default function ChatHeader({ title, active, openSidebar }) {
  return (
    <header className="px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          className="md:hidden px-2 py-1 rounded hover:bg-[var(--glass)]"
          onClick={() =>
            typeof openSidebar === "function" ? openSidebar() : null
          }
          aria-label="Open sidebar"
        >
          ☰
        </button>

        <div className="w-10 h-10 rounded-md bg-gradient-to-br from-[var(--accent)] to-indigo-600 flex items-center justify-center text-sm font-semibold">
          C
        </div>

        <div>
          <div className="text-sm font-semibold text-[var(--text)]">
            {title || "No chat selected"}
          </div>
          <div className="text-xs text-[var(--muted)]">
            {active ? "Active now" : "Start a new chat"}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 text-[var(--muted)]">
        <button className="px-2 py-1 rounded hover:bg-[var(--glass)]">⋯</button>
      </div>
    </header>
  );
}
