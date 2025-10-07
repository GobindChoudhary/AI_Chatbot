import { io } from "socket.io-client";

let socket = null;

export function initSocket() {
  if (socket) return socket;

  socket = io(import.meta.env.VITE_SERVER_DOMAIN, {
    withCredentials: true,
  });

  socket.on("connect_error", (err) => {
    console.error("Socket connection error:", err);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function sendAiMessage(payload) {
  const s = socket || initSocket();
  if (s) {
    s.emit("ai-message", payload);
  }
}

export function onAiResponse(callback) {
  const s = socket || initSocket();
  if (!s) return () => {};

  s.on("ai-response", callback);
  return () => s.off("ai-response", callback);
}

export function offAiResponse(callback) {
  if (socket) {
    socket.off("ai-response", callback);
  }
}
