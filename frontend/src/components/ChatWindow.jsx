import React, { useEffect, useState, useRef } from "react";
import { Sparkles } from "lucide-react";
import { initSocket, sendAiMessage, onAiResponse } from "../utils/socket";
import Message from "./Message";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

export default function ChatWindow({ openSidebar, activeChat, onCreateChat }) {
  const [messages, setMessages] = useState([]);
  const [title, setTitle] = useState("");
  const [input, setInput] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const messagesRef = useRef(null);

  const activeChatId = activeChat && activeChat._id ? activeChat._id : null;

  useEffect(() => {
    // load current user
    const loadUser = async () => {
      try {
        const res = await fetch(
          import.meta.env.VITE_SERVER_DOMAIN + "/api/auth/me",
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

  useEffect(() => {
    // load messages for selected chat
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
        if (!res.ok) return setMessages([]);
        const data = await res.json();
        setMessages(data.messages || []);
        setTitle(activeChat.title || "Chat");
      } catch (err) {
        console.error(err);
        setMessages([]);
      }
    };
    loadMessages();
  }, [activeChatId, activeChat]);

  useEffect(() => {
    initSocket();
    const unsub = onAiResponse((payload) => {
      if (!payload || !payload.chat) return;
      if (payload.chat === activeChatId) {
        setMessages((prev) => [
          ...prev,
          { _id: `ai-${Date.now()}`, role: "model", content: payload.content },
        ]);
      }
    });
    return () => {
      try {
        unsub();
      } catch (e) {}
    };
  }, [activeChatId]);

  useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  // optimistic send + emit
  const doSend = async (chatId, messageText) => {
    const userMessage = {
      _id: `u-${Date.now()}`,
      role: "user",
      content: messageText,
    };
    setMessages((prev) => [...prev, userMessage]);
    sendAiMessage({ chat: chatId, content: messageText });
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim()) return;

    if (!activeChatId) {
      // Create new chat using first message as title
      await createChatThenSend(input.slice(0, 50)); // Limit title to 50 chars
      return;
    }

    doSend(activeChatId, input);
  };

  // create chat and send pending input
  const createChatThenSend = async (name) => {
    if (!name) return;
    try {
      const res = await fetch(
        import.meta.env.VITE_SERVER_DOMAIN + "/api/chat",
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ title: name }),
        }
      );
      if (!res.ok) return console.error("Failed to create chat");
      const data = await res.json();
      const newChat = data.chat;
      // notify parent and other listeners
      if (typeof onCreateChat === "function") onCreateChat(newChat);
      try {
        window.dispatchEvent(
          new CustomEvent("chat:created", { detail: newChat })
        );
      } catch (e) {}
      try {
        window.dispatchEvent(
          new CustomEvent("chat:selected", { detail: newChat })
        );
      } catch (e) {}
      // send message for newly created chat
      await doSend(newChat._id, input);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col h-screen max-h-screen">
        <ChatHeader
          title={title}
          active={!!activeChatId}
          openSidebar={openSidebar}
        />

        <main ref={messagesRef} className="flex-1 overflow-y-auto bg-bg">
          <div className="max-w-4xl mx-auto px-6 py-8">
            <div className="space-y-8 min-h-0">
              {messages.length === 0 && (
                <div className="text-center py-20">
                  <div className="mb-4 flex justify-center">
                    <Sparkles size={48} className="text-blue-500" />
                  </div>
                  <div className="text-3xl font-semibold mb-2 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-clip-text text-transparent">
                    Hi, {currentUser?.userName || "Guest"}!
                  </div>
                  <div className="text-sm text-muted">Start a conversation</div>
                </div>
              )}
              {messages.map((m) => (
                <Message key={m._id} from={m.role === "user" ? "me" : "them"}>
                  {m.content}
                </Message>
              ))}
            </div>
          </div>
        </main>

        <div className="flex-shrink-0 border-t border-gray-800">
          <ChatInput
            input={input}
            setInput={setInput}
            onSend={handleSend}
            placeholder={activeChatId ? "Ask Gemini" : "Ask Gemini"}
          />
        </div>

        {/* socket status removed */}
      </div>
    </>
  );
}
