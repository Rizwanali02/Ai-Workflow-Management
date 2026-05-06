import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, ShieldCheck, BriefcaseBusiness, Users } from "lucide-react";
import { getAllUsers } from "@/actions/actions";
import Link from "next/link";
import { redirect } from "next/navigation";

const ROLE_CONFIG = {
  admin: {
    label: "Admins",
    icon: ShieldCheck,
    badgeVariant: "destructive" as const,
    accent: "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/30",
    iconColor: "text-red-500",
    avatarBorder: "border-red-200 dark:border-red-800",
    avatarBg: "bg-red-600",
  },
  manager: {
    label: "Managers",
    icon: BriefcaseBusiness,
    badgeVariant: "default" as const,
    accent: "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/30",
    iconColor: "text-indigo-500",
    avatarBorder: "border-indigo-200 dark:border-indigo-800",
    avatarBg: "bg-indigo-600",
  },
  employee: {
    label: "Employees",
    icon: Users,
    badgeVariant: "outline" as const,
    accent: "bg-slate-50 border-slate-200 dark:bg-slate-900/40 dark:border-slate-800",
    iconColor: "text-slate-500",
    avatarBorder: "border-slate-200 dark:border-slate-700",
    avatarBg: "bg-slate-600",
  },
} as const;

const ROLE_ORDER = ["admin", "manager", "employee"] as const;
type Role = keyof typeof ROLE_CONFIG;

export default async function TeamPage() {
  const { success, users, error } = await getAllUsers();

  if (!success) {
    if (error === "Unauthorized") redirect("/login");
    return <div className="p-8 text-red-500">Error loading users: {error}</div>;
  }

  const grouped = ROLE_ORDER.reduce<Record<Role, any[]>>(
    (acc, role) => {
      acc[role] = (users || []).filter((u: any) => u.role === role);
      return acc;
    },
    { admin: [], manager: [], employee: [] }
  );

  const totalUsers = (users || []).length;

  return (
    <div className="space-y-10 pb-12">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Team</h1>
          <p className="text-slate-500 mt-1">
            {totalUsers} member{totalUsers !== 1 ? "s" : ""} across your organization
          </p>
        </div>
      </div>

      {/* Role Sections */}
      {ROLE_ORDER.map((role) => {
        const group = grouped[role];
        if (group.length === 0) return null;

        const config = ROLE_CONFIG[role];
        const Icon = config.icon;

        return (
          <section key={role}>
            {/* Section Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`flex items-center justify-center w-8 h-8 rounded-lg border ${config.accent}`}>
                <Icon className={`w-4 h-4 ${config.iconColor}`} />
              </div>
              <h2 className="text-lg font-semibold">{config.label}</h2>
              <span className="text-sm text-slate-400 font-medium">
                {group.length}
              </span>
              <div className="flex-1 h-px bg-slate-100 dark:bg-slate-800 ml-1" />
            </div>

            {/* Cards Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {group.map((user: any) => (
                <Link href={`/dashboard/profile/${user._id}`} key={user._id}>
                  <Card className="group border shadow-none ring-1 ring-slate-200 dark:ring-slate-800 hover:ring-slate-300 dark:hover:ring-slate-700 hover:shadow-md transition-all duration-200 cursor-pointer h-full">
                    <CardContent className="p-5 flex flex-col items-center text-center gap-3">
                      {/* Avatar */}
                      <Avatar className={`w-14 h-14 border-2 ${config.avatarBorder} mt-1`}>
                        {user.profileImg ? (
                          <AvatarImage
                            src={user.profileImg}
                            alt={user.name}
                            className="object-cover"
                          />
                        ) : (
                          <AvatarFallback className={`${config.avatarBg} text-white text-lg font-semibold`}>
                            {user.name.charAt(0).toUpperCase()}
                          </AvatarFallback>
                        )}
                      </Avatar>

                      {/* Info */}
                      <div className="space-y-1 w-full">
                        <h3 className="font-semibold text-base leading-tight group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors truncate">
                          {user.name}
                        </h3>
                        <div className="flex items-center justify-center gap-1 text-slate-400 text-xs">
                          <Mail className="w-3 h-3 shrink-0" />
                          <span className="truncate max-w-[160px]">{user.email}</span>
                        </div>
                      </div>

                      {/* Badge */}
                      <Badge
                        variant={config.badgeVariant}
                        className="capitalize text-xs mt-auto"
                      >
                        {user.role}
                      </Badge>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </section>
        );
      })}

      {totalUsers === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-slate-400 gap-3">
          <Users className="w-10 h-10 opacity-40" />
          <p className="text-sm">No users found</p>
        </div>
      )}
    </div>
  );
}