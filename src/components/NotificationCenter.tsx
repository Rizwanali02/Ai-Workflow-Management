"use client";
import { useEffect, useState, useCallback } from "react";
import { Bell, Check, Clock, AlertCircle, Briefcase, UserPlus } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { getSocket } from "@/lib/socket-client";
import axios from "axios";
function formatTime(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}
export default function NotificationCenter() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get("/api/notifications");
      if (res.data) {
        setNotifications(res.data);
        setUnreadCount(res.data.filter((n: any) => !n.isRead).length);
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  }, []);
  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);
  useEffect(() => {
    if (!user?.id) return;
    const socket = getSocket();
    socket.emit("join-user-room", user.id);
    const onNotification = (notification: any) => {
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);
    };
    socket.on("notification", onNotification);
    return () => {
      socket.off("notification", onNotification);
    };
  }, [user?.id]);
  const markAsRead = async (id?: string) => {
    try {
      const url = id ? `/api/notifications/${id}` : "/api/notifications/read-all";
      const res = await axios.patch(url);
      if (res.data) {
        if (id) {
          setNotifications(prev =>
            prev.map(n => n._id === id ? { ...n, isRead: true } : n)
          );
          setUnreadCount(prev => Math.max(0, prev - 1));
        } else {
          setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
          setUnreadCount(0);
        }
      }
    } catch (error) {
      console.error("Error marking as read:", error);
    }
  };
  const getIcon = (type: string) => {
    switch (type) {
      case "assigned": return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "status_changed": return <Clock className="w-4 h-4 text-amber-500" />;
      case "task_created": return <Briefcase className="w-4 h-4 text-indigo-500" />;
      case "task_approved": return <Check className="w-4 h-4 text-emerald-500" />;
      case "task_rejected": return <AlertCircle className="w-4 h-4 text-rose-500" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-indigo-600">
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-2 right-2.5 w-2 h-2 bg-indigo-600 rounded-full border-2 border-white dark:border-slate-900 animate-pulse" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <DropdownMenuLabel className="p-4 flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 text-indigo-600 hover:text-indigo-700 p-0"
              onClick={() => markAsRead()}
            >
              Mark all as read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[350px]">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-500">
              No notifications yet.
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification._id}
                className={`flex flex-col items-start p-4 gap-1 cursor-pointer focus:bg-slate-50 dark:focus:bg-slate-800 ${
                  !notification.isRead ? "bg-indigo-50/30 dark:bg-indigo-900/10" : ""
                }`}
                onClick={() => markAsRead(notification._id)}
              >
                <div className="flex items-center gap-2 w-full">
                  <div className="p-1.5 rounded-full bg-white dark:bg-slate-900 shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                    {getIcon(notification.type)}
                  </div>
                  <span className={`font-semibold text-sm ${
                    !notification.isRead
                      ? "text-slate-900 dark:text-white"
                      : "text-slate-600 dark:text-slate-400"
                  }`}>
                    {notification.title}
                  </span>
                  <span className="ml-auto text-[10px] text-slate-400">
                    {formatTime(new Date(notification.createdAt))}
                  </span>
                </div>
                <p className="text-xs text-slate-500 line-clamp-2 pl-8">
                  {notification.message}
                </p>
              </DropdownMenuItem>
            ))
          )}
        </ScrollArea>
        <DropdownMenuSeparator />
        <div className="p-2">
          <Link href="/dashboard/notifications">
            <Button variant="ghost" className="w-full text-xs text-slate-500 h-8">
              View all notifications
            </Button>
          </Link>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
