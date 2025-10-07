import React, { useState, useEffect } from "react";
import { Plus, MessageSquare, Menu } from "lucide-react";
import ChatList from "./ChatList";

const NavItem = ({
  icon,
  label,
  onClick,
  active = false,
  collapsed = false,
  isMobile = false,
}) => (
  <button
    onClick={onClick}
    className={`flex items-center w-full p-2 rounded-lg transition-colors text-left hover:bg-gray-800 ${
      active ? "bg-gray-800" : ""
    } ${collapsed && !isMobile ? "justify-center" : "gap-3"}`}
    title={collapsed && !isMobile ? label : undefined}
  >
    <span className="text-accent flex-shrink-0">{icon}</span>
    {(!collapsed || isMobile) && (
      <span className="text-sm text-text truncate">{label}</span>
    )}
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 640;
      setIsMobile(mobile);

      // Auto-collapse on tablet, expand on desktop
      if (window.innerWidth >= 640 && window.innerWidth < 768) {
        setCollapsed(true);
      } else if (window.innerWidth >= 768) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || null);
        }
      } catch (err) {
        // User not authenticated - ignore error
      }
    };
    loadUser();
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleNewChat = () => {
    if (typeof onNewChat === "function") onNewChat(null);
    try {
      window.dispatchEvent(new CustomEvent("chat:selected", { detail: null }));
    } catch (e) {
      // Event dispatch failed - ignore
    }
  };

  const userName = currentUser?.userName || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`flex flex-col h-screen transition-all duration-200 z-10 border-r border-gray-800 ${
        isMobile
          ? "bg-[#181818] w-56"
          : `bg-surface ${collapsed ? "w-12 sm:w-14" : "w-56 sm:w-64"}`
      }`}
    >
      {/* Header with toggle button */}
      <div className="p-2 flex justify-start border-b border-gray-800">
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-gray-800 transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} className="text-accent" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <NavItem
            icon={<Plus size={18} />}
            label="New Chat"
            onClick={handleNewChat}
            collapsed={collapsed}
            isMobile={isMobile}
          />

          <NavItem
            icon={<MessageSquare size={18} />}
            label="Chats"
            onClick={() => setOpenChatList((prev) => !prev)}
            active={openChatList}
            collapsed={collapsed}
            isMobile={isMobile}
          />

          {openChatList && (!collapsed || isMobile) && (
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

      {/* User profile */}
      <div className="p-2 border-t border-gray-800">
        <button
          className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-gray-800 transition-colors ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {userInitial}
          </div>
          {(!collapsed || isMobile) && (
            <div className="text-left min-w-0">
              <div className="text-sm text-text truncate">{userName}</div>
              <div className="text-xs text-muted">Free</div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
