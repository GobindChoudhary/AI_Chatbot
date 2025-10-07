import React, { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { initSocket, sendAiMessage, onAiResponse } from "../utils/socket";
import Message from "./Message";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

export default function ChatWindow({
  activeChat,
  onCreateChat,
  onToggleSidebar,
}) {
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef(null);

  const activeChatId = activeChat?._id || null;

  // Load current user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/auth/me`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setCurrentUser(data.user || null);
        }
      } catch (err) {
        console.error("Error loading user:", err);
      }
    };
    loadUser();
  }, []);

  // Load messages for selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        setTitle("");
        return;
      }

      try {
        const res = await fetch(
          `${
            import.meta.env.VITE_SERVER_DOMAIN
          }/api/chat/${activeChatId}/messages`,
          {
            method: "GET",
            credentials: "include",
          }
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
          setTitle(activeChat.title || "Chat");
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };
    loadMessages();
  }, [activeChatId, activeChat]);

  // Setup socket connection and AI response listener
  useEffect(() => {
    initSocket();
    const unsubscribe = onAiResponse((payload) => {
      if (payload?.chat === activeChatId) {
        setIsGenerating(false);
        setMessages((prev) => [
          ...prev,
          { _id: `ai-${Date.now()}`, role: "model", content: payload.content },
        ]);
      }
    });
    return () => {
      try {
        unsubscribe();
      } catch (e) {
        // Ignore unsubscribe errors
      }
    };
  }, [activeChatId]);

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTo({
        top: messagesRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const sendMessage = async (chatId, messageText) => {
    const userMessage = {
      _id: `u-${Date.now()}`,
      role: "user",
      content: messageText,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsGenerating(true);
    sendAiMessage({ chat: chatId, content: messageText });
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!activeChatId) {
      await createChatAndSend(input.slice(0, 50)); // Limit title to 50 chars
      return;
    }

    sendMessage(activeChatId, input);
  };

  const createChatAndSend = async (title) => {
    if (!title) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title }),
        }
      );

      if (!res.ok) {
        console.error("Failed to create chat");
        return;
      }

      const data = await res.json();
      const newChat = data.chat;

      // Notify parent and dispatch events
      if (typeof onCreateChat === "function") onCreateChat(newChat);

      try {
        window.dispatchEvent(
          new CustomEvent("chat:created", { detail: newChat })
        );
        window.dispatchEvent(
          new CustomEvent("chat:selected", { detail: newChat })
        );
      } catch (e) {
        // Ignore event dispatch errors
      }

      await sendMessage(newChat._id, input);
    } catch (err) {
      console.error(err);
    }
  };

  const LoadingIndicator = () => (
    <div className="w-full flex justify-start">
      <div className="max-w-[90%] sm:max-w-[85%] p-3 md:p-4 rounded-md bg-transparent text-white/90">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-blue-500 animate-pulse" />
          <span className="text-sm text-muted">Generating response...</span>
          <div className="flex gap-1">
            {[0, 0.1, 0.2].map((delay, i) => (
              <div
                key={i}
                className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                style={{ animationDelay: `${delay}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const EmptyState = () => (
    <div className="text-center py-10 md:py-20">
      <div className="mb-4 flex justify-center">
        <Sparkles size={36} className="text-blue-500 md:w-12 md:h-12" />
      </div>
      <div className="text-xl md:text-3xl font-semibold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
        Hi, {currentUser?.userName || "Guest"}!
      </div>
      <div className="text-sm text-muted">Start a conversation</div>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen">
      <ChatHeader
        title={title}
        active={!!activeChatId}
        onToggleSidebar={onToggleSidebar}
      />

      <main ref={messagesRef} className="flex-1 overflow-y-auto bg-bg">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
          <div className="space-y-4 md:space-y-8 min-h-0">
            {messages.length === 0 && <EmptyState />}
            {messages.map((message) => (
              <Message
                key={message._id}
                from={message.role === "user" ? "me" : "them"}
              >
                {message.content}
              </Message>
            ))}
            {isGenerating && <LoadingIndicator />}
          </div>
        </div>
      </main>

      <div className="flex-shrink-0 border-t border-gray-800">
        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          placeholder="Ask ByteBot"
        />
      </div>
    </div>
  );
}
