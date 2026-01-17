import { useEffect, useState } from "react";
import { Trash2, MessageSquare } from "lucide-react";

const ChatItem = ({
  title,
  last,
  chatId,
  compact = false,
  onClick = () => {},
  onDelete = () => {},
}) => {
  const handleDelete = (e) => {
    e.stopPropagation();
    if (confirm(`Are you sure you want to delete "${title}"?`)) {
      onDelete(chatId);
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 rounded-lg hover:bg-[var(--hover)] transition-colors cursor-pointer ${
        compact ? "px-2 py-1.5" : "px-3 py-2"
      }`}
      onClick={onClick}
    >
      <div className="flex-shrink-0">
        <MessageSquare size={16} className="text-[var(--muted)]" />
      </div>

      <div className={`flex-1 min-w-0 ${compact ? "overflow-hidden" : ""}`}>
        <div className="flex justify-between items-center">
          <h4 className="truncate text-sm font-medium text-[var(--text)] capitalize">
            {title}
          </h4>
          {!compact && <span className="text-xs text-[var(--muted)]">2h</span>}
        </div>
        {!compact && (
          <p className="text-xs text-[var(--muted)] truncate">{last}</p>
        )}
      </div>

      <button
        onClick={handleDelete}
        className="flex-shrink-0 opacity-0 cursor-pointer group-hover:opacity-100 p-1 rounded-md hover:bg-[var(--danger-bg)] text-[var(--muted)] hover:text-[var(--danger)] transition-all"
        aria-label="Delete chat"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};

export default function ChatList({ compact = false, onSelect = () => {} }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    const loadChats = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat`,
          {
            credentials: "include",
          },
        );
        if (res.ok) {
          const data = await res.json();
          setItems(data.chats || []);
        }
      } catch (err) {
        console.error("Error loading chats:", err);
      }
    };

    loadChats();

    // Listen for chat creation events
    const handleChatCreated = (e) => {
      setItems((prev) => [e.detail, ...prev]);
    };

    window.addEventListener("chat:created", handleChatCreated);
    return () => window.removeEventListener("chat:created", handleChatCreated);
  }, []);

  const handleDeleteChat = async (chatId) => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat/${chatId}`,
        {
          method: "DELETE",
          credentials: "include",
        },
      );

      if (res.ok) {
        setItems((prev) => prev.filter((chat) => chat._id !== chatId));
        window.dispatchEvent(
          new CustomEvent("chat:deleted", { detail: { chatId } }),
        );
      } else {
        alert("Failed to delete chat. Please try again.");
      }
    } catch (err) {
      console.error("Error deleting chat:", err);
      alert("Error deleting chat. Please try again.");
    }
  };

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
        {items.map((item) => (
          <ChatItem
            key={item._id || item.title}
            compact={compact}
            title={item.title}
            last={item.last}
            chatId={item._id}
            onClick={() => onSelect(item)}
            onDelete={handleDeleteChat}
          />
        ))}
      </div>

      {!compact && (
        <div className="pt-2 text-xs text-[var(--muted)]">
          Examples • Tips • Shortcuts
        </div>
      )}
    </div>
  );
}
