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

/**
 * Guard que renderiza contenido solo si el usuario tiene los permisos requeridos
 *
 * @example
 * // Permiso simple
 * <PermissionGuard permission="items:delete">
 *   <button>Eliminar</button>
 * </PermissionGuard>
 *
 * @example
 * // Múltiples permisos (any)
 * <PermissionGuard permissions={["items:edit", "items:delete"]} mode="any">
 *   <ItemActions />
 * </PermissionGuard>
 *
 * @example
 * // Múltiples permisos (all)
 * <PermissionGuard permissions={["users:view", "users:edit"]} mode="all">
 *   <UserManagement />
 * </PermissionGuard>
 */
export function PermissionGuard({
  children,
  permission,
  permissions,
  mode = "any",
  fallback = null,
  onUnauthorized,
}: PermissionGuardProps) {
  const { can, canAny, canAll } = usePermissions();

  // Validación: debe proporcionar permission o permissions
  if (!permission && !permissions) {
    console.error("PermissionGuard: debe proporcionar 'permission' o 'permissions'");
    return <>{fallback}</>;
  }

  let hasAccess = false;

  // Modo single permission
  if (permission) {
    hasAccess = can(permission);
  }
  // Modo multiple permissions
  else if (permissions) {
    hasAccess = mode === "all" ? canAll(permissions) : canAny(permissions);
  }

  if (!hasAccess) {
    onUnauthorized?.();
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
