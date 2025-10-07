import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Check authentication on component mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          setCheckingAuth(false);
        } else {
          window.location.href = "/login";
        }
      } catch (err) {
        window.location.href = "/login";
      }
    };
    checkAuth();
  }, []);

  // Listen for chat events
  useEffect(() => {
    const handleChatSelected = (e) => {
      if (e?.detail) setActiveChat(e.detail);
    };

    const handleChatDeleted = (e) => {
      if (e?.detail?.chatId && activeChat?._id === e.detail.chatId) {
        setActiveChat(null);
      }
    };

    window.addEventListener("chat:selected", handleChatSelected);
    window.addEventListener("chat:deleted", handleChatDeleted);

    return () => {
      window.removeEventListener("chat:selected", handleChatSelected);
      window.removeEventListener("chat:deleted", handleChatDeleted);
    };
  }, [activeChat]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="text-sm text-muted">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-bg text-text overflow-hidden relative">
      {/* Mobile backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={`
          ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0 fixed md:relative z-50 md:z-auto
          transition-transform duration-300 ease-in-out h-full
        `}
      >
        <Sidebar
          onNewChat={setActiveChat}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Main content */}
      <div className="flex-1 flex min-h-0 min-w-0">
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow
            activeChat={activeChat}
            onCreateChat={setActiveChat}
            onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          />
        </div>
      </div>
    </div>
  );
};

export default Home;
