"use client";
import React, { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { logoutAction } from "@/actions/actions";
import { toast } from "sonner";
interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "manager" | "employee";
  profileImg?: string;
}
interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (userData: User) => void;
  logout: () => void;
  logouthandler: () => void;
}
const AuthContext = createContext<AuthContextType | undefined>(undefined);
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  useEffect(() => {
    const checkUser = async () => {
      try {
        const res = await axios.get("/api/auth/me");
        setUser(res.data.user);
      } catch (error) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);
  const login = (userData: User) => {
    setUser(userData);
  };
  const logout = async () => {
    try {
      await axios.post("/api/auth/logout");
    } catch (error) {
      console.error("Logout error", error);
    }
    setUser(null);
    router.push("/login");
  };
  const logouthandler = async () => {
    const { success, error } = await logoutAction();
    if (!success) {
      console.error("Logout error", error);
      return;
    } else {
      setUser(null);
      toast.success("Logout successful");
      router.push("/login");
    }
  };
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, logouthandler }}>
      {children}
    </AuthContext.Provider>
  );
}
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
