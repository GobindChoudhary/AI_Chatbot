import React, { useEffect, useState } from "react";

const ChatItem = ({ title, last, compact = false, onClick = () => {} }) => {
  return (
    <div
      className={`flex items-center gap-3 rounded-lg hover:bg-glass transition-colors cursor-pointer ${
        compact ? "px-2 py-1" : "px-3 py-2"
      }`}
      onClick={onClick}
    >
      <div className={`flex-1 min-w-0 ${compact ? "overflow-hidden" : ""}`}>
        <div className="flex justify-between items-center">
          <h4 className="truncate text-sm font-medium text-text capitalize">
            {title}
          </h4>
          {!compact && <span className="text-xs text-muted">2h</span>}
        </div>

        {!compact && <p className="text-xs text-muted truncate">{last}</p>}
      </div>
    </div>
  );
};

export default function ChatList({ compact = false, onSelect = () => {} }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/chat",
          {
            credentials: "include",
          }
        );
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
              onSelect(it);
            }}
          />
        ))}
      </div>

      {!compact && (
        <div className="pt-2 text-xs text-muted">
          <div>Examples • Tips • Shortcuts</div>
        </div>
      )}
    </div>
  );
}
