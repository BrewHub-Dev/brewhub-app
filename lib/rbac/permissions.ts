import type { UserRole } from "../types";

/**
 * Permisos granulares del sistema BrewHub
 * Formato: "recurso:acción"
 */
export type Permission =
  // Dashboard
  | "dashboard:view"
  | "dashboard:view_all_shops"
  | "dashboard:view_shop"
  | "dashboard:view_branch"

  // Punto de Venta
  | "pos:use"
  | "pos:refund"
  | "pos:cancel_order"
  | "pos:apply_discount"

  // Items/Productos
  | "items:view"
  | "items:create"
  | "items:edit"
  | "items:delete"
  | "items:manage_inventory"

  // Usuarios
  | "users:view"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "users:assign_roles"

  // Sucursales
  | "branches:view"
  | "branches:create"
  | "branches:edit"
  | "branches:delete"

  // Tiendas
  | "shops:view"
  | "shops:create"
  | "shops:edit"
  | "shops:delete"

  // Analíticas
  | "analytics:view"
  | "analytics:export"
  | "analytics:view_all_shops"
  | "analytics:view_shop"

  // Órdenes
  | "orders:view"
  | "orders:view_all"
  | "orders:create"
  | "orders:cancel"

  |"categories:view"
  |"categories:create"
  |"categories:edit"
  |"categories:delete"

  // Perfil
  | "profile:view"
  | "profile:edit";

/**
 * Configuración de permisos por rol
 */
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  /**
   * ADMIN - Acceso completo al sistema
   */
  ADMIN: [
    // Dashboard
    "dashboard:view",
    "dashboard:view_all_shops",
    "dashboard:view_shop",
    "dashboard:view_branch",

    // POS
    "pos:use",
    "pos:refund",
    "pos:cancel_order",
    "pos:apply_discount",

    // Items
    "items:view",
    "items:create",
    "items:edit",
    "items:delete",
    "items:manage_inventory",

    // Usuarios
    "users:view",
    "users:create",
    "users:edit",
    "users:delete",
    "users:assign_roles",

    // Sucursales
    "branches:view",
    "branches:create",
    "branches:edit",
    "branches:delete",

    // Tiendas
    "shops:view",
    "shops:create",
    "shops:edit",
    "shops:delete",

    // Analíticas
    "analytics:view",
    "analytics:export",
    "analytics:view_all_shops",
    "analytics:view_shop",

    // Órdenes
    "orders:view",
    "orders:view_all",
    "orders:create",
    "orders:cancel",

    // Perfil
    "profile:view",
    "profile:edit",
  ],

  /**
   * SHOP_ADMIN - Administrador de tienda
   * Puede gestionar todas las sucursales de su tienda
   */
  SHOP_ADMIN: [
    // Dashboard
    "dashboard:view",
    "dashboard:view_shop",
    "dashboard:view_branch",

    // POS
    "pos:use",
    "pos:refund",
    "pos:cancel_order",
    "pos:apply_discount",

    // Items
    "items:view",
    "items:create",
    "items:edit",
    "items:delete",
    "items:manage_inventory",

    // Usuarios
    "users:view",
    "users:create",
    "users:edit",

    // Sucursales
    "branches:view",
    "branches:create",
    "branches:edit",
    "branches:delete",

    // Tiendas
    "shops:view",
    "shops:edit",

    // Analíticas
    "analytics:view",
    "analytics:export",
    "analytics:view_shop",

    // Órdenes
    "orders:view",
    "orders:create",
    "orders:cancel",

    // Perfil
    "profile:view",
    "profile:edit",

    // Categorías
    "categories:view",
    "categories:create",
    "categories:edit",
    "categories:delete",
  ],

  /**
   * BRANCH_ADMIN - Administrador de sucursal
   * Solo puede gestionar su sucursal específica
   */
  BRANCH_ADMIN: [
    // Dashboard
    "dashboard:view",
    "dashboard:view_branch",

    // POS
    "pos:use",
    "pos:refund",
    "pos:apply_discount",

    // Items
    "items:view",
    "items:edit",
    "items:manage_inventory",

    // Usuarios
    "users:view",

    // Analíticas
    "analytics:view",

    // Órdenes
    "orders:view",
    "orders:create",

    // Perfil
    "profile:view",
    "profile:edit",
  ],

  /**
   * CLIENT - Cliente final
   * Solo puede ver su información y realizar pedidos
   */
  CLIENT: [
    // Dashboard limitado
    "dashboard:view",

    // Órdenes propias
    "orders:view",
    "orders:create",

    // Perfil
    "profile:view",
    "profile:edit",
  ],
};

/**
 * Verifica si un rol tiene un permiso específico
 */
export function hasPermission(role: UserRole, permission: Permission): boolean {
  const permissions = ROLE_PERMISSIONS[role];
  return permissions?.includes(permission) ?? false;
}

/**
 * Verifica si un rol tiene al menos uno de los permisos especificados
 */
export function hasAnyPermission(role: UserRole, permissions: Permission[]): boolean {
  return permissions.some((permission) => hasPermission(role, permission));
}

/**
 * Verifica si un rol tiene todos los permisos especificados
 */
export function hasAllPermissions(role: UserRole, permissions: Permission[]): boolean {
  return permissions.every((permission) => hasPermission(role, permission));
}

/**
 * Obtiene todos los permisos de un rol
 */
export function getRolePermissions(role: UserRole): Permission[] {
  return ROLE_PERMISSIONS[role] ?? [];
}

/**
 * Verifica si un usuario puede acceder a un recurso (backward compatibility)
 */
export function canAccessResource(role: UserRole, resource: string): boolean {
  // Mapeo de recursos legacy a nuevos permisos
  const resourcePermissionMap: Record<string, Permission[]> = {
    users: ["users:view"],
    shops: ["shops:view"],
    branches: ["branches:view"],
    sessions: ["dashboard:view"],
    analytics: ["analytics:view"],
    pos: ["pos:use"],
    profile: ["profile:view"],
    orders: ["orders:view"],
  };

  const permissions = resourcePermissionMap[resource];
  if (!permissions) return false;

  return hasAnyPermission(role, permissions);
}
