import React, { useEffect, useState } from "react";

const ChatItem = ({ title, last, compact = false, onClick = () => {} }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg hover:bg-[var(--glass)] transition-colors cursor-pointer ${
        compact ? "px-2 py-1" : "px-3 py-2"
      }`}
      onClick={onClick}
    >
      <div
        className={`flex items-center justify-center text-sm text-white bg-gray-600/20 ${
          compact ? "w-8 h-8 rounded-md" : "w-10 h-10 rounded-md"
        }`}
      >
        U
      </div>

      <div className={`flex-1 min-w-0 ${compact ? "overflow-hidden" : ""}`}>
        <div className="flex justify-between items-center">
          <h4 className="truncate text-sm font-medium text-[var(--text)]">
            {title}
          </h4>
          {!compact && <span className="text-xs text-[var(--muted)]">2h</span>}
        </div>

        {!compact && (
          <p className="text-xs text-[var(--muted)] truncate">{last}</p>
        )}
      </div>
    </div>
  );
};

export default function ChatList({ compact = false, onSelect = () => {} }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/chat", {
          credentials: "include",
        });
        if (!res.ok) return;
        const data = await res.json();
        setItems(data.chats || []);
      } catch (err) {
        // ignore
      }
    };
    load();
    // listen to chat created events to refresh
    const onCreated = (e) => {
      setItems((s) => [e.detail, ...s]);
    };
    window.addEventListener("chat:created", onCreated);
    return () => window.removeEventListener("chat:created", onCreated);
  }, []);

  return (
    <div
      className={`${
        compact
          ? "w-full p-2 h-full flex flex-col gap-2"
          : "w-80 max-w-xs p-4 h-full flex flex-col gap-4"
      }`}
    >
      <div
        className={`flex-1 overflow-y-auto ${
          compact ? "space-y-1" : "space-y-2"
        }`}
      >
        {items.map((it) => (
          <ChatItem
            key={it._id || it.title}
            compact={compact}
            title={it.title}
            last={it.last}
            onClick={() => {
              // debug: log selection
              // eslint-disable-next-line no-console
              console.debug("ChatList: selected chat", it);
              onSelect(it);
            }}
          />
        ))}
      </div>

      {!compact && (
        <div className="pt-2 border-t border-[var(--border)] text-xs text-[var(--muted)]">
          <div>Examples • Tips • Shortcuts</div>
        </div>
      )}
    </div>
  );
}
