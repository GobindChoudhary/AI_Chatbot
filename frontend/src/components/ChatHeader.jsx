import { Sparkles, LogOut, Menu } from "lucide-react";

export default function ChatHeader({ onToggleSidebar }) {
  const handleLogout = async () => {
    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/logout`,
        {
          method: "POST",
          credentials: "include",
        },
      );
      if (res.ok) {
        window.location.href = "/login";
      } else {
        console.error("Logout failed", await res.text());
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="px-4 sm:px-6 py-2 sm:py-2 bg-[var(--bg)] flex items-center justify-between border-b border-[var(--border)]">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-lg hover:bg-[var(--hover)] transition-colors"
          aria-label="Toggle sidebar"
        >
          <Menu size={18} />
        </button>

        <div className="flex gap-2 items-center">
          <Sparkles size={18} className="text-[var(--text)] max-md:hidden" />
          <h1 className="text-md font-semibold md:text-lg smex text-[var(--text)]">
            ByteBot
          </h1>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="p-2 rounded-lg hover:bg-[var(--hover)] transition-colors group"
        aria-label="Logout"
      >
        <LogOut
          size={18}
          className="text-[var(--muted)] group-hover:text-[var(--danger)] transition-colors"
        />
      </button>
    </header>
  );
}
