import { Sparkles, LogOut } from "lucide-react";

export default function ChatHeader({ title, active }) {
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
    <header className="px-3 sm:px-4 py-2 sm:py-3 bg-surface flex items-center justify-between">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="text-lg sm:text-xl font-semibold text-text">
          {" "}
          <div className="flex gap-1 sm:gap-2 items-center">
            <Sparkles
              size={16}
              className="text-blue-500 sm:w-[18px] sm:h-[18px]"
            />
            <h1 className="text-base sm:text-lg">ByteBot</h1>
          </div>
        </div>
      </div>

      <button
        onClick={handleLogout}
        className="group relative px-2 sm:px-3 py-1 sm:py-2 rounded-lg bg-black/20 hover:bg-red-600/20 text-white transition-colors duration-200"
        aria-label="Logout"
      >
        <LogOut
          size={18}
          className="text-muted group-hover:text-red-500 transition-colors sm:w-5 sm:h-5"
        />
        <span className="absolute right-0 top-full mt-2 px-3 py-1 bg-black/90 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          Logout
        </span>
      </button>
    </header>
  );
}
