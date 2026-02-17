"use client";

import React, { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-store";
import { useSession } from "../api";

type AuthGuardProps = {
  mode: "public" | "private";
  children: React.ReactNode;
};

export default function AuthGuard({ mode, children }: Readonly<AuthGuardProps>) {
  const router = useRouter();
  const { isAuthenticated, initialized, setAuth } = useAuth();
  const sessionQuery = useSession();

  // Sincronizar con la sesión del backend
  useEffect(() => {
    if (!initialized) return;
    if (sessionQuery.isLoading) return;
    
    // Si el backend retorna sesión válida pero el estado local no tiene auth
    if (sessionQuery.data && sessionQuery.data.user && !isAuthenticated) {
      // Extraer el token y sincronizar
      const token = sessionQuery.data.id || "valid";
      setAuth(token, sessionQuery.data.user);
    }
    
    // Si el backend NO tiene sesión pero el estado local sí
    if (!sessionQuery.data && isAuthenticated) {
      setAuth(null, null);
    }
  }, [sessionQuery.data, sessionQuery.isLoading, isAuthenticated, initialized, setAuth]);

  useEffect(() => {
    if (!initialized || sessionQuery.isLoading) return;

    const hasValidSession = sessionQuery.data && sessionQuery.data.user;

    if (mode === "private" && !hasValidSession) {
      router.replace("/");
    }

    if (mode === "public" && hasValidSession) {
      router.replace("/dashboard");
    }
  }, [initialized, sessionQuery.isLoading, sessionQuery.data, mode, router]);

  // Mostrar loading mientras verifica sesión
  if (!initialized || sessionQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-400" />
      </div>
    );
  }

  const hasValidSession = sessionQuery.data && sessionQuery.data.user;
  
  if (mode === "private" && !hasValidSession) return null;
  if (mode === "public" && hasValidSession) return null;

  return <>{children}</>;
}
