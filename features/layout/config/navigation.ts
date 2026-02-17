import {
  LayoutDashboard,
  ShoppingCart,
  Package,
  User,
  Users,
  BarChart,
  Store,
  Building2,
  type LucideIcon,
} from "lucide-react";
import type { Permission } from "@/lib/rbac";

export interface NavItem {
  name: string;
  href: string;
  icon: LucideIcon;
  /**
   * Permiso requerido para mostrar este item
   */
  permission: Permission;
  /**
   * Badge opcional (número o texto)
   */
  badge?: string | number;
  /**
   * Items hijos (submenu)
   */
  children?: NavItem[];
}

/**
 * Configuración completa de navegación del dashboard
 * Los items se filtran automáticamente según los permisos del usuario
 */
export const navigationItems: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    permission: "dashboard:view",
  },
  {
    name: "Punto de Venta",
    href: "/dashboard/pos",
    icon: ShoppingCart,
    permission: "pos:use",
  },
  {
    name: "Items",
    href: "/dashboard/items",
    icon: Package,
    permission: "items:view",
  },
  {
    name: "Usuarios",
    href: "/dashboard/users",
    icon: Users,
    permission: "users:view",
  },
  {
    name: "Sucursales",
    href: "/dashboard/branches",
    icon: Building2,
    permission: "branches:view",
  },
  {
    name: "Perfil",
    href: "/dashboard/profile",
    icon: User,
    permission: "profile:view",
  },
];

/**
 * Filtra items de navegación según los permisos del usuario
 */
export function filterNavItemsByPermissions(
  items: NavItem[],
  hasPermission: (permission: Permission) => boolean
): NavItem[] {
  return items
    .filter((item) => hasPermission(item.permission))
    .map((item) => {
      if (item.children) {
        return {
          ...item,
          children: filterNavItemsByPermissions(item.children, hasPermission),
        };
      }
      return item;
    });
}
