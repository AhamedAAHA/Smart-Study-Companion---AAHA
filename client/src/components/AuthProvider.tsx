"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import { User } from "@/types";
import { api } from "@/lib/api";
import {
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from "@/lib/auth";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  university?: string;
  course?: string;
  preferredLanguage?: string;
  role?: string;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const refreshUser = useCallback(async () => {
    const token = getToken();
    if (!token) {
      setUser(null);
      return;
    }
    try {
      const res = await api<{ success: boolean; data: User }>("/auth/me");
      setUser(res.data);
    } catch {
      clearSession();
      setUser(null);
    }
  }, []);

  useEffect(() => {
    const stored = getStoredUser();
    if (stored) setUser(stored);
    refreshUser().finally(() => setLoading(false));
  }, [refreshUser]);

  const login = async (email: string, password: string) => {
    const res = await api<{
      success: boolean;
      data: { token: string; user: User };
    }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    saveSession(res.data.token, res.data.user);
    setUser(res.data.user);
    redirectByRole(res.data.user.role);
  };

  const register = async (data: RegisterData) => {
    const res = await api<{
      success: boolean;
      data: { token: string; user: User };
    }>("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    });
    saveSession(res.data.token, res.data.user);
    setUser(res.data.user);
    redirectByRole(res.data.user.role);
  };

  const redirectByRole = (role: string) => {
    if (role === "admin") router.push("/admin");
    else if (role === "lecturer") router.push("/lecturer");
    else router.push("/dashboard");
  };

  const logout = () => {
    clearSession();
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
