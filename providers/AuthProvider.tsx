"use client";

import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { App } from "antd";
import { ROLE_DASHBOARD_ROUTES } from "@/config/routes";
import { UserRole } from "@/types/global";

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { message } = App.useApp();

  useEffect(() => {
    checkAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAuth = async () => {
    try {
      // 1. Try the access token first
      const meRes = await fetch("/api/auth/me", { credentials: "include" });
      if (meRes.ok) {
        const data: ApiResponse<AuthUser> = await meRes.json();
        if (data.success) {
          setUser(data.data);
          return;
        }
      }

      // 2. Access token expired or invalid — attempt silent refresh
      if (meRes.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
        });
        if (refreshRes.ok) {
          const refreshData: ApiResponse<{ user: AuthUser }> = await refreshRes.json();
          if (refreshData.success) {
            setUser(refreshData.data.user);
            return;
          }
        }
      }

      setUser(null);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (
    email: string,
    password: string,
    rememberMe?: boolean,
    redirectTo?: string,
  ) => {
    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password, rememberMe: rememberMe ?? false }),
      credentials: "include",
    });

    const data: ApiResponse<{ user: AuthUser }> = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(!data.success ? data.error : "Login failed");
    }

    setUser(data.data.user);
    message.success("Welcome back!");
    // Redirect to the `from` param if provided, otherwise fall back to role dashboard
    const destination = redirectTo ?? ROLE_DASHBOARD_ROUTES[data.data.user.role];
    router.push(destination);
  };

  const logout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST", credentials: "include" });
    } catch {
      // swallow — still clear state
    } finally {
      setUser(null);
      message.success("Logged out successfully.");
      router.push("/login");
    }
  };

  const refreshToken = async () => {
    await checkAuth();
  };

  const value: AuthContextValue = { user, isLoading, login, logout, refreshToken };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}

/** Convenience: return current user's role or undefined */
export function useCurrentRole(): UserRole | undefined {
  const { user } = useAuth();
  return user?.role;
}

/** Returns true if user has at least one of the given roles */
export function useHasRole(roles: UserRole | UserRole[]): boolean {
  const { user } = useAuth();
  if (!user) return false;
  const allowed = Array.isArray(roles) ? roles : [roles];
  return allowed.includes(user.role);
}
