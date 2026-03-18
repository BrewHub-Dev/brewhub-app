import { useCallback, useMemo } from "react";
import { useAuth } from "../auth-store";
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getRolePermissions,
  type Permission,
} from "../rbac";

export function usePermissions() {
  const { user } = useAuth();

  const can = useCallback(
    (permission: Permission): boolean => {
      if (!user) return false;
      return hasPermission(user.role, permission);
    },
    [user]
  );

  const canAny = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return hasAnyPermission(user.role, permissions);
    },
    [user]
  );

  /**
   * Verifica si el usuario tiene todos los permisos
   */
  const canAll = useCallback(
    (permissions: Permission[]): boolean => {
      if (!user) return false;
      return hasAllPermissions(user.role, permissions);
    },
    [user]
  );

  /**
   * Obtiene todos los permisos del usuario
   */
  const permissions = useMemo(() => {
    if (!user) return [];
    return getRolePermissions(user.role);
  }, [user]);

  /**
   * Verifica si el usuario es admin
   */
  const isAdmin = useMemo(() => {
    return user?.role === "ADMIN";
  }, [user]);

  /**
   * Verifica si el usuario es administrador de tienda
   */
  const isShopAdmin = useMemo(() => {
    return user?.role === "SHOP_ADMIN";
  }, [user]);

  /**
   * Verifica si el usuario es administrador de sucursal
   */
  const isBranchAdmin = useMemo(() => {
    return user?.role === "BRANCH_ADMIN";
  }, [user]);

  /**
   * Verifica si el usuario es cliente
   */
  const isClient = useMemo(() => {
    return user?.role === "CLIENT";
  }, [user]);

  return {
    can,
    canAny,
    canAll,
    permissions,
    isAdmin,
    isShopAdmin,
    isBranchAdmin,
    isClient,
  };
}
