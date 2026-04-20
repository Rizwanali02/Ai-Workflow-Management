"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useParams } from "next/navigation";
import {
  Briefcase,
  Calendar,
  Users,
  Clock,
  CheckCircle2,
  AlertCircle,
  Plus,
  Loader2,
  ChevronRight,
  MessageSquare,
  FileText,
  Clock3,
  BarChart3,
  User as UserIcon,
  MessageCircle,
  Search,
  Filter,
  UserPlus
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import CreateTaskModal from "@/components/CreateTaskModal";
import CommentSection from "@/components/TaskComments";
import ManageMembersModal from "@/components/ManageMembersModal";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { toast } from "sonner";
import axios from "axios";
export default function ProjectDetailsPage() {
  const params = useParams();
  const id = params?.id as string;
  const { user } = useAuth();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<any>(null);
  const fetchProjectDetails = async () => {
    try {
      const res = await axios.get(`/api/projects/${id}`);
      if (res.data) {
        setData(res.data);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchProjectDetails();
  }, [id]);
  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
      </div>
    );
  }
  if (!data?.project) {
    return (
      <div className="text-center py-20">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold">Project not found</h2>
      </div>
    );
  }
  const { project, tasks } = data;
  const canManageProject = user?.role === "admin" || project?.managerId?._id === user?.id;
  const stats = {
    total: tasks.length,
    done: tasks.filter((t: any) => t.status === "done").length,
    inProgress: tasks.filter((t: any) => t.status === "in_progress").length,
    todo: tasks.filter((t: any) => t.status === "todo").length,
  };
  const statusColors: any = {
    pending_approval: "bg-amber-100 text-amber-700 border-amber-200",
    todo: "bg-blue-100 text-blue-700 border-blue-200",
    in_progress: "bg-indigo-100 text-indigo-700 border-indigo-200",
    review: "bg-purple-100 text-purple-700 border-purple-200",
    done: "bg-emerald-100 text-emerald-700 border-emerald-200",
    rejected: "bg-rose-100 text-rose-700 border-rose-200",
  };
  return (
    <div className="space-y-8 pb-10">
      {}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-slate-500 text-sm font-medium">
            <Briefcase className="w-4 h-4" />
            <span>Projects</span>
            <ChevronRight className="w-4 h-4" />
            <span className="text-indigo-600">{project.name}</span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            {project.name}
          </h1>
          <p className="text-slate-500 max-w-2xl">{project.description}</p>
        </div>
        {(user?.role === "admin" || user?.role === "manager") && (
          <Button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-200 dark:shadow-none"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New Task
          </Button>
        )}
      </div>
      <CreateTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onSuccess={fetchProjectDetails}
        defaultProjectId={id as string}
      />
      <ManageMembersModal
        isOpen={isMembersModalOpen}
        onClose={() => setIsMembersModalOpen(false)}
        projectId={id as string}
        currentMembers={project.members?.map((m: any) => m._id) || []}
        onSuccess={fetchProjectDetails}
      />
      <Dialog open={!!selectedTask} onOpenChange={(open) => !open && setSelectedTask(null)}>
        <DialogContent className="w-full sm:max-w-3xl p-0 overflow-hidden border-none shadow-2xl">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
                <FileText className="w-5 h-5" />
              </div>
              {selectedTask?.title}
            </DialogTitle>
            <DialogDescription className="text-slate-500 pt-2">
              Review updates and join the discussion for this task.
            </DialogDescription>
          </DialogHeader>
          <div className="px-6 pb-6">
            {selectedTask && <CommentSection taskId={selectedTask._id} />}
          </div>
        </DialogContent>
      </Dialog>
      {}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600">
                <BarChart3 className="w-5 h-5" />
              </div>
              <Badge variant="secondary">Total</Badge>
            </div>
            <div className="text-3xl font-bold">{stats.total}</div>
            <p className="text-xs text-slate-500 mt-1">Total defined tasks</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="bg-emerald-50 text-emerald-600">Completed</Badge>
            </div>
            <div className="text-3xl font-bold">{stats.done}</div>
            <p className="text-xs text-slate-500 mt-1">Successfully finished</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                <Clock3 className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="bg-blue-50 text-blue-600">Working</Badge>
            </div>
            <div className="text-3xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-slate-500 mt-1">Currently in progress</p>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-600">
                <FileText className="w-5 h-5" />
              </div>
              <Badge variant="secondary" className="bg-amber-50 text-amber-600">Backlog</Badge>
            </div>
            <div className="text-3xl font-bold">{stats.todo}</div>
            <p className="text-xs text-slate-500 mt-1">Waiting to start</p>
          </CardContent>
        </Card>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {}
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-white/50 backdrop-blur-sm dark:bg-slate-900/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl flex items-center gap-2">
                  <Clock className="w-5 h-5 text-indigo-600" />
                  Project Timeline
                </CardTitle>
                <CardDescription>Recent task activities and assignments.</CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="h-8 text-xs">
                  <Filter className="w-3.5 h-3.5 mr-2" />
                  Filter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative space-y-8 before:absolute before:inset-0 before:ml-5 before:h-full before:w-0.5 before:bg-slate-200 dark:before:bg-slate-800">
                {tasks.length === 0 ? (
                  <div className="pl-12 py-4 text-slate-400 italic">No tasks created yet.</div>
                ) : (
                  tasks.map((task: any, index: number) => (
                    <div key={task._id} className="relative pl-12">
                      <div className={`absolute left-0 p-2 rounded-full ring-4 ring-white dark:ring-slate-900 ${task.status === 'done' ? 'bg-emerald-500 text-white' :
                        task.status === 'in_progress' ? 'bg-indigo-500 text-white' :
                          'bg-slate-300 text-slate-600'
                        }`}>
                        {task.status === 'done' ? <CheckCircle2 className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                      </div>
                      <div
                        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl border border-slate-100 bg-white dark:bg-slate-900 dark:border-slate-800 hover:shadow-md transition-all group cursor-pointer"
                        onClick={() => setSelectedTask(task)}
                      >
                        <div className="flex-1">
                          <h3 className="font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 transition-colors">{task.title}</h3>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <UserIcon className="w-3 h-3" />
                              {task.assignedTo?.name || "Unassigned"}
                            </span>
                            <span>•</span>
                            <span className="capitalize">{task.priority} Priority</span>
                            {}
                            {task.status === "done" && task.startTime && task.completionTime && (
                              <>
                                <span>•</span>
                                <span className="flex items-center gap-1 text-emerald-600 font-medium">
                                  <CheckCircle2 className="w-3 h-3" />
                                  {(() => {
                                    const ms = new Date(task.completionTime).getTime() - new Date(task.startTime).getTime();
                                    const hours = Math.floor(ms / (1000 * 60 * 60));
                                    const days = Math.floor(hours / 24);
                                    const remHours = hours % 24;
                                    if (days > 0) return `Done in ${days}d ${remHours}h`;
                                    if (hours > 0) return `Done in ${hours}h`;
                                    return `Done in ${Math.floor(ms / (1000 * 60))}m`;
                                  })()}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex -space-x-2">
                            <Button variant="ghost" size="icon" className="w-8 h-8 rounded-full bg-slate-50 hover:bg-indigo-50 hover:text-indigo-600">
                              <MessageCircle className="w-4 h-4" />
                            </Button>
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <Badge className={`capitalize text-[10px] px-2 py-0 h-5 ${statusColors[task.status]}`}>
                              {task.status.replace('_', ' ')}
                            </Badge>
                            <span className="text-[10px] text-slate-400">
                              {new Date(task.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
        {}
        <div className="space-y-6">
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader>
              <CardTitle className="text-lg">Project Manager</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50">
                <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold">
                  {project.managerId?.name?.charAt(0) || "M"}
                </div>
                <div>
                  <div className="font-bold text-sm">{project.managerId?.name}</div>
                  <div className="text-xs text-slate-500">{project.managerId?.email}</div>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-lg">Team Members</CardTitle>
              <Badge variant="outline">{project.members?.length || 0}</Badge>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[200px] pr-4">
                <div className="space-y-4">
                  {project.members?.length > 0 ? (
                    project.members.map((member: any) => (
                      <div key={member._id} className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center text-xs font-medium">
                          {member.name?.charAt(0)}
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="text-sm font-medium truncate">{member.name}</div>
                          <div className="text-[10px] text-slate-500 truncate lowercase">{member.role}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4 text-xs text-slate-400">No members added yet.</div>
                  )}
                </div>
              </ScrollArea>
              {canManageProject && (
                <Button
                  variant="outline"
                  className="w-full mt-6 text-xs h-9 border-dashed"
                  onClick={() => setIsMembersModalOpen(true)}
                >
                  <UserPlus className="w-3.5 h-3.5 mr-2" />
                  Manage Team
                </Button>
              )}
            </CardContent>
          </Card>
          <Card className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 bg-indigo-50/50 dark:bg-indigo-900/10">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 font-bold mb-2">
                <Calendar className="w-4 h-4" />
                <span>Deadlines</span>
              </div>
              <div className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Project started on {new Date(project.createdAt).toLocaleDateString()}. Average task completion time: 2.4 days.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
