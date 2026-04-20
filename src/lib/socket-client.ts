import { io, Socket } from "socket.io-client";
let socket: Socket | null = null;
export function getSocket(): Socket {
  if (!socket) {
    socket = io({
      path: "/api/socket/io",
      addTrailingSlash: false,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    socket.on("connect", () => {
    });
    socket.on("disconnect", (reason) => {
    });
    socket.on("connect_error", (err) => {
      console.error("[Socket.io] Connection error:", err.message);
    });
  }
  return socket;
}
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}
