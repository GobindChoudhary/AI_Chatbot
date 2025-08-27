import React from "react";
import { initSocket, sendAiMessage, onAiResponse } from "../utils/socket";
import NameModal from "./NameModal";
import Message from "./Message";
import ChatHeader from "./ChatHeader";
import ChatInput from "./ChatInput";

export default function ChatWindow({ openSidebar, activeChat, onCreateChat }) {
  const [messages, setMessages] = React.useState([]);
  const [title, setTitle] = React.useState("");
  const [input, setInput] = React.useState("");
  const [nameModalOpen, setNameModalOpen] = React.useState(false);
  const messagesRef = React.useRef(null);

  const activeChatId = activeChat && activeChat._id ? activeChat._id : null;

  React.useEffect(() => {
    // load messages for selected chat
    const loadMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        setTitle("");
        return;
      }
      try {
        const res = await fetch(
          `http://localhost:3000/api/chat/${activeChatId}/messages`,
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
    // debug
    // eslint-disable-next-line no-console
    console.debug("ChatWindow: activeChat changed", activeChat);
  }, [activeChatId, activeChat]);

  React.useEffect(() => {
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

  React.useEffect(() => {
    if (!messagesRef.current) return;
    messagesRef.current.scrollTo({
      top: messagesRef.current.scrollHeight,
      behavior: "smooth",
    });
    // eslint-disable-next-line no-console
    console.debug("ChatWindow: messages length", messages.length);
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

  const handleSend = () => {
    if (!input.trim()) return;
    if (!activeChatId) {
      setNameModalOpen(true);
      return;
    }
    doSend(activeChatId, input);
  };

  // create chat and send pending input
  const createChatThenSend = async (name) => {
    setNameModalOpen(false);
    if (!name) return;
    try {
      const res = await fetch("http://localhost:3000/api/chat", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: name }),
      });
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
      <div className="flex-1 flex flex-col min-h-0">
        <ChatHeader
          title={title}
          active={!!activeChatId}
          openSidebar={openSidebar}
        />

        <main
          ref={messagesRef}
          className="flex-1 overflow-y-auto p-6 bg-[var(--bg)]"
        >
          <div className="space-y-3">
            {messages.length === 0 && (
              <div className="text-sm text-[var(--muted)]">
                No messages yet.
              </div>
            )}
            {messages.map((m) => (
              <Message key={m._id} from={m.role === "user" ? "me" : "them"}>
                {m.content}
              </Message>
            ))}
          </div>
        </main>

        <ChatInput
          input={input}
          setInput={setInput}
          onSend={handleSend}
          placeholder={
            activeChatId ? "Send a message..." : "Start a new chat..."
          }
        />

        {/* socket status removed */}
      </div>

      <NameModal
        open={nameModalOpen}
        onClose={() => setNameModalOpen(false)}
        onSubmit={(val) => createChatThenSend(val)}
      />
    </>
  );
}
