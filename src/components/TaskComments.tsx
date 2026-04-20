"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import {
  Send,
  Paperclip,
  X,
  Loader2,
  MessageSquare,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { getSocket } from "@/lib/socket-client";
import axios from "axios";
interface CommentSectionProps {
  taskId: string;
}
function formatTime(date: Date) {
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return date.toLocaleDateString();
}
const AVATAR_COLORS = [
  "bg-indigo-600", "bg-violet-600", "bg-pink-600",
  "bg-emerald-600", "bg-amber-600", "bg-sky-600",
];
function getAvatarColor(name: string) {
  const idx = (name?.charCodeAt(0) || 0) % AVATAR_COLORS.length;
  return AVATAR_COLORS[idx];
}
export default function CommentSection({ taskId }: CommentSectionProps) {
  const { user } = useAuth();
  const [comments, setComments] = useState<any[]>([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [attachment, setAttachment] = useState<string | null>(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [connected, setConnected] = useState(false);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const scrollToBottom = useCallback((behavior: ScrollBehavior = "smooth") => {
    scrollAnchorRef.current?.scrollIntoView({ behavior, block: "end" });
  }, []);
  const fetchComments = useCallback(async () => {
    try {
      const res = await axios.get(`/api/comments?taskId=${taskId}`);
      if (res.data) {
        setComments(res.data);
        setTimeout(() => scrollToBottom("instant"), 50);
      }
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setInitialLoading(false);
    }
  }, [taskId, scrollToBottom]);
  useEffect(() => {
    const socket = getSocket();
    const onConnect = () => {
      setConnected(true);
      socket.emit("join-task-room", taskId);
    };
    const onDisconnect = () => setConnected(false);
    setConnected(socket.connected);
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    if (socket.connected) {
      socket.emit("join-task-room", taskId);
    }
    const onNewComment = (comment: any) => {
      setComments(prev => {
        if (prev.some(c => c._id === comment._id)) return prev;
        const isOwnComment = comment.userId?._id === user?.id ||
          comment.userId === user?.id;
        const hasOptimistic = prev.some(c =>
          typeof c._id === "string" && c._id.startsWith("optimistic-")
        );
        if (isOwnComment && hasOptimistic) return prev;
        return [...prev, comment];
      });
      setTimeout(() => scrollToBottom(), 80);
    };
    socket.on("new_comment", onNewComment);
    fetchComments();
    return () => {
      socket.emit("leave-task-room", taskId);
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("new_comment", onNewComment);
    };
  }, [taskId, fetchComments, scrollToBottom, user?.id]);
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file (JPG, PNG)");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5MB");
      return;
    }
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/api/upload", formData);
      if (res.data) {
        setAttachment(res.data.secure_url);
        toast.success("Image ready to send");
      }
    } catch (error) {
      toast.error("Error uploading file");
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!message.trim() && !attachment) return;
    if (loading) return;
    setLoading(true);
    const optimisticMessage = message;
    const optimisticAttachment = attachment;
    const optimisticComment = {
      _id: `optimistic-${Date.now()}`,
      taskId,
      message: optimisticMessage,
      imageUrl: optimisticAttachment,
      createdAt: new Date().toISOString(),
      userId: { _id: user?.id, name: user?.name },
    };
    setComments(prev => [...prev, optimisticComment]);
    setMessage("");
    setAttachment(null);
    setTimeout(() => scrollToBottom(), 50);
    try {
      const res = await axios.post("/api/comments", { taskId, message: optimisticMessage, imageUrl: optimisticAttachment });
      if (res.data) {
        setComments(prev =>
          prev.map(c => c._id === optimisticComment._id ? res.data : c)
        );
      }
    } catch (error) {
      setComments(prev => prev.filter(c => c._id !== optimisticComment._id));
      toast.error("Error posting comment");
    } finally {
      setLoading(false);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
      handleSend();
    }
  };
  return (
    <div className="flex flex-col overflow-hidden rounded-xl bg-white dark:bg-slate-900" style={{ height: "460px" }}>
      {}
      <div className="px-5 py-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
            <MessageSquare className="w-3.5 h-3.5" />
          </div>
          <h3 className="font-bold text-sm text-slate-800 dark:text-slate-200">Discussion</h3>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className="text-[10px] h-5 px-2">
            {comments.length} {comments.length === 1 ? "Comment" : "Comments"}
          </Badge>
          <div className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${connected ? "bg-emerald-500 animate-pulse" : "bg-slate-400"}`} />
            <span className="text-[10px] text-slate-400">{connected ? "Live" : "Connecting..."}</span>
          </div>
        </div>
      </div>
      {}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 custom-scrollbar">
        {initialLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
          </div>
        ) : comments.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 opacity-40">
            <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
              <MessageSquare className="w-8 h-8 text-slate-400" />
            </div>
            <p className="text-sm font-medium text-slate-500">No discussion yet</p>
            <p className="text-xs text-slate-400">Be the first to start the conversation!</p>
          </div>
        ) : (
          comments.map((comment, i) => {
            const isOwn = comment.userId?._id === user?.id;
            const senderName = comment.userId?.name || "Unknown";
            const avatarColor = getAvatarColor(senderName);
            const isOptimistic = comment._id?.startsWith("optimistic-");
            const showDateDivider =
              i === 0 ||
              new Date(comment.createdAt).toDateString() !==
              new Date(comments[i - 1].createdAt).toDateString();
            return (
              <div key={comment._id}>
                {showDateDivider && (
                  <div className="flex items-center gap-3 my-2">
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                    <span className="text-[10px] text-slate-400 font-medium px-2">
                      {new Date(comment.createdAt).toLocaleDateString("en-US", {
                        weekday: "short", month: "short", day: "numeric",
                      })}
                    </span>
                    <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800" />
                  </div>
                )}
                <div className={`flex gap-3 ${isOwn ? "flex-row-reverse" : ""} ${isOptimistic ? "opacity-70" : ""}`}>
                  <Avatar className={`w-8 h-8 shrink-0 border-2 border-white dark:border-slate-900 ${avatarColor}`}>
                    <AvatarFallback className={`text-[10px] font-bold text-white ${avatarColor}`}>
                      {senderName.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className={`flex flex-col max-w-[78%] gap-1 ${isOwn ? "items-end" : "items-start"}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-slate-600 dark:text-slate-300">
                        {isOwn ? "You" : senderName}
                      </span>
                      <span className="text-[9px] text-slate-400">
                        {isOptimistic ? "sending..." : formatTime(new Date(comment.createdAt))}
                      </span>
                    </div>
                    <div className={`px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed ${isOwn
                        ? "bg-indigo-600 text-white rounded-tr-sm shadow-sm shadow-indigo-200 dark:shadow-none"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-sm"
                      }`}>
                      {comment.message && (
                        <p className="whitespace-pre-wrap break-words">{comment.message}</p>
                      )}
                      {comment.imageUrl && (
                        <div className={`mt-2 rounded-xl overflow-hidden border max-w-[200px] ${isOwn ? "border-white/20" : "border-slate-200 dark:border-slate-700"
                          }`}>
                          <img
                            src={comment.imageUrl}
                            alt="Attachment"
                            className="w-full h-auto object-cover cursor-zoom-in hover:opacity-90 transition-opacity"
                            onClick={() => window.open(comment.imageUrl, "_blank")}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        {}
        <div ref={scrollAnchorRef} />
      </div>
      {}
      {attachment && (
        <div className="px-5 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 shrink-0">
          <div className="relative inline-block">
            <div className="w-14 h-14 rounded-lg overflow-hidden border-2 border-indigo-400 shadow-md">
              <img src={attachment} alt="Preview" className="w-full h-full object-cover" />
            </div>
            <button
              type="button"
              onClick={() => setAttachment(null)}
              className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white rounded-full p-0.5 shadow-md hover:bg-rose-600 transition-colors"
            >
              <X className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}
      {}
      <div className="px-4 py-3 border-t border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
        <div className="flex items-end gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Write a comment... (Ctrl+Enter to send)"
              rows={2}
              className="resize-none pr-10 bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 focus-visible:ring-indigo-500 text-sm rounded-xl leading-relaxed"
            />
            <label className="absolute bottom-2.5 right-2.5 cursor-pointer text-slate-400 hover:text-indigo-500 transition-colors p-1 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20">
              {uploading ? (
                <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
              ) : (
                <Paperclip className="w-4 h-4" />
              )}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/jpeg,image/png,image/gif,image/webp"
                onChange={handleFileUpload}
                disabled={uploading}
              />
            </label>
          </div>
          <Button
            type="button"
            size="icon"
            onClick={handleSend}
            disabled={(!message.trim() && !attachment) || loading || uploading}
            className="bg-indigo-600 hover:bg-indigo-700 shrink-0 w-10 h-10 rounded-xl shadow-sm shadow-indigo-200 dark:shadow-none"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        <p className="text-[10px] text-slate-400 mt-1.5 pl-1">
          Real-time via WebSocket · Ctrl+Enter to send
        </p>
      </div>
    </div>
  );
}
