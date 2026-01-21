import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { initSocket, sendAiMessage, onAiResponse } from "../utils/socket";
import { useAuth } from "../context/AuthContext";
import Message from "./Message";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";
import LoadingIndicator from "./LoadingIndecator";
import logo from "../../public/logo.png";

export default function ChatWindow({
  activeChat,
  onCreateChat,
  onToggleSidebar,
}) {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loadingChats, setLoadingChats] = useState(new Set());
  const messagesRef = useRef(null);

  const activeChatId = activeChat?._id || null;

  // Load messages for selected chat
  useEffect(() => {
    const loadMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        return;
      }

      try {
        const res = await fetch(
          `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat/${activeChatId}/messages`,
          { method: "GET", credentials: "include" },
        );
        if (res.ok) {
          const data = await res.json();
          setMessages(data.messages || []);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };
    loadMessages();
  }, [activeChatId]);

  // Setup socket connection and AI response listener
  useEffect(() => {
    initSocket();
    const unsubscribe = onAiResponse((payload) => {
      // Process responses for any chat
      if (payload?.chat) {
        // Remove the chat from loading set when response arrives
        setLoadingChats((prev) => {
          const newSet = new Set(prev);
          newSet.delete(payload.chat);
          return newSet;
        });

        // If response is for current chat, show it immediately
        if (payload.chat === activeChatId) {
          setMessages((prev) => [
            ...prev,
            {
              _id: `ai-${Date.now()}`,
              role: "model",
              content: payload.content,
            },
          ]);
        }
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

    // Add this chat to the loading set
    setLoadingChats((prev) => new Set([...prev, chatId]));

    sendAiMessage({ chat: chatId, content: messageText });
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    // Check authentication when user tries to chat
    if (!isAuthenticated) {
      navigate("/login");
      return;
    }

    if (!activeChatId) {
      await createChatAndSend(input.slice(0, 50));
      return;
    }

    sendMessage(activeChatId, input);
  };

  const createChatAndSend = async (chatTitle) => {
    if (!chatTitle) return;

    try {
      const res = await fetch(
        `${import.meta.env.VITE_SERVER_DOMAIN}/api/chat`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: chatTitle }),
        },
      );

      if (!res.ok) {
        console.error("Failed to create chat");
        return;
      }

      const { chat: newChat } = await res.json();
      onCreateChat?.(newChat);
      window.dispatchEvent(
        new CustomEvent("chat:created", { detail: newChat }),
      );
      window.dispatchEvent(
        new CustomEvent("chat:selected", { detail: newChat }),
      );
      await sendMessage(newChat._id, input);
    } catch (err) {
      console.error(err);
    }
  };

  const EmptyState = () => (
    <div className="text-center py-10 md:py-20">
      <div className="mb-4 flex justify-center">
        <img src={logo} className="w-24 h-24 md:w-32 md:h-32" alt="ByteBot" />
      </div>
      <h2 className="text-xl md:text-3xl font-bold mb-2 text-[var(--text)] capitalize">
        Hi, {user?.userName || "Guest"}!
      </h2>
      <p className="text-sm text-[var(--muted)]">Start a conversation</p>
    </div>
  );

  return (
    <div className="flex-1 flex flex-col h-screen max-h-screen">
      <ChatHeader onToggleSidebar={onToggleSidebar} />

      <main ref={messagesRef} className="flex-1 overflow-y-auto bg-[var(--bg)]">
        <div className="max-w-4xl mx-auto px-3 sm:px-4 md:px-6 py-4 md:py-8">
          <div className="space-y-4 md:space-y-8">
            {messages.length === 0 && <EmptyState />}
            {messages.map((message) => (
              <Message
                key={message._id}
                from={message.role === "user" ? "me" : "them"}
              >
                {message.content}
              </Message>
            ))}
            {loadingChats.has(activeChatId) && <LoadingIndicator />}
          </div>
        </div>
      </main>

      <ChatInput
        input={input}
        setInput={setInput}
        onSend={handleSend}
        placeholder="Ask ByteBot"
      />
    </div>
  );
}
