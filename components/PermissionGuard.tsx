"use client";

import { usePermissions } from "@/lib/hooks/usePermissions";
import type { Permission } from "@/lib/rbac";

interface PermissionGuardProps {
  children: React.ReactNode;
  /**
   * Permiso requerido (modo single)
   */
  permission?: Permission;
  /**
   * Lista de permisos (modo any/all)
   */
  permissions?: Permission[];
  /**
   * Modo de verificación cuando se usa permissions[]
   * - "any": requiere al menos uno de los permisos
   * - "all": requiere todos los permisos
   */
  mode?: "any" | "all";
  /**
   * Contenido a mostrar cuando no tiene permisos
   */
  fallback?: React.ReactNode;
  /**
   * Callback cuando no tiene permisos
   */
  onUnauthorized?: () => void;
}

export function PermissionGuard({
  children,
  permission,
  permissions,
  mode = "any",
  fallback = null,
  onUnauthorized,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  if (!permission && !permissions) {
    console.error("PermissionGuard: debe proporcionar 'permission' o 'permissions'");
    return <>{fallback}</>;
  }

  let hasAccess = false;

  if (permission) {
    hasAccess = can(permission);
  }
  else if (permissions) {
    hasAccess = mode === "all" ? canAll(permissions) : canAny(permissions);
  }

  if (!hasAccess) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
