import { Send } from "lucide-react";

export default function ChatInput({ input, setInput, onSend, placeholder }) {
  return (
    <footer className="px-3 sm:px-6 py-3 sm:py-4 bg-[var(--bg)]">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center gap-3 bg-[var(--input)] rounded-2xl px-4 py-3 border border-[var(--border-light)] focus-within:border-[var(--border-focus)] transition-colors">
          <textarea
            rows={1}
            className="flex-1 resize-none bg-transparent text-[var(--text)] placeholder:text-[var(--muted)] outline-none text-sm sm:text-base leading-relaxed"
            placeholder={placeholder}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSend();
              }
            }}
          />
          <button
            onClick={onSend}
            disabled={input.trim() === ""}
            aria-label="Send"
            className="p-2 flex items-center justify-center rounded-full cursor-pointer active:scale-95 bg-[var(--text)] disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Send size={16} className="text-[var(--sidebar)]" />
          </button>
        </div>
      </div>
    </footer>
  );
}
