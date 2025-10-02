import { Sparkles, LogOut } from "lucide-react";

export default function ChatHeader({ title, active, openSidebar }) {
  const handleLogout = async () => {
    try {
      const serverDomain = import.meta.env.VITE_SERVER_DOMAIN;
      const res = await fetch(`${serverDomain}/api/auth/logout`, {
        method: "POST",
        credentials: "include",
      });
      if (res.ok) {
        // Redirect to login page after successful logout
        window.location.href = "/login";
      } else {
        console.error("Logout failed", await res.text());
      }
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <header className="px-4 py-3 bg-surface flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="text-xl font-semibold  text-text">
          {" "}
          <div className="flex gap-2 items-center">
            <Sparkles size={18} className="text-blue-500" />
            <h1>ByteBot</h1>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="group relative px-3 py-2 rounded-lg bg-black/20 hover:bg-red-600/20 text-white transition-colors duration-200"
        aria-label="Logout"
      >
        <LogOut
          size={20}
          className="text-muted group-hover:text-red-500 transition-colors"
        />
        <span className="absolute right-0 top-full mt-2 px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Logout
        </span>
      </button>
    </header>
  );
}
