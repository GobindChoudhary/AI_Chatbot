import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeChat, setActiveChat] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          },
        );
        setIsAuthenticated(res.ok);
      } catch {
        setIsAuthenticated(false);
      } finally {
        setCheckingAuth(false);
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
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg)]">
        <span className="text-sm text-[var(--muted)]">Loading...</span>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-[var(--bg)] overflow-hidden relative">
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <div
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 ease-in-out h-full`}
      >
        <Sidebar
          onNewChat={setActiveChat}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <ChatWindow
          activeChat={activeChat}
          onCreateChat={setActiveChat}
          onToggleSidebar={() => setMobileOpen(!mobileOpen)}
          isAuthenticated={isAuthenticated}
        />
      </div>
    </div>
  );
};

export default Home;
