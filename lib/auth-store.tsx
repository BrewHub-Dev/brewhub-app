"use client";

import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from "react";
import { login as authServiceLogin, logout as authServiceLogout } from "./auth-service";
import type { User, LoginRequest } from "./types";

type AuthState = {
  user: User | null;
  token: string | null;
  initialized: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  setAuth: (token: string | null, user: any) => void;
  isLoading: boolean;
  error: string | null;
  isAuthenticated: boolean;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: React.ReactNode }>) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Carga usuario y token inicial desde localStorage
  useEffect(() => {
    try {
      if (globalThis.window === undefined) return;
      const rawUser = localStorage.getItem("bh_user");
      const rawToken = localStorage.getItem("bh_token");
      if (rawUser) setUser(JSON.parse(rawUser));
      if (rawToken) setToken(rawToken);
      // Si hay user pero no token, asumimos auth cookie-based.
      if (rawUser && !rawToken) setToken("session");
    } catch {}
    finally {
      setInitialized(true);
    }
  }, []);

  useEffect(() => {
    try {
      if (globalThis.window === undefined) return;
      if (user) localStorage.setItem("bh_user", JSON.stringify(user));
      else localStorage.removeItem("bh_user");
      if (token) localStorage.setItem("bh_token", token);
      else localStorage.removeItem("bh_token");
    } catch {}
  }, [user, token]);

  const login = useCallback(async (credentials: LoginRequest) => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authServiceLogin(credentials);
      setUser(response.user);
      // El token real vive en cookie httpOnly; usamos un placeholder para estado local.
      setToken("session");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Login failed";
      setError(message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    setIsLoading(true);
    try {
      await authServiceLogout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      setIsLoading(false);
    }
    setToken(null);
    setUser(null);
    setError(null);
  }, []);

  const setAuth = useCallback((newToken: string | null, userData: any) => {
    if (userData) {
      setUser(userData as User);
      setToken(newToken ?? "session");
      setError(null);
      return;
    }
    setToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      initialized,
      login,
      logout,
      setAuth,
      isLoading,
      error,
      // Auth es cookie-based; si hay user, consideramos autenticado.
      isAuthenticated: !!user,
    }),
    [user, token, initialized, login, logout, setAuth, isLoading, error]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
