"use client";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users, Mail, ShieldAlert } from "lucide-react";
import axios from "axios";
export default function TeamPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await axios.get("/api/users");
        if (res.data) {
          setUsers(res.data);
        }
      } catch (error) {
        console.error("Error fetching users", error);
      }
      setLoading(false);
    };
    fetchUsers();
  }, []);
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Users</h1>
        <p className="text-slate-500">Manage and view all members in your organization.</p>
      </div>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {users.map((user) => (
          <Card key={user._id} className="border-none shadow-sm ring-1 ring-slate-200 dark:ring-slate-800 hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center">
                <Avatar className="w-16 h-16 mb-4 border-2 border-indigo-100">
                  <AvatarFallback className="bg-indigo-600 text-white text-xl">
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-bold text-lg">{user.name}</h3>
                <div className="flex items-center gap-1.5 text-slate-500 text-sm mt-1">
                  <Mail className="w-3 h-3" />
                  {user.email}
                </div>
                <div className="mt-4">
                  <Badge variant={user.role === 'admin' ? 'destructive' : user.role === 'manager' ? 'default' : 'outline'} className="capitalize">
                    {user.role}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
