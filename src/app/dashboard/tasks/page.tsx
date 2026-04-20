"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  Loader2,
  Briefcase,
  ListTodo,
  TrendingUp,
  CalendarClock,
  ChevronRight,
  ShieldAlert,
  User
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from "axios";
const STATUS_CONFIG: Record<string, { label: string; class: string; icon: React.ElementType }> = {
  // pending_approval: { label: "Pending Approval", class: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  // todo: { label: "To Do", class: "bg-blue-100 text-blue-700 border-blue-200", icon: ListTodo },
  in_progress: { label: "In Progress", class: "bg-indigo-100 text-indigo-700 border-indigo-200", icon: TrendingUp },
  review: { label: "In Review", class: "bg-purple-100 text-purple-700 border-purple-200", icon: Clock },
  done: { label: "Done", class: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  // rejected: { label: "Rejected", class: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle },
};
const PRIORITY_CONFIG: Record<string, string> = {
  low: "text-slate-500",
  medium: "text-amber-600",
  high: "text-rose-600",
};
function formatDuration(startTime: string, completionTime: string) {
  const ms = new Date(completionTime).getTime() - new Date(startTime).getTime();
  const hours = Math.floor(ms / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  if (days > 0) return `${days}d ${remHours}h`;
  if (hours > 0) return `${hours}h`;
  return `${Math.floor(ms / (1000 * 60))}m`;
}
export default function MyTasksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  useEffect(() => {
    if (user && user.role !== "employee") {
      router.replace("/dashboard/projects");
    }
  }, [user, router]);
  const fetchTasks = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/tasks");
      if (res.data) {
        setTasks(res.data);
      }
    } catch {
      toast.error("Failed to load tasks");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (user?.role === "employee") fetchTasks();
  }, [user]);
  const updateStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await axios.patch(`/api/tasks/${taskId}`, { status: newStatus });
      if (res.data) {
        toast.success("Task status updated!");
        fetchTasks();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Update failed");
    }
  };
  if (!user || user.role !== "employee") {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-4">
        <div className="p-4 rounded-2xl bg-amber-50 text-amber-500">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <h2 className="text-xl font-bold text-slate-700">Access Restricted</h2>
        <p className="text-slate-500 text-sm">This page is only for employees.</p>
      </div>
    );
  }
  const statCounts = {
    all: tasks.length,
    todo: tasks.filter(t => t.status === "todo").length,
    in_progress: tasks.filter(t => t.status === "in_progress").length,
    review: tasks.filter(t => t.status === "review").length,
    done: tasks.filter(t => t.status === "done").length,
    pending_approval: tasks.filter(t => t.status === "pending_approval").length,
  };
  const filteredTasks = activeFilter === "all"
    ? tasks
    : tasks.filter(t => t.status === activeFilter);
  const projectGroups = filteredTasks.reduce((acc: any, task: any) => {
    const projectId = task.projectId?._id || "unknown";
    const projectName = task.projectId?.name || "Unknown Project";
    if (!acc[projectId]) acc[projectId] = { name: projectName, tasks: [] };
    acc[projectId].tasks.push(task);
    return acc;
  }, {});
  const upcomingDeadlines = tasks
    .filter(t => t.deadline && t.status !== "done" && t.status !== "rejected")
    .filter(t => {
      const days = (new Date(t.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
      return days >= 0 && days <= 7;
    })
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  return (
    <div className="space-y-8">
      { }
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-500 font-medium mb-2">
            <User className="w-4 h-4" />
            <span>Personalized Dashboard</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            My Tasks
          </h1>
          <p className="text-slate-500 mt-1">
            All tasks assigned to you across every project you're a part of.
          </p>
        </div>
        <div className="flex items-center gap-3 text-sm">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 font-semibold">
            <ListTodo className="w-4 h-4" />
            <span>{statCounts.all} Total</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600 font-semibold">
            <CheckCircle2 className="w-4 h-4" />
            <span>{statCounts.done} Done</span>
          </div>
        </div>
      </div>
      { }
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {[
          { key: "all", label: "All Tasks", color: "indigo" },
          // { key: "pending_approval", label: "Pending Approval", color: "amber" },
          // { key: "todo", label: "To Do", color: "blue" },
          { key: "in_progress", label: "In Progress", color: "violet" },
          { key: "review", label: "In Review", color: "purple" },
          { key: "done", label: "Completed", color: "emerald" },
        ].map(({ key, label, color }) => (
          <button
            key={key}
            onClick={() => setActiveFilter(key)}
            className={`p-3 rounded-xl border text-left transition-all ${activeFilter === key
              ? `border-${color}-300 bg-${color}-50 dark:bg-${color}-900/20 ring-1 ring-${color}-300`
              : "border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300"
              }`}
          >
            <div className={`text-2xl font-bold ${activeFilter === key ? `text-${color}-600` : "text-slate-700 dark:text-slate-200"}`}>
              {statCounts[key as keyof typeof statCounts]}
            </div>
            <div className="text-[10px] text-slate-500 mt-0.5 font-medium">{label}</div>
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        { }
        <div className="lg:col-span-2 space-y-6">
          {loading ? (
            <div className="flex justify-center py-20">
              <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
            </div>
          ) : filteredTasks.length === 0 ? (
            <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardContent className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800">
                  <CheckCircle2 className="w-10 h-10 text-slate-400" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-slate-700 dark:text-slate-200">No tasks here</p>
                  <p className="text-sm text-slate-500 mt-1">
                    {activeFilter === "all"
                      ? "You haven't been assigned any tasks yet."
                      : `No tasks with "${STATUS_CONFIG[activeFilter]?.label || activeFilter}" status.`}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(projectGroups).map(([projectId, group]: [string, any]) => (
              <Card key={projectId} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600">
                      <Briefcase className="w-4 h-4" />
                    </div>
                    <CardTitle className="text-base">{group.name}</CardTitle>
                    <Badge variant="secondary" className="ml-auto text-[10px] h-5">
                      {group.tasks.length} task{group.tasks.length !== 1 ? "s" : ""}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 p-1.5"
                      onClick={() => router.push(`/dashboard/projects/${projectId}`)}
                    >
                      View Project <ChevronRight className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 pt-0">
                  {group.tasks.map((task: any) => {
                    const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.todo;
                    const StatusIcon = statusCfg.icon;
                    const isOverdue = task.deadline && task.status !== "done" && new Date(task.deadline) < new Date();
                    return (
                      <div
                        key={task._id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900/50 hover:shadow-sm transition-all"
                      >
                        <div className="flex items-start gap-3">
                          <div className={`p-1.5 rounded-lg mt-0.5 ${statusCfg.class}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{task.title}</h3>
                            <div className="flex items-center flex-wrap gap-2 text-[10px] text-slate-500 mt-0.5">
                              <span className={`font-semibold capitalize ${PRIORITY_CONFIG[task.priority]}`}>
                                {task.priority} priority
                              </span>
                              {task.deadline && (
                                <span className={`flex items-center gap-0.5 ${isOverdue ? "text-rose-500 font-semibold" : ""}`}>
                                  <CalendarClock className="w-3 h-3" />
                                  {isOverdue ? "Overdue · " : "Due "}
                                  {new Date(task.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                                </span>
                              )}
                              { }
                              {task.status === "done" && task.startTime && task.completionTime && (
                                <span className="flex items-center gap-0.5 text-emerald-600 font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  Completed in {formatDuration(task.startTime, task.completionTime)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <Badge className={`capitalize border text-[10px] h-5 px-2 ${statusCfg.class}`}>
                            {statusCfg.label}
                          </Badge>
                          { }
                          {task.status === "todo" && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-xs"
                              onClick={() => updateStatus(task._id, "in_progress")}
                            >
                              Start
                            </Button>
                          )}
                          {task.status === "in_progress" && (
                            <Button
                              size="sm"
                              className="h-7 text-xs bg-indigo-600 hover:bg-indigo-700 text-white"
                              onClick={() => updateStatus(task._id, "review")}
                            >
                              Submit for Review
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </CardContent>
              </Card>
            ))
          )}
        </div>
        { }
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-rose-500" />
                Upcoming Deadlines
              </CardTitle>
              <CardDescription>Tasks due within the next 7 days</CardDescription>
            </CardHeader>
            <CardContent>
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6 text-slate-400 text-sm">
                  No upcoming deadlines 🎉
                </div>
              ) : (
                <div className="space-y-3">
                  {upcomingDeadlines.map(task => {
                    const daysLeft = Math.ceil(
                      (new Date(task.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
                    );
                    return (
                      <div key={task._id} className="p-3 rounded-xl bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/30">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 truncate">{task.title}</p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-[10px] text-slate-500">{task.projectId?.name}</span>
                          <span className={`text-[10px] font-bold ${daysLeft <= 1 ? "text-rose-600" : "text-amber-600"}`}>
                            {daysLeft === 0 ? "Due Today!" : `${daysLeft}d left`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
          { }
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-gradient-to-br from-indigo-50 to-violet-50 dark:from-indigo-900/10 dark:to-violet-900/10">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                Your Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {statCounts.all > 0 && (
                <>
                  <div>
                    <div className="flex justify-between text-xs text-slate-600 dark:text-slate-400 mb-1.5">
                      <span>Overall Completion</span>
                      <span className="font-bold text-indigo-600">
                        {Math.round((statCounts.done / statCounts.all) * 100)}%
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500"
                        style={{ width: `${Math.round((statCounts.done / statCounts.all) * 100)}%` }}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-900/40">
                      <div className="text-lg font-bold text-indigo-600">{statCounts.in_progress}</div>
                      <div className="text-[10px] text-slate-500">Active</div>
                    </div>
                    <div className="text-center p-2 rounded-lg bg-white/60 dark:bg-slate-900/40">
                      <div className="text-lg font-bold text-emerald-600">{statCounts.done}</div>
                      <div className="text-[10px] text-slate-500">Completed</div>
                    </div>
                  </div>
                </>
              )}
              {statCounts.all === 0 && (
                <p className="text-sm text-slate-500 text-center py-4">
                  No tasks assigned yet. Check back soon!
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
