import { Sparkles, Send } from "lucide-react";

export default function ChatInput({ input, setInput, onSend, placeholder }) {
  return (
    <footer className="px-4 py-4 bg-transparent">
      <div className="max-w-4xl mx-auto flex items-center gap-4">
        <div className="flex-1 bg-black/20 rounded-full px-3 py-2 flex items-center gap-3">
          <Sparkles size={18} className="text-blue-500" />
          {/* Input */}
          <textarea
            rows={1}
            className="flex-1 resize-none bg-transparent text-text placeholder:text-muted outline-none px-2 py-1"
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
        </div>

        {/* Send button - circular */}
        <button
          onClick={onSend}
          disabled={input.trim() === ""}
          aria-label="Send"
          className="flex items-center justify-center w-11 h-11 rounded-full bg-black/30 hover:bg-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
        >
          <Send size={18} className="text-white" />
        </button>
      </div>
    </footer>
  );
}
