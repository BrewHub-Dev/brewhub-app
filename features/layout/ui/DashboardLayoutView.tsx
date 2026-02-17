"use client"
import { ReactNode, useMemo } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  LogOut,
  Coffee,
  User
} from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { usePermissions } from "@/lib/hooks/usePermissions"
import { useLogout } from "@/features/auth/api"
import ShopAvatar from "@/features/avatar/ui/ShopAvatar"
import { useUserData } from "@/features/avatar/api"
import { navigationItems, filterNavItemsByPermissions } from "../config/navigation"
import ThemeSwitcher from "@/features/theme/ui/ThemeSwitcher"

interface DashboardLayoutProps {
  children: ReactNode
}

export default function DashboardLayoutView({ children }: Readonly<DashboardLayoutProps>) {
  const pathname = usePathname()
  const { user } = useAuth()
  const { can } = usePermissions()
  const logoutMutation = useLogout()
  const userId = user?._id
  const { data: userData } = useUserData(userId)

  const branchName = userData?.branch?.name ?? "Sucursal"
  const shopId = user?.ShopId ?? userData?.ShopId

  let displayName = ""
  if (user) {
    const first = user?.name
    const last = user?.lastName
    displayName = [first, last].filter(Boolean).join(" ") || user.emailAddress || "Usuario"
  }

  // Filtrar items de navegación según permisos del usuario
  const navItems = useMemo(() => {
    return filterNavItemsByPermissions(navigationItems, can)
  }, [can])

  return (
    <div className="flex h-screen text-foreground overflow-hidden">
      <aside className="w-64 glass glass-strong border-r border-border/50 flex flex-col">
        <div className="p-6 border-b border-border/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center overflow-hidden">
              {shopId ? (
                <ShopAvatar
                  shopId={shopId}
                  fallback={<Coffee className="w-5 h-5 text-primary" />}
                />
              ) : (
                <Coffee className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <h2 className="font-semibold text-sm text-foreground">BrewHub</h2>
              <p className="text-xs text-muted-foreground">{branchName}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = pathname === item.href

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                  isActive
                    ? "bg-primary/20 text-primary border border-primary/30 shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-muted/50 hover:shadow-md"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{item.name}</span>
              </Link>
            )
          })}
        </nav>

        {/* Theme Switcher */}
        <div className="p-4 border-t border-border/50">
          <ThemeSwitcher />
        </div>

        {/* User Section */}
        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-muted/50 mb-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
              <User className="w-4 h-4 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate text-foreground">{displayName}</p>
              <p className="text-xs text-muted-foreground truncate">{user?.emailAddress}</p>
            </div>
          </div>
          <button
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive disabled:opacity-60 disabled:cursor-not-allowed transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-sm font-medium">Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto bg-transparent">
        {children}
      </main>
    </div>
  )
}
