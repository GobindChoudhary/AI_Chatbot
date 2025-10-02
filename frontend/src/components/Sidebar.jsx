import React, { useState, useEffect } from "react";
import { Plus, MessageSquare, Menu } from "lucide-react";
import ChatList from "./ChatList";

const NavItem = ({
  icon,
  label,
  onClick,
  active = false,
  collapsed = false,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-2 rounded-lg transition-colors text-left hover:bg-gray-800 ${
      active ? "bg-gray-800" : ""
    } ${collapsed ? "justify-center" : "gap-3"}`}
    title={collapsed ? label : undefined}
  >
    <span className="text-accent flex-shrink-0">{icon}</span>
    {!collapsed && <span className="text-sm text-text truncate">{label}</span>}
  </button>
);

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
  onNewChat = null,
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [openChatList, setOpenChatList] = useState(true);
  const [collapsed, setCollapsed] = useState(false);

  // Auto-collapse on mobile screens
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCollapsed(true);
      } else if (window.innerWidth >= 768) {
        setCollapsed(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    // load current user (cookie-based auth)
    const load = async () => {
      try {
        const res = await fetch(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) return; // not authenticated or error
        const data = await res.json();
        setCurrentUser(data.user || null);
      } catch (err) {
        // ignore - sidebar will show fallback
      }
    };
    load();
  }, []);

  return (
    <aside
      className={`bg-surface flex flex-col h-screen transition-all duration-200 z-10 border-r border-gray-800 ${
        collapsed ? "w-12 sm:w-14" : "w-56 sm:w-64"
      }`}
    >
      <div className="p-2 flex justify-start border-b border-gray-800">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-accent" />
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <NavItem
            icon={<Plus size={18} />}
            label="New Chat"
            onClick={() => {
              // Clear active chat to start a new conversation
              if (typeof onNewChat === "function") onNewChat(null);
              try {
                window.dispatchEvent(
                  new CustomEvent("chat:selected", { detail: null })
                );
              } catch (e) {}
            }}
            collapsed={collapsed}
          />

          <NavItem
            icon={<MessageSquare size={18} />}
            label="Chats"
            onClick={() => setOpenChatList((s) => !s)}
            active={openChatList}
            collapsed={collapsed}
          />

          {openChatList && !collapsed && (
            <div className="mt-2 space-y-1">
              <ChatList
                compact={true}
                onSelect={(chat) => {
                  if (typeof onNewChat === "function") onNewChat(chat);
                }}
              />
            </div>
          )}
        </div>
      </nav>

      <div className="p-2 border-t border-gray-800">
        <button
          className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {currentUser && currentUser.userName
              ? currentUser.userName.charAt(0).toUpperCase()
              : "G"}
          </div>
          {!collapsed && (
            <div className="text-left min-w-0">
              <div className="text-sm text-text truncate">
                {currentUser && currentUser.userName
                  ? currentUser.userName
                  : "Guest"}
              </div>
              <div className="text-xs text-muted">Free</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
