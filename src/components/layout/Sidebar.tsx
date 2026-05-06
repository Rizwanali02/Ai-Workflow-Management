"use client";
import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Briefcase,
  CheckSquare,
  Users,
  Bell,
  User as UserIcon,
  LogOut,
  Workflow,
  ChevronLeft,
  ShieldCheck
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useEffect } from "react";
import axios from "axios";
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> { }
export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname() || "";
  const { user, loading, logout } = useAuth();
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [permissions, setPermissions] = React.useState<any[]>([]);
  const { logouthandler } = useAuth()

  useEffect(() => {
    const fetchPermissions = async () => {
      if (loading || !user) {
        setPermissions([]);
        return;
      }
      const res = await axios.get("/api/admin/modules");
      if (res.data) {
        setPermissions(res.data);
      }
    };
    fetchPermissions();
  }, [user, loading]);
  const hasAccess = (moduleName: string) => {
    if (user?.role === "admin") return true;
    if (moduleName === "Projects" && (user?.role === "manager" || user?.role === "employee")) return true;
    const perm = permissions.find(p => p.moduleName === moduleName);
    return perm ? perm.allowedRoles.includes(user?.role) : false;
  };
  const routes = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
      active: pathname === "/dashboard",
      show: hasAccess("Dashboard")
    },
    {
      label: "Projects",
      icon: Briefcase,
      href: "/dashboard/projects",
      active: pathname.startsWith("/dashboard/projects"),
      show: hasAccess("Projects")
    },
    {
      label: "My Tasks",
      icon: CheckSquare,
      href: "/dashboard/tasks",
      active: pathname.startsWith("/dashboard/tasks"),
      show: user?.role === "employee" && hasAccess("My Tasks")
    },
    {
      label: "Users",
      icon: Users,
      href: "/dashboard/team",
      active: pathname === "/dashboard/team",
      show: hasAccess("Users")
    },
    {
      label: "Notifications",
      icon: Bell,
      href: "/dashboard/notifications",
      active: pathname === "/dashboard/notifications",
      show: hasAccess("Notifications")
    },
    {
      label: "Profile",
      icon: UserIcon,
      href: "/dashboard/profile",
      active: pathname === "/dashboard/profile",
      show: hasAccess("Profile")
    },
    {
      label: "Module Access",
      icon: ShieldCheck,
      href: "/dashboard/admin/modules",
      active: pathname === "/dashboard/admin/modules",
      show: user?.role === "admin"
    }
  ];
  const visibleRoutes = routes.filter(route => route.show);
  return (
    <div className={cn(
      "relative flex flex-col h-full bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transition-all duration-300",
      isCollapsed ? "w-20" : "w-64",
      className
    )}>
      <div className="flex items-center h-16 px-6 border-b border-slate-200 dark:border-slate-800 shrink-0">
        <Link href="/dashboard" className="flex items-center gap-2 group">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 group-hover:bg-indigo-700 transition-colors">
            <Workflow className="w-5 h-5 text-white" />
          </div>
          {!isCollapsed && (
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white transition-opacity duration-300">
              Workflow AI
            </span>
          )}
        </Link>
      </div>
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="absolute -right-3 top-20 flex items-center justify-center w-6 h-6 rounded-full border border-slate-200 bg-white dark:bg-slate-800 dark:border-slate-700 text-slate-500 shadow-sm z-10 hover:text-indigo-600 transition-colors"
      >
        <ChevronLeft className={cn("w-4 h-4 transition-transform", isCollapsed && "rotate-180")} />
      </button>
      <div className="flex-1 overflow-y-auto py-6 px-3 space-y-1">
        {visibleRoutes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all group",
              route.active
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400"
                : "text-slate-600 hover:bg-slate-50 dark:text-slate-400 dark:hover:bg-slate-800/50"
            )}
          >
            <route.icon className={cn(
              "w-5 h-5 shrink-0",
              route.active ? "text-indigo-600 dark:text-indigo-400" : "text-slate-500 group-hover:text-slate-900 dark:group-hover:text-slate-200"
            )} />
            {!isCollapsed && <span>{route.label}</span>}
          </Link>
        ))}
      </div>
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 shrink-0">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center w-full gap-3 p-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors text-left",
              isCollapsed && "justify-center"
            )}>
              <Avatar className="w-8 h-8 border border-indigo-100 dark:border-slate-700">
                {user?.profileImg ? (
                  <AvatarImage src={user.profileImg} alt={user.name || "User"} className="object-cover" />
                ) : (
                  <AvatarFallback className="bg-indigo-600 text-white text-xs">
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                )}
              </Avatar>
              {!isCollapsed && (
                <div className="flex-1 overflow-hidden">
                  <p className="text-sm font-semibold truncate text-slate-900 dark:text-white">{user?.name}</p>
                  <p className="text-xs text-slate-500 truncate capitalize">{user?.role}</p>
                </div>
              )}
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href="/dashboard/profile" className="flex items-center cursor-pointer">
                <UserIcon className="mr-2 h-4 w-4" />
                <span>Profile</span>
              </Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => logouthandler()} className="text-red-600 cursor-pointer focus:text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              <span>Logoutt</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
