"use client";

import { createContext, useCallback, useEffect, useMemo, useState } from "react";
import { apiRequest } from "@/services/http";
import type { AppRole, UserDto } from "@/types";

type AuthContextValue = {
  user: UserDto | null;
  loading: boolean;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
  isAdmin: boolean;
  isMedico: boolean;
  isCliente: boolean;
};

export const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    const res = await apiRequest<{ user: UserDto }>("/api/auth/me", { method: "GET" });
    setUser(res.success && res.data ? res.data.user : null);
  }, []);

  const logout = useCallback(async () => {
    await apiRequest("/api/auth/logout", { method: "POST" });
    setUser(null);
    window.location.href = "/login";
  }, []);

  useEffect(() => {
    const run = async () => {
      try {
        await refreshUser();
      } finally {
        setLoading(false);
      }
    };
    void run();
  }, [refreshUser]);

  const role = user?.role as AppRole | undefined;
  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      loading,
      refreshUser,
      logout,
      isAdmin: role === "ADMIN",
      isMedico: role === "MEDICO",
      isCliente: role === "CLIENTE",
    }),
    [user, loading, refreshUser, logout, role]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

