"use client"
import { Store, DollarSign, Users, Activity } from "lucide-react"
import StatCard from "./StatCard"
import ChartCard from "./ChartCard"
import WeeklySalesChart from "./WeeklySalesChart"
import TopProductsList from "./TopProductsList"
import RecentOrdersTable from "./RecentOrdersTable"
import { useAdminDashboard, translateStatus, formatTimeDiff } from "../api"

export default function AdminDashboard() {
  const { data, isLoading, isError } = useAdminDashboard()

  const adminStats = [
    {
      title: "Total Tiendas",
      value: isLoading ? "..." : data?.totalShops ?? 0,
      icon: Store,
      color: "blue",
    },
    {
      title: "Revenue Plataforma Hoy",
      value: isLoading
        ? "..."
        : `$${(data?.platformRevenueToday ?? 0).toLocaleString("es-MX", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`,
      icon: DollarSign,
      color: "green",
    },
    {
      title: "Total Usuarios",
      value: isLoading ? "..." : data?.totalUsers ?? 0,
      icon: Users,
      color: "purple",
    },
    {
      title: "Sesiones Activas",
      value: isLoading ? "..." : data?.activeSessions ?? 0,
      icon: Activity,
      color: "amber",
    },
  ]

  const topProducts = (data?.topProducts ?? []).map((p) => ({
    name: p.name,
    sales: p.quantity,
    revenue: `$${p.revenue.toFixed(2)}`,
  }))

  const recentOrders = (data?.recentOrders ?? []).map((o) => ({
    id: o.id,
    customer: o.customer,
    items: o.items,
    total: `$${o.total.toFixed(2)}`,
    time: formatTimeDiff(o.createdAt),
    status: translateStatus(o.status) as any,
  }))

  if (isError) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="p-6 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive">
            Error al cargar el dashboard. Verifica tu conexión con el servidor.
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard Global</h1>
          <p className="text-muted-foreground">Vista general del sistema Brewhub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat) => (
            <StatCard key={stat.title} {...stat} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Ventas Globales - Semana">
            <WeeklySalesChart data={data?.weeklySales ?? []} />
          </ChartCard>
          <ChartCard title="Productos Más Vendidos (Global)">
            <TopProductsList products={topProducts} />
          </ChartCard>
        </div>

        <ChartCard title="Órdenes Recientes (Todas las Tiendas)">
          <RecentOrdersTable orders={recentOrders} />
        </ChartCard>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Estado del Sistema">
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">API Status</span>
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">
                  Operativo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base de Datos</span>
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">
                  Conectada
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache (Redis)</span>
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">
                  Activo
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">WebSockets</span>
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">
                  Conectado
                </span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Tiendas Registradas">
            <div className="p-4">
              <div className="text-4xl font-bold text-foreground mb-2">
                {isLoading ? "..." : data?.totalShops ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Tiendas en la plataforma</p>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Usuarios totales</span>
                  <span className="font-medium text-foreground">
                    {isLoading ? "..." : data?.totalUsers ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Resumen de Hoy">
            <div className="p-4">
              <div className="text-4xl font-bold text-foreground mb-2">
                {isLoading ? "..." : data?.today?.ordersCount ?? 0}
              </div>
              <p className="text-sm text-muted-foreground">Órdenes hoy (plataforma)</p>
              <div className="mt-3 pt-3 border-t border-border space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Revenue hoy</span>
                  <span className="font-medium text-success">
                    ${isLoading ? "..." : (data?.platformRevenueToday ?? 0).toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Pendientes</span>
                  <span className={`font-medium ${(data?.pendingCount ?? 0) > 0 ? "text-warning" : "text-muted-foreground"}`}>
                    {isLoading ? "..." : data?.pendingCount ?? 0}
                  </span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
