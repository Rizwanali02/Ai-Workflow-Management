"use client";
import { useAuth } from "@/context/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Mail, Shield, User as UserIcon, Calendar } from "lucide-react";
export default function ProfilePage() {
  const { user } = useAuth();
  return (
    <div className="space-y-8 max-w-4xl">
      <div>
        <h1 className="text-3xl font-bold">Profile</h1>
        <p className="text-slate-500">View and manage your personal account information.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 h-fit">
            <CardContent className="p-6 flex flex-col items-center">
                <Avatar className="w-24 h-24 mb-4 border-4 border-indigo-100 dark:border-indigo-900/30">
                  <AvatarFallback className="bg-indigo-600 text-white text-3xl font-bold">
                    {user?.name?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-bold">{user?.name}</h3>
                <Badge className="mt-2 capitalize" variant="outline">{user?.role}</Badge>
            </CardContent>
        </Card>
        <Card className="md:col-span-2 border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle>Account Details</CardTitle>
            <CardDescription>Official information registered with the organization.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <UserIcon className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Full Name</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.name}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Mail className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Email Address</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">{user?.email}</p>
                </div>
            </div>
            <div className="flex items-center gap-4 text-slate-600 dark:text-slate-400">
                <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <Shield className="w-5 h-5" />
                </div>
                <div className="flex-1">
                    <p className="text-xs font-semibold text-slate-400">Current Role</p>
                    <p className="text-sm font-medium text-slate-900 dark:text-white capitalize">{user?.role}</p>
                </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
