"use client";

import { useAuth } from "@/lib/auth-store";
import type { UserRole } from "@/lib/types";
import { hasRole } from "@/lib/permissions";

interface RoleGuardProps {
  children: React.ReactNode;
  roles: UserRole | UserRole[];
  fallback?: React.ReactNode;
}

/**
 * Renderiza contenido solo si el usuario tiene el rol requerido
 */
export function RoleGuard({ children, roles, fallback = null }: RoleGuardProps) {
  const { user } = useAuth();

  if (!user || !hasRole(user.role, roles)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
