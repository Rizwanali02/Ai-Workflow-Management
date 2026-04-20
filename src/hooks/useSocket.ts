"use client";
import { useEffect, useState } from "react";
import { io as ClientIO } from "socket.io-client";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";
export const useSocket = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState<any>(null);
  useEffect(() => {
    if (!user) return;
    const socketInstance = ClientIO(process.env.NEXT_PUBLIC_SITE_URL || "", {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });
    socketInstance.on("connect", () => {
      socketInstance.emit("join-room", user.id);
    });
    socketInstance.on("notification", (data: any) => {
      toast.info(data.title, {
        description: data.message,
      });
    });
    setSocket(socketInstance);
    return () => {
      socketInstance.disconnect();
    };
  }, [user]);
  return socket;
};
