"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Briefcase, 
  Users, 
  Calendar,
  ExternalLink,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import CreateProjectModal from "@/components/CreateProjectModal";
import axios from "axios";
export default function ProjectsPage() {
  const { user } = useAuth();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fetchProjects = async () => {
    setLoading(true);
    try {
      const res = await axios.get("/api/projects");
      if (res.data) {
        setProjects(res.data);
      }
    } catch (error) {
      console.error("Error fetching projects", error);
    }
    setLoading(false);
  };
  useEffect(() => {
    fetchProjects();
  }, []);
  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Projects</h1>
          <p className="text-slate-500">Overview of all active and past projects.</p>
        </div>
        {(user?.role === "admin") && (
          <Button 
            className="bg-indigo-600 hover:bg-indigo-700"
            onClick={() => setIsModalOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        )}
      </div>
      <CreateProjectModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSuccess={fetchProjects}
      />
      {loading ? (
        <div className="flex justify-center py-20">
          <Loader2 className="w-10 h-10 animate-spin text-indigo-500" />
        </div>
      ) : projects.length === 0 ? (
        <Card className="border-dashed border-2 py-20 text-center">
            <div className="flex flex-col items-center gap-2 text-slate-400">
                <Briefcase className="w-12 h-12 opacity-20" />
                <p>No projects found. Create your first project to get started.</p>
            </div>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {projects.map((project) => (
            <Card key={project._id} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:shadow-md transition-shadow group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400">
                      Active
                    </Badge>
                    <Link href={`/dashboard/projects/${project._id}`} className="text-slate-400 hover:text-indigo-600">
                      <ExternalLink className="w-4 h-4" />
                    </Link>
                </div>
                <CardTitle className="text-xl mt-4 group-hover:text-indigo-600 transition-colors">
                  {project.name}
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {project.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-4 mt-auto">
                <div className="flex items-center justify-between text-xs text-slate-500 border-t border-slate-100 dark:border-slate-800 pt-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5" />
                      {project.members?.length || 0} Members
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(project.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <div className="font-medium text-slate-900 dark:text-slate-200">
                    Manager: {project.managerId?.name || 'Unassigned'}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
