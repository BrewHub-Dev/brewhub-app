"use client"
import { useAuth } from "@/lib/auth-store"
import AdminDashboard from "./AdminDashboard"
import ShopAdminDashboard from "./ShopAdminDashboard"
import BranchAdminDashboard from "./BranchAdminDashboard"
import ClientDashboard from "./ClientDashboard"

/**
 * Router de dashboards según el rol del usuario
 * Cada rol tiene una vista personalizada
 */
export default function DashboardView() {
  const { user } = useAuth()

  if (!user) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <p className="text-gray-600 dark:text-gray-400">Cargando...</p>
        </div>
      </div>
    )
  }

  // Renderizar dashboard según el rol
  switch (user.role) {
    case "ADMIN":
      return <AdminDashboard />

    case "SHOP_ADMIN":
      return <ShopAdminDashboard />

    case "BRANCH_ADMIN":
      return <BranchAdminDashboard />

    case "CLIENT":
      return <ClientDashboard />

    default:
      return (
        <div className="p-8">
          <div className="max-w-7xl mx-auto">
            <div className="glass glass-strong rounded-2xl p-8 border border-gray-200/50 dark:border-gray-700/50">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Rol no reconocido
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Tu rol ({user.role}) no tiene un dashboard configurado.
              </p>
            </div>
          </div>
        </div>
      )
  }
}
