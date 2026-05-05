"use client";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import axios from "axios";
import { Sidebar } from "@/components/layout/Sidebar";
import { Search, Bell, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import NotificationCenter from "@/components/NotificationCenter";
import SocketInitializer from "@/components/SocketInitializer";
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const pathname = usePathname() || "";
  const router = useRouter();
  const [permissions, setPermissions] = useState<any[]>([]);
  const [permsLoading, setPermsLoading] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [loading, user, router]);

  useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const res = await axios.get("/api/admin/modules");
        if (res.data) {
          setPermissions(res.data);
        }
      } catch (error) {
        console.error("Error fetching permissions", error);
      } finally {
        setPermsLoading(false);
      }
    };
    if (!loading && user) {
      fetchPermissions();
    }
  }, [user, loading]);
  if (loading || (user && permsLoading)) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 animate-pulse text-indigo-500">Loading module permissions...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  const getModuleName = (path: string) => {
    if (path === "/dashboard/admin/modules") return "Module Access";
    if (path.startsWith("/dashboard/team")) return "Users";
    if (path.startsWith("/dashboard/notifications")) return "Notifications";
    if (path.startsWith("/dashboard/profile")) return "Profile";
    if (path.startsWith("/dashboard/projects")) return "Projects";
    if (path.startsWith("/dashboard/tasks")) return "My Tasks";
    if (path === "/dashboard") return "Dashboard";
    return null;
  };

  const moduleName = getModuleName(pathname);
  let hasAccess = false;

  if (user?.role === "admin") {
    hasAccess = true;
  } else if (moduleName === "Module Access") {
    hasAccess = false;
  } else if (moduleName === "Projects" && (user?.role === "manager" || user?.role === "employee")) {
    hasAccess = true;
  } else if (moduleName) {
    const perm = permissions.find((p) => p.moduleName === moduleName);
    hasAccess = perm ? perm.allowedRoles.includes(user?.role) : false;
  } else {
    hasAccess = true; // allow unknown routes
  }
  return (
    <div className="flex h-screen w-full bg-slate-50 dark:bg-slate-950 overflow-hidden">
      { }
      <SocketInitializer />
      { }
      <Sidebar />
      { }
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        { }
        <header className="h-16 flex items-center justify-between px-8 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 shrink-0">
          <div></div>
          {/* <div className="flex-1 max-w-md hidden md:block">
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
              <Input
                placeholder="Search anything..."
                className="pl-10 bg-slate-50 border-none focus-visible:ring-1 focus-visible:ring-indigo-500 transition-all dark:bg-slate-800"
              />
            </div>
          </div> */}
          <div className="flex items-center gap-4">
            <NotificationCenter />
          </div>
        </header>
        { }
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            {hasAccess ? children : (
              <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mb-6">
                  <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Access Denied</h1>
                <p className="text-slate-500 max-w-md">
                  You don't have permission to view the <span className="font-semibold">{moduleName}</span> module.
                </p>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
