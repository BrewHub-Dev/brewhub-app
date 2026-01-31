"use client";

import React, { createContext, useContext, useEffect, useState } from "react";

type User = Record<string, any> | null;

type AuthState = {
  user: User;
  token: string | null;
  setAuth: (token: string | null, user?: User) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthState | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(() => {
    try {
      return typeof window !== "undefined" ? localStorage.getItem("bh_token") : null;
    } catch {
      return null;
    }
  });
  const [user, setUser] = useState<User>(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem("bh_user") : null;
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    try {
      if (token) localStorage.setItem("bh_token", token);
      else localStorage.removeItem("bh_token");
    } catch {}
  }, [token]);

  useEffect(() => {
    try {
      if (user) localStorage.setItem("bh_user", JSON.stringify(user));
      else localStorage.removeItem("bh_user");
    } catch {}
  }, [user]);

  const setAuth = (newToken: string | null, newUser?: User) => {
    setToken(newToken);
    setUser(newUser ?? null);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setAuth, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
