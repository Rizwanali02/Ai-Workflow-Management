"use client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskSchema } from "@/lib/validations";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Loader2, Users, Sparkles } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axios from "axios";
interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  defaultProjectId?: string;
}
export default function CreateTaskModal({
  isOpen,
  onClose,
  onSuccess,
  defaultProjectId,
}: CreateTaskModalProps) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(defaultProjectId || "");
  const {
    register,
    handleSubmit,
    setValue,
    getValues,
    watch,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: "",
      description: "",
      priority: "medium",
      type: "task",
      projectId: defaultProjectId || "",
      assignedTo: "",
      deadline: "",
    },
  });
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await axios.get("/api/projects");
        if (res.data) {
          setProjects(res.data);
        }
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    };
    if (isOpen) {
      fetchProjects();
      if (defaultProjectId) {
        loadProjectMembers(defaultProjectId);
      }
    }
  }, [isOpen, defaultProjectId]);
  const loadProjectMembers = async (projectId: string) => {
    if (!projectId) {
      setEmployees([]);
      return;
    }
    setLoadingMembers(true);
    try {
      const res = await axios.get(`/api/projects/${projectId}`);
      if (res.data) {
        const members = res.data.project?.members || [];
        setEmployees(members.filter((m: any) => m.role === "employee" || m.role === "manager"));
      }
    } catch (error) {
      try {
        const usersRes = await axios.get("/api/users");
        if (usersRes.data) {
          setEmployees(usersRes.data.filter((u: any) => u.role === "employee"));
        }
      } catch (usersError) {
        console.error("Error fetching users:", usersError);
      }
      console.error("Error fetching project members:", error);
    } finally {
      setLoadingMembers(false);
    }
  };
  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
    setValue("projectId", value);
    setValue("assignedTo", ""); 
    loadProjectMembers(value);
  };
  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const res = await axios.post("/api/tasks", data);
      if (res.data) {
        toast.success("Task created and assigned successfully");
        reset();
        setEmployees([]);
        setSelectedProjectId(defaultProjectId || "");
        onSuccess();
        onClose();
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to create task");
    } finally {
      setLoading(false);
    }
  };
  const [isRefining, setIsRefining] = useState(false);
  const handleRefineDescription = async () => {
    const title = getValues("title");
    const description = getValues("description");
    if (!description && !title) {
      toast.error("Please enter a title or rough notes first");
      return;
    }
    setIsRefining(true);
    setValue("description", "");
    try {
      const res = await axios.post("/api/ai/refine", { title, description });
      if (res.data?.text) {
        setValue("description", res.data.text, { shouldValidate: true, shouldDirty: true });
      }
    } catch (error) {
      toast.error("Error refining description");
      setValue("description", description);
    } finally {
      setIsRefining(false);
    }
  };
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Create New Task</DialogTitle>
          <DialogDescription>
            Assign a new task to a team member within a project.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2 col-span-2">
              <Label htmlFor="title">Task Title</Label>
              <Input
                id="title"
                placeholder="What needs to be done?"
                {...register("title")}
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message as string}</p>
              )}
            </div>
            <div className="space-y-2 col-span-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="description">Description (Optional)</Label>
                <Button 
                  type="button" 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleRefineDescription}
                  disabled={isRefining}
                  className="h-6 px-2 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50"
                >
                  {isRefining ? (
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                  ) : (
                    <Sparkles className="w-3 h-3 mr-1" />
                  )}
                  AI Refine
                </Button>
              </div>
              <Textarea
                id="description"
                placeholder="Provide more context..."
                {...register("description")}
                className="min-h-[100px]"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectId">Project</Label>
              {defaultProjectId ? (
                <div className="flex items-center h-10 px-3 rounded-md border border-slate-200 bg-slate-50 text-sm text-slate-600">
                  {projects.find(p => p._id === defaultProjectId)?.name || "Loading..."}
                </div>
              ) : (
                <Select
                  value={selectedProjectId}
                  onValueChange={handleProjectChange}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select project" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects.map((project) => (
                      <SelectItem key={project._id} value={project._id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {errors.projectId && (
                <p className="text-sm text-red-500">{errors.projectId.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="assignedTo">
                Assign To
                {selectedProjectId && (
                  <span className="ml-2 text-[10px] text-indigo-500 font-normal flex items-center gap-1 inline-flex">
                    <Users className="w-3 h-3" /> Project members only
                  </span>
                )}
              </Label>
              <Select
                value={watch("assignedTo") || ""}
                onValueChange={(value) => setValue("assignedTo", value, { shouldValidate: true })}
                disabled={!selectedProjectId || loadingMembers}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      !selectedProjectId
                        ? "Select a project first"
                        : loadingMembers
                        ? "Loading members..."
                        : employees.length === 0
                        ? "No members in project"
                        : "Select team member"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee._id} value={employee._id}>
                      <div className="flex flex-col">
                        <span>{employee.name}</span>
                        <span className="text-[10px] text-slate-400 capitalize">{employee.role}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.assignedTo && (
                <p className="text-sm text-red-500">{errors.assignedTo.message as string}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select defaultValue="medium" value={watch("priority") || "medium"} onValueChange={(value: any) => setValue("priority", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Task Type</Label>
              <Select defaultValue="task" value={watch("type") || "task"} onValueChange={(value: any) => setValue("type", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="deadline">Deadline (Optional)</Label>
              <Input
                id="deadline"
                type="date"
                {...register("deadline")}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-700"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Create & Assign Task
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
