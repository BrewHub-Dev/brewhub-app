import { useMemo } from "react";
import { useAuth } from "../auth-store";
import {
  getUserDataScope,
  canAccessShop,
  canAccessBranch,
  getAccessLevel,
  applyScopeFilter,
  type DataScope,
} from "../rbac";

/**
 * Hook para obtener el scope de datos del usuario
 *
 * @example
 * const { scope, canAccessShop, filters } = useScope();
 *
 * // Filtrar queries por scope
 * const items = await fetchItems(filters);
 */
export function useScope() {
  const { user } = useAuth();

  /**
   * Scope de datos del usuario
   */
  const scope: DataScope = useMemo(() => {
    return getUserDataScope(user);
  }, [user]);

  /**
   * Nivel de acceso del usuario
   */
  const accessLevel = useMemo(() => {
    return user ? getAccessLevel(user.role) : "user";
  }, [user]);

  /**
   * Verifica si puede acceder a una tienda
   */
  const checkShopAccess = (shopId: string): boolean => {
    return canAccessShop(scope, shopId);
  };

  /**
   * Verifica si puede acceder a una sucursal
   */
  const checkBranchAccess = (branchId: string): boolean => {
    return canAccessBranch(scope, branchId);
  };

  /**
   * Aplica filtros de scope a una query
   */
  const applyFilters = (filters: Record<string, any> = {}): Record<string, any> => {
    return applyScopeFilter(scope, filters);
  };

  /**
   * Filtros base según el scope
   */
  const baseFilters = useMemo(() => {
    return applyScopeFilter(scope);
  }, [scope]);

  return {
    scope,
    accessLevel,
    canAccessShop: checkShopAccess,
    canAccessBranch: checkBranchAccess,
    applyFilters,
    filters: baseFilters,
  };
}
