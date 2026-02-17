"use client";

import { useAuth } from "@/lib/auth-store";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import type { UserRole } from "@/lib/types";

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Componente que protege rutas requiriendo autenticación y rol específico
 */
export function ProtectedRoute({
  children,
  requiredRole,
  fallback = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { user, initialized, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!initialized) return;

    if (!isAuthenticated) {
      router.push("/login");
      return;
    }

    if (requiredRole && user) {
      const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
      if (!required.includes(user.role)) {
        router.push("/unauthorized");
        return;
      }
    }
  }, [initialized, isAuthenticated, user, requiredRole, router]);

  if (!initialized) return fallback;
  if (!isAuthenticated) return fallback;

  return <>{children}</>;
}
