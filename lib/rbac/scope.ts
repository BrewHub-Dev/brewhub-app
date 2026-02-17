import type { User, UserRole } from "../types";

/**
 * Scope de datos según el rol del usuario
 * Define qué datos puede ver cada rol
 */
export interface DataScope {
  // IDs de tiendas accesibles (undefined = todas)
  shopIds?: string[];
  // IDs de sucursales accesibles (undefined = todas de su scope)
  branchIds?: string[];
  // Puede ver datos de todas las tiendas
  canViewAllShops: boolean;
  // Puede ver datos de toda su tienda
  canViewShop: boolean;
  // Solo puede ver su sucursal
  onlyOwnBranch: boolean;
}

/**
 * Obtiene el scope de datos para un usuario
 */
export function getUserDataScope(user: User | null): DataScope {
  if (!user) {
    return {
      canViewAllShops: false,
      canViewShop: false,
      onlyOwnBranch: false,
    };
  }

  switch (user.role) {
    case "ADMIN":
      return {
        canViewAllShops: true,
        canViewShop: true,
        onlyOwnBranch: false,
      };

    case "SHOP_ADMIN":
      return {
        shopIds: user.ShopId ? [user.ShopId] : undefined,
        canViewAllShops: false,
        canViewShop: true,
        onlyOwnBranch: false,
      };

    case "BRANCH_ADMIN":
      return {
        shopIds: user.ShopId ? [user.ShopId] : undefined,
        branchIds: user.BranchId ? [user.BranchId] : undefined,
        canViewAllShops: false,
        canViewShop: false,
        onlyOwnBranch: true,
      };

    case "CLIENT":
      return {
        canViewAllShops: false,
        canViewShop: false,
        onlyOwnBranch: false,
      };

    default:
      return {
        canViewAllShops: false,
        canViewShop: false,
        onlyOwnBranch: false,
      };
  }
}

/**
 * Filtra query params según el scope del usuario
 * Útil para APIs
 */
export function applyScopeFilter(
  scope: DataScope,
  filters: Record<string, any> = {}
): Record<string, any> {
  const scopedFilters = { ...filters };

  // Si tiene scope de tienda, filtrar por ShopId
  if (scope.shopIds && scope.shopIds.length > 0) {
    scopedFilters.ShopId = scope.shopIds.length === 1
      ? scope.shopIds[0]
      : { $in: scope.shopIds };
  }

  // Si tiene scope de sucursal, filtrar por BranchId
  if (scope.branchIds && scope.branchIds.length > 0) {
    scopedFilters.BranchId = scope.branchIds.length === 1
      ? scope.branchIds[0]
      : { $in: scope.branchIds };
  }

  return scopedFilters;
}

/**
 * Verifica si el usuario puede acceder a una tienda específica
 */
export function canAccessShop(scope: DataScope, shopId: string): boolean {
  if (scope.canViewAllShops) return true;
  if (!scope.shopIds) return false;
  return scope.shopIds.includes(shopId);
}

/**
 * Verifica si el usuario puede acceder a una sucursal específica
 */
export function canAccessBranch(scope: DataScope, branchId: string): boolean {
  if (scope.canViewAllShops) return true;
  if (!scope.branchIds) return scope.canViewShop; // Shop admin puede ver todas sus sucursales
  return scope.branchIds.includes(branchId);
}

/**
 * Obtiene el nivel de acceso del usuario
 */
export function getAccessLevel(role: UserRole): "global" | "shop" | "branch" | "user" {
  switch (role) {
    case "ADMIN":
      return "global";
    case "SHOP_ADMIN":
      return "shop";
    case "BRANCH_ADMIN":
      return "branch";
    case "CLIENT":
      return "user";
    default:
      return "user";
  }
}
