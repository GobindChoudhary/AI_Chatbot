import { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";

const Home = () => {
  const [activeChat, setActiveChat] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Handle chat selection and deletion events
  useEffect(() => {
    const onSelect = (e) => e?.detail && setActiveChat(e.detail);
    const onDelete = (e) =>
      e?.detail?.chatId === activeChat?._id && setActiveChat(null);

    window.addEventListener("chat:selected", onSelect);
    window.addEventListener("chat:deleted", onDelete);
    return () => {
      window.removeEventListener("chat:selected", onSelect);
      window.removeEventListener("chat:deleted", onDelete);
    };
  }, [activeChat]);

  const toggleSidebar = () => setMobileOpen(!mobileOpen);
  const closeSidebar = () => setMobileOpen(false);

  return (
    <div className="h-screen flex bg-[var(--bg)] overflow-hidden relative">
      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <div
        className={`${mobileOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0 fixed md:relative z-50 md:z-auto transition-transform duration-300 h-full`}
      >
        <Sidebar
          onNewChat={setActiveChat}
          mobileOpen={mobileOpen}
          setMobileOpen={setMobileOpen}
        />
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <ChatWindow
          activeChat={activeChat}
          onCreateChat={setActiveChat}
          onToggleSidebar={toggleSidebar}
        />
      </div>
    </div>
  );
};

export default Home;
