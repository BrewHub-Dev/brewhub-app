import type { UserRole } from "./types";
import { canAccessResource } from "./rbac";

/**
 * @deprecated Usar nuevo sistema RBAC en lib/rbac
 * Sistema legacy de permisos mantenido por compatibilidad
 */
export const ROLE_PERMISSIONS: Record<UserRole, string[]> = {
  ADMIN: ["users", "shops", "branches", "sessions", "analytics"],
  SHOP_ADMIN: ["users", "branches", "analytics"],
  BRANCH_ADMIN: ["users", "pos"],
  CLIENT: ["profile", "orders"],
};

export function canAccess(role: UserRole, resource: string): boolean {
  return canAccessResource(role, resource);
}

export function hasRole(role: UserRole | undefined, requiredRole: UserRole | UserRole[]): boolean {
  if (!role) return false;
  const required = Array.isArray(requiredRole) ? requiredRole : [requiredRole];
  return required.includes(role);
}
