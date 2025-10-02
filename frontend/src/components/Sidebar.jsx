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
    className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-glass transition-colors text-left ${
      active ? "bg-glass" : ""
    }`}
  >
    <span className="text-accent">{icon}</span>
    <span
      className={`text-sm text-text ${
        collapsed ? "hidden" : "hidden md:inline"
      }`}
    >
      {label}
    </span>
  </button>
);

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
  onNewChat = null,
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [openChatList, setOpenChatList] = useState(true);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

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
      className={`bg-black/20 ${
        mobileOpen
          ? "flex fixed left-0 top-0 w-64 h-screen p-3  z-50 overflow-auto "
          : "hidden md:flex md:relative md:flex-shrink-0 md:h-screen md:p-3  md:bg-surface"
      } ${
        desktopCollapsed ? "md:w-16" : "md:w-64"
      } flex-col transform transition-all duration-200`}
    >
      <div className=" mb-2 flex justify-start">
        <button
          onClick={() => {
            // On mobile, close the sidebar
            if (window.innerWidth < 768) {
              setMobileOpen(false);
            } else {
              // On desktop, toggle collapsed state
              setDesktopCollapsed(!desktopCollapsed);
            }
          }}
          className="px-2 py-1 rounded hover:bg-glass"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-accent" />
        </button>
      </div>

      <nav className="flex-1 space-y-1 mt-2">
        <div className="relative">
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
            collapsed={desktopCollapsed}
          />

          <NavItem
            icon={<MessageSquare size={18} />}
            label="Chats"
            onClick={() => setOpenChatList((s) => !s)}
            active={openChatList}
            collapsed={desktopCollapsed}
          />

          {openChatList && !desktopCollapsed && (
            <div className="absolute left-full top-0 ml-2 w-80 max-w-xs h-[80vh] z-50 rounded-lg shadow-xl bg-surface overflow-hidden md:hidden">
              <ChatList
                onSelect={(chat) => {
                  if (typeof onNewChat === "function") onNewChat(chat);
                  setOpenChatList(false);
                  setMobileOpen(false);
                }}
              />
            </div>
          )}

          {openChatList && !desktopCollapsed && (
            <div className="hidden md:block mt-3 overflow-y-auto max-h-[60vh]">
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

      <div className="mt-4 pt-4">
        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-glass">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-indigo-500 flex items-center justify-center text-sm font-semibold">
            {currentUser && currentUser.userName
              ? currentUser.userName.charAt(0).toUpperCase()
              : "G"}
          </div>
          <div
            className={`text-left ${
              desktopCollapsed ? "hidden" : "hidden md:block"
            }`}
          >
            <div className="text-sm text-text">
              {currentUser && currentUser.userName
                ? currentUser.userName
                : "Guest"}
            </div>
            <div className="text-xs text-muted">Free</div>
          </div>
        </button>
      </div>
    </aside>
  );
}
