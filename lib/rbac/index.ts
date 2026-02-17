/**
 * RBAC (Role-Based Access Control) para BrewHub
 * Sistema centralizado de control de acceso basado en roles
 */

export type { Permission } from "./permissions";
export {
  ROLE_PERMISSIONS,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  canAccessResource,
} from "./permissions";

export type { DataScope } from "./scope";
export {
  getUserDataScope,
  applyScopeFilter,
  canAccessShop,
  canAccessBranch,
  getAccessLevel,
} from "./scope";
