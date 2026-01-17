import MarkdownPreview from "@uiw/react-markdown-preview";

export default function Message({ from, children }) {
  const isUser = from === "me";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={
          isUser
            ? "max-w-[85%] sm:max-w-[70%] px-4 py-3 rounded-2xl bg-[var(--input)] text-[var(--text)]"
            : "max-w-[90%] sm:max-w-[85%] py-2 text-[var(--text-secondary)]"
        }
      >
        {isUser ? (
          <div className="text-sm leading-relaxed break-words">{children}</div>
        ) : (
          <MarkdownPreview
            source={String(children)}
            style={{
              backgroundColor: "transparent",
              color: "rgba(255, 255, 255, 0.9)",
              fontSize: "14px",
              lineHeight: "1.6",
            }}
            data-color-mode="dark"
            wrapperElement={{ "data-color-mode": "dark" }}
          />
        )}
      </div>
    </div>
  );
}
