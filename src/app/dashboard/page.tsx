"use client";
import { useAuth } from "@/context/AuthContext";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
  Briefcase,
  CheckCircle2,
  Clock,
  AlertCircle,
  TrendingUp,
  Plus,
  Sparkles,
  Users,
  Activity,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CreateTaskRequest } from "@/components/tasks/CreateTaskRequest";
import axios from "axios";
export default function DashboardPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [aiSummary, setAiSummary] = useState("Generating your summary...");
  const [adminStats, setAdminStats] = useState<any>(null);

  useEffect(() => {
    setMounted(true);
    if (!loading && user) {
      fetchAiSummary();
      fetchDashboardStats();
    }
  }, [user, loading]);
  const fetchAiSummary = async () => {
    try {
      const res = await axios.get("/api/ai/summary");
      if (res.data) {
        setAiSummary(res.data.summary);
      }
    } catch (e) {
      setAiSummary("Unable to load summary at this time.");
    }
  };
  const fetchDashboardStats = async () => {
    try {
      const res = await axios.get("/api/stats");
      if (res.data) {
        setAdminStats(res.data);
      }
    } catch (error) {
      console.error("Error fetching stats", error);
    }
  };
  const stats = [
    {
      title: "Total Projects",
      value: adminStats?.totalProjects || "0",
      icon: Briefcase,
      color: "text-blue-600",
      bg: "bg-blue-50 dark:bg-blue-900/20",
      show: true
    },
    {
      title: "Active Tasks",
      value: adminStats?.activeTasks || "0",
      icon: Clock,
      color: "text-amber-600",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      show: true
    },
    {
      title: "Completed",
      value: adminStats?.completedTasks || "0",
      icon: CheckCircle2,
      color: "text-emerald-600",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      show: true
    },
    {
      title: "Total Users",
      value: adminStats?.totalUsers || "0",
      icon: User,
      color: "text-rose-600",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      show: (user?.role !== "employee" && user?.role !== "manager")
    }
  ].filter(s => s.show);
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Welcome back{mounted && user?.name ? `, ${user.name.split(' ')[0]}` : ''}! 👋
          </h1>
          <p className="text-slate-500 mt-1">
            {user?.role === "admin" ? "System-wide overview for today." : "Here's what's happening with your projects today."}
          </p>
        </div>
        {/* <div className="flex items-center gap-3">
          {user?.role === "employee" && (
            <Button 
                onClick={() => setShowCreateTask(!showCreateTask)}
                className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-md"
            >
                <Plus className="w-4 h-4 mr-2" />
                {showCreateTask ? "Close Request" : "Create Task Request"}
            </Button>
          )}
        </div> */}
      </div>
      {showCreateTask ? (
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Submit Task Request</CardTitle>
            <CardDescription>Initiate a new task for project manager review.</CardDescription>
          </CardHeader>
          <CardContent>
            <CreateTaskRequest />
          </CardContent>
        </Card>
      ) : (
        <>
          { }
          <Card className="border-none bg-gradient-to-br from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200 dark:shadow-none">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
                <div className="p-3 bg-white/20 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-lg mb-1">AI Status Summary</h3>
                  <p className="text-indigo-50 text-sm leading-relaxed">
                    "{aiSummary}"
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          { }
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <Card key={i} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-2 rounded-lg ${stat.bg}`}>
                      <stat.icon className={`w-5 h-5 ${stat.color}`} />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-500 mb-1">{stat.title}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</h3>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          { }
          {user?.role === "admin" && (
            <div className="grid gap-6 lg:grid-cols-7">
              <Card className="lg:col-span-4 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                  <CardTitle>System Activity</CardTitle>
                  <CardDescription>Live monitoring of organizational events.</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-48 flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl text-slate-400">
                    <div className="flex flex-col items-center gap-2">
                      <Activity className="w-8 h-8 opacity-20" />
                      <p className="text-sm italic">Fetch activity logs...</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card className="lg:col-span-3 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <Button variant="outline" className="w-full justify-start border-slate-200" asChild>
                    <a href="/dashboard/admin/modules">Manage Module Permissions</a>
                  </Button>
                  <Button variant="outline" className="w-full justify-start border-slate-200" asChild>
                    <a href="/dashboard/team">System Users Directory</a>
                  </Button>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
}
