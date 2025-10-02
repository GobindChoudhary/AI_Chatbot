import { io } from "socket.io-client";

let socket = null;

export function initSocket() {
  if (socket) return socket;
  // no explicit auth token is sent; browser will attach cookies automatically
  socket = io(import.meta.env.VITE_SERVER_DOMAIN, {
    withCredentials: true,
  });

  socket.on("connect", () => {
    // Connected successfully
  });

  socket.on("disconnect", (reason) => {
    // Socket disconnected
  });

  socket.on("connect_error", (err) => {
    console.error("socket connect error", err);
  });

  return socket;
}

export function getSocket() {
  return socket;
}

// helper to emit an ai-message
export function sendAiMessage(payload) {
  const s = socket || initSocket();
  if (!s) return;
  s.emit("ai-message", payload);
}

// subscribe to ai-response events
export function onAiResponse(cb) {
  const s = socket || initSocket();
  if (!s) return () => {};
  s.on("ai-response", cb);
  return () => s.off("ai-response", cb);
}

// helper to unsubscribe explicitly
export function offAiResponse(cb) {
  const s = socket;
  if (!s) return;
  s.off("ai-response", cb);
}
