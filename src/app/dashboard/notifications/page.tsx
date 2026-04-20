"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bell, Clock, Info, CheckCircle2, ShieldAlert } from "lucide-react";
import axios from "axios";
export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/notifications");
        if (res.data) {
          setNotifications(res.data);
        }
      } catch (error) {
        console.error("Error fetching notifications", error);
      }
      setLoading(false);
    };
    fetchNotifications();
  }, []);
  const getIcon = (type: string) => {
    switch (type) {
      case "assigned": return <ShieldAlert className="w-5 h-5 text-indigo-500" />;
      case "status_changed": return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      default: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Notifications</h1>
        <p className="text-slate-500">Stay updated with your latest team activities.</p>
      </div>
      <div className="max-w-3xl space-y-4">
        {notifications.length === 0 && !loading ? (
             <Card className="border-dashed py-10 text-center text-slate-400">
                All caught up!
             </Card>
        ) : notifications.map((noti) => (
          <Card key={noti._id} className={`border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 ${!noti.isRead ? 'bg-indigo-50/50 dark:bg-indigo-900/10' : ''}`}>
            <CardContent className="p-4 flex gap-4">
              <div className="mt-1">{getIcon(noti.type)}</div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h4 className="font-bold text-slate-900 dark:text-white">{noti.title}</h4>
                  <span className="text-[10px] text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(noti.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-1">{noti.message}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
