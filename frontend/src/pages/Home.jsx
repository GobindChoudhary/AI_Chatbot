import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [activeChat, setActiveChat] = useState(null);

  useEffect(() => {
    // prevent background scrolling when mobile sidebar is open
    document.body.style.overflow = sidebarOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  useEffect(() => {
    // check authentication using cookie-token
    const check = async () => {
      try {
        const res = await fetch(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/me",
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (!res.ok) {
          // not authenticated -> redirect to login
          window.location.href = "/login";
          return;
        }
        // authenticated
        setCheckingAuth(false);
      } catch (err) {
        // network or other error: redirect to login
        window.location.href = "/login";
      }
    };
    check();
  }, []);

  // listen for chat selection events dispatched from other components
  useEffect(() => {
    const onSelected = (e) => {
      if (e && e.detail) setActiveChat(e.detail);
    };
    window.addEventListener("chat:selected", onSelected);
    return () => window.removeEventListener("chat:selected", onSelected);
  }, []);

  if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg text-text">
        <div className="text-sm text-muted">Checking authentication...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen  flex bg-bg text-text">
      <Sidebar
        mobileOpen={sidebarOpen}
        setMobileOpen={setSidebarOpen}
        onNewChat={(chat) => setActiveChat(chat)}
      />

      <div className="flex-1 flex min-h-0">
        <div className="flex-1 flex flex-col min-h-0">
          <ChatWindow
            openSidebar={() => setSidebarOpen(true)}
            activeChat={activeChat}
            onCreateChat={(chat) => setActiveChat(chat)}
          />
        </div>
      </div>

      {/* overlay to close sidebar on mobile when open */}
      {sidebarOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default Home;
