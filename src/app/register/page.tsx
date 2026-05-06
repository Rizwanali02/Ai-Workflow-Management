"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Workflow, UserPlus, Sparkles } from "lucide-react";
import { registerUser } from "@/actions/authActions";
import { useAuth } from "@/context/AuthContext";
export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "employee" as "admin" | "manager" | "employee",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await registerUser(formData);
      if (res.success && res.user) {
        toast.success("Account created successfully!");
        login(res.user as any);
        router.push("/dashboard");
        router.refresh();
      } else {
        toast.error(res.error);
      }
    } catch (error: any) {
      toast.error(error.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 dark:bg-slate-950">
      <div className="w-full max-w-md space-y-8">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-600 shadow-lg shadow-indigo-500/20">
            <Workflow className="h-7 w-7 text-white" />
          </div>
          <h2 className="mt-6 text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Workflow AI
          </h2>
          <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            Join us and supercharge your productivity
          </p>
        </div>
        <Card className="border-none shadow-xl ring-1 ring-slate-200 dark:ring-slate-800">
          <CardHeader>
            <CardTitle className="text-xl">Create Account</CardTitle>
            <CardDescription>
              Enter your details to register a new account
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleRegister}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  required
                  placeholder="Password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="bg-slate-50 dark:bg-slate-900"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <select
                  id="role"
                  className="flex h-10 w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm ring-offset-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:bg-slate-900 dark:ring-offset-slate-950 dark:focus-visible:ring-slate-300"
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value as any })}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                disabled={loading}
              >
                {loading ? "Creating account..." : "Register"}
                {!loading && <UserPlus className="ml-2 h-4 w-4" />}
              </Button>
              <div className="text-center text-sm">
                <span className="text-slate-500 dark:text-slate-400">Already have an account? </span>
                <Link
                  href="/login"
                  className="font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                >
                  Log in
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
