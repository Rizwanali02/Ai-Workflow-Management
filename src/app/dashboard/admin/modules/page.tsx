"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { ShieldCheck, LayoutDashboard, Briefcase, CheckSquare, Users, Bell, User as UserIcon } from "lucide-react";
import axios from "axios";
const MODULE_ICONS: any = {
  Dashboard: LayoutDashboard,
  Projects: Briefcase,
  "My Tasks": CheckSquare,
  "Users": Users,
  Notifications: Bell,
  Profile: UserIcon,
};
export default function AdminModulesPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const availableModules = ["Dashboard", "Projects", "My Tasks", "Users", "Notifications", "Profile"];
  useEffect(() => {
    fetchModules();
  }, []);
  const fetchModules = async () => {
    try {
      const res = await axios.get("/api/admin/modules");
      if (res.data) {
        setModules(res.data);
      }
    } catch (error) {
      console.error("Error fetching modules", error);
    }
    setLoading(false);
  };
  const handleToggle = async (moduleName: string, role: string, enabled: boolean) => {
    const currentModule = modules.find((m) => m.moduleName === moduleName) || { moduleName, allowedRoles: ["admin"] };
    let newRoles = [...currentModule.allowedRoles];
    if (enabled) {
      if (!newRoles.includes(role)) newRoles.push(role);
    } else {
      newRoles = newRoles.filter((r) => r !== role);
    }
    try {
      const res = await axios.post("/api/admin/modules", { moduleName, allowedRoles: newRoles });
      if (res.data) {
        toast.success(`${moduleName} permissions updated`);
        fetchModules();
      }
    } catch (error) {
      toast.error("Failed to update");
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-indigo-600 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Module Management</h1>
          <p className="text-slate-500 text-sm">Control which roles can see specific sidebar modules.</p>
        </div>
      </div>
      <div className="grid gap-6 md:grid-cols-2">
        {availableModules.map((moduleName) => {
          const config = modules.find((m) => m.moduleName === moduleName) || { allowedRoles: ["admin"] };
          const Icon = MODULE_ICONS[moduleName];
          return (
            <Card key={moduleName} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <div className="flex items-center gap-3">
                  {Icon && <Icon className="w-5 h-5 text-indigo-500" />}
                  <CardTitle className="text-lg">{moduleName}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Manager Access</Label>
                    <p className="text-[10px] text-slate-500">Allow Managers to see this module.</p>
                  </div>
                  <Switch
                    checked={config.allowedRoles.includes("manager")}
                    onCheckedChange={(v) => handleToggle(moduleName, "manager", v)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Employee Access</Label>
                    <p className="text-[10px] text-slate-500">Allow Employees to see this module.</p>
                  </div>
                  <Switch
                    checked={config.allowedRoles.includes("employee")}
                    onCheckedChange={(v) => handleToggle(moduleName, "employee", v)}
                  />
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
