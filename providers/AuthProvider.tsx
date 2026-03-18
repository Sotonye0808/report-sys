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

    // Re-validate auth when coming back online
    const handleOnline = () => checkAuth();
    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persistUser = (u: AuthUser | null) => {
    setUser(u);
    try {
      if (u) {
        localStorage.setItem("hrs:auth-user", JSON.stringify(u));
      } else {
        localStorage.removeItem("hrs:auth-user");
      }
    } catch {
      /* localStorage unavailable */
    }
  };

  const checkAuth = async () => {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 4000);

    try {
      // 1. Try the access token first
      const meRes = await fetch("/api/auth/me", {
        credentials: "include",
        signal: controller.signal,
      });
      if (meRes.ok) {
        const data: ApiResponse<AuthUser> = await meRes.json();
        if (data.success) {
          persistUser(data.data);
          return;
        }
      }

      // 2. Access token expired or invalid — attempt silent refresh
      if (meRes.status === 401) {
        const refreshRes = await fetch("/api/auth/refresh", {
          method: "POST",
          credentials: "include",
          signal: controller.signal,
        });
        if (refreshRes.ok) {
          const refreshData: ApiResponse<{ user: AuthUser }> = await refreshRes.json();
          if (refreshData.success) {
            persistUser(refreshData.data.user);
            return;
          }
        }
      }

      persistUser(null);
    } catch {
      // Network failure / offline — fall back to cached user for offline resilience
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        try {
          const cached = localStorage.getItem("hrs:auth-user");
          if (cached) {
            setUser(JSON.parse(cached) as AuthUser);
            return;
          }
        } catch {
          /* localStorage unavailable */
        }
      }
      setUser(null);
    } finally {
      window.clearTimeout(timeoutId);
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

    persistUser(data.data.user);
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
      persistUser(null);
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
