import { useState, useEffect } from "react";
import { FilePenLine, MessageSquareText, Menu, X } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import ChatList from "./ChatList";
import NavItem from "./NavItem";

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
  onNewChat = null,
}) {
  const { user } = useAuth();
  const [openChatList, setOpenChatList] = useState(true);
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);

      // Auto-collapse on smaller desktop, expand on larger desktop
      if (window.innerWidth >= 768 && window.innerWidth < 1024) {
        setCollapsed(true);
      } else if (window.innerWidth >= 1024) {
        setCollapsed(false);
      }
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleToggle = () => {
    if (isMobile) {
      setMobileOpen(!mobileOpen);
    } else {
      setCollapsed(!collapsed);
    }
  };

  const handleNewChat = () => {
    onNewChat?.(null);
    window.dispatchEvent(new CustomEvent("chat:selected", { detail: null }));
  };

  const userName = user?.userName || "Guest";
  const userInitial = userName.charAt(0).toUpperCase();

  return (
    <aside
      className={`flex flex-col h-screen transition-all duration-200 z-10 ${
        isMobile
          ? "bg-[var(--sidebar)] w-56"
          : `bg-[var(--sidebar)] ${
              collapsed
                ? "w-12 sm:w-14 bg-[var(--surface)] border-r border-[var(--border)]"
                : "w-56 sm:w-64"
            }`
      }`}
    >
      <div className="p-2 flex justify-between">
        <button
          onClick={handleToggle}
          className="p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={20} />
        </button>
        {(isMobile || !collapsed) && (
          <button
            onClick={handleToggle}
            className="p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-1">
          <NavItem
            icon={<FilePenLine size={18} />}
            label="New Chat"
            onClick={handleNewChat}
            collapsed={collapsed}
            isMobile={isMobile}
          />

          <NavItem
            icon={<MessageSquareText size={18} />}
            label="Chats"
            onClick={() => setOpenChatList((prev) => !prev)}
            active={openChatList}
            collapsed={collapsed}
            isMobile={isMobile}
          />

          {openChatList && (!collapsed || isMobile) && (
            <div className="mt-2 space-y-1">
              <ChatList compact onSelect={onNewChat} />
            </div>
          )}
        </div>
      </nav>

      <div className="p-2">
        <button
          className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-[var(--hover)] transition-colors ${
            collapsed && !isMobile ? "justify-center" : ""
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {userInitial}
          </div>
          {(!collapsed || isMobile) && (
            <div className="text-left  min-w-0">
              <div className="text-sm text-[var(--text)]  truncate capitalize">
                {userName}
              </div>
            </div>
          )}
        </button>
      </div>
    </aside>
  );
}
