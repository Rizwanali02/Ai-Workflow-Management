"use client";
import { useEffect } from "react";
import { getSocket } from "@/lib/socket-client";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
export default function SocketInitializer() {
  const { user } = useAuth();
  useEffect(() => {
    if (!user?.id) return;
    let socket = getSocket();
    const joinUserRoom = () => {
      socket.emit("join-user-room", user.id);
    };
    axios.get("/api/socket").finally(() => {
      socket = getSocket();
      if (socket.connected) {
        joinUserRoom();
      }
      socket.on("connect", joinUserRoom);
    });
    return () => {
      socket.off("connect", joinUserRoom);
    };
  }, [user?.id]);
  return null;
}
