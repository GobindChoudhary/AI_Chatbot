import React from "react";
import MarkdownPreview from "@uiw/react-markdown-preview";

export default function Message({ from, children }) {
  const isUser = from === "me";

  const bubbleClass = isUser
    ? "max-w-[85%] sm:max-w-[70%] p-3 md:p-4 rounded-2xl rounded-tr-none bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 text-white shadow-xl border border-blue-400/20 backdrop-blur-sm"
    : "max-w-[90%] sm:max-w-[85%] p-3 md:p-4 rounded-md bg-transparent text-white/90";

  return (
    <div className={`w-full flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div className={bubbleClass}>
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
