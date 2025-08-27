import React, { useState, useRef, useEffect } from "react";
import NameModal from "./NameModal";
import ChatList from "./ChatList";

const NavItem = ({ icon, label, onClick, active = false }) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-lg w-full hover:bg-[var(--glass)] transition-colors text-left ${
      active ? "bg-[var(--glass)]" : ""
    }`}
  >
    <span className="text-[var(--accent)]">{icon}</span>
    <span className="text-sm text-[var(--text)] hidden md:inline">{label}</span>
  </button>
);

export default function Sidebar({
  mobileOpen = false,
  setMobileOpen = () => {},
  onNewChat = null,
}) {
  const [currentUser, setCurrentUser] = useState(null);
  const [openChatList, setOpenChatList] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpenChatList(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    // load current user (cookie-based auth)
    const load = async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          method: "GET",
          credentials: "include",
        });
        if (!res.ok) return; // not authenticated or error
        const data = await res.json();
        setCurrentUser(data.user || null);
      } catch (err) {
        // ignore - sidebar will show fallback
      }
    };
    load();
  }, []);

  const createNewChat = async (title) => {
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ title }),
      });
      if (!res.ok) return console.error("Failed to create chat");
      const data = await res.json();
      setMobileOpen(false);
      setOpenChatList(true);
      try {
        window.dispatchEvent(
          new CustomEvent("chat:created", { detail: data.chat })
        );
      } catch (e) {}
      try {
        window.dispatchEvent(
          new CustomEvent("chat:selected", { detail: data.chat })
        );
      } catch (e) {}
      if (typeof onNewChat === "function") onNewChat(data.chat);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <aside
      className={`${
        mobileOpen
          ? "flex fixed left-0 top-0 w-64 h-screen p-3 bg-[var(--surface)] border-r border-[var(--border)] z-50 overflow-auto"
          : "hidden md:flex md:relative md:w-64 md:flex-shrink-0 md:h-screen md:p-3 md:bg-[var(--surface)] md:border-r md:border-[var(--border)]"
      } flex-col transform transition-transform duration-200`}
    >
      <div className="md:hidden mb-2 flex justify-end">
        <button
          onClick={() => setMobileOpen(false)}
          className="px-2 py-1 rounded hover:bg-[var(--glass)]"
          aria-label="Close sidebar"
        >
          ✕
        </button>
      </div>

      <div className="flex items-center gap-3 mb-4 px-1">
        <div className="w-10 h-10 rounded-md bg-[var(--accent)] flex items-center justify-center text-black font-bold">
          AI
        </div>
        <div className="hidden md:block">
          <h1 className="text-lg font-semibold text-[var(--text)]">
            LiveCohert
          </h1>
          <p className="text-xs text-[var(--muted)]">Chat center</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 mt-2">
        <div className="relative" ref={dropdownRef}>
          <NavItem
            icon="➕"
            label="New Chat"
            onClick={() => setShowNameModal(true)}
          />

          <NavItem
            icon="💬"
            label="Chats"
            onClick={() => setOpenChatList((s) => !s)}
            active={openChatList}
          />

          {openChatList && (
            <div className="absolute left-full top-0 ml-2 w-80 max-w-xs h-[80vh] z-50 rounded-lg shadow-xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden md:hidden">
              <ChatList
                onSelect={(chat) => {
                  if (typeof onNewChat === "function") onNewChat(chat);
                  setOpenChatList(false);
                  setMobileOpen(false);
                }}
              />
            </div>
          )}

          {openChatList && (
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

      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <div className="space-y-2 mb-3">
          <NavItem icon="🔎" label="Explore" />
          <NavItem icon="⚙️" label="Settings" />
        </div>

        <button className="w-full flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--glass)]">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--accent)] to-indigo-500 flex items-center justify-center text-sm font-semibold">
            {currentUser && currentUser.userName
              ? currentUser.userName.charAt(0).toUpperCase()
              : "G"}
          </div>
          <div className="hidden md:block text-left">
            <div className="text-sm text-[var(--text)]">
              {currentUser && currentUser.userName
                ? currentUser.userName
                : "Guest"}
            </div>
            <div className="text-xs text-[var(--muted)]">Free</div>
          </div>
        </button>
      </div>

      <NameModal
        open={showNameModal}
        initial=""
        onClose={() => setShowNameModal(false)}
        onSubmit={(name) => {
          setShowNameModal(false);
          if (name) createNewChat(name);
        }}
      />
    </aside>
  );
}
