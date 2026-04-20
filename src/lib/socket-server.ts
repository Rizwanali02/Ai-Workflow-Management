import { Server as IOServer } from "socket.io";
export function getIO(): IOServer | null {
  const globalWithIO = global as typeof globalThis & { __io?: IOServer };
  return globalWithIO.__io || null;
}
export function emitNotification(userId: string, notification: object) {
  const io = getIO();
  if (io) {
    io.to(`user:${userId}`).emit("notification", notification);
  }
}
export function emitNewComment(taskId: string, comment: object) {
  const io = getIO();
  if (io) {
    io.to(`task:${taskId}`).emit("new_comment", comment);
  }
}
