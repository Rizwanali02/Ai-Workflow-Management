import { Server as NetServer } from "http";
import { Server as IOServer } from "socket.io";
export const config = {
  api: {
    bodyParser: false,
  },
};
const ioHandler = (req: any, res: any) => {
  if (!res.socket.server.io) {
    const httpServer: NetServer = res.socket.server as any;
    const io = new IOServer(httpServer, {
      path: "/api/socket/io",
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
    res.socket.server.io = io;
    (global as any).__io = io;
    io.on("connection", (socket) => {
      socket.on("join-user-room", (userId: string) => {
        socket.join(`user:${userId}`);
      });
      socket.on("join-task-room", (taskId: string) => {
        socket.join(`task:${taskId}`);
      });
      socket.on("leave-task-room", (taskId: string) => {
        socket.leave(`task:${taskId}`);
      });
      socket.on("disconnect", () => {
      });
    });
  }
  res.end();
};
export default ioHandler;
