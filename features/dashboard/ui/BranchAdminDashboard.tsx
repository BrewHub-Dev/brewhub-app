"use client"
import { DollarSign, ShoppingBag, Users, Clock, TrendingUp, TrendingDown } from "lucide-react"
import StatCard from "./StatCard"
import ChartCard from "./ChartCard"
import WeeklySalesChart from "./WeeklySalesChart"
import TopProductsList from "./TopProductsList"
import RecentOrdersTable from "./RecentOrdersTable"
import { useDashboard, translateStatus, formatTimeDiff } from "../api"

export default function BranchAdminDashboard() {
  const { data, isLoading, isError } = useDashboard()

  if (isLoading) {
    return (
      <div className="p-8">
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="h-8 w-64 bg-muted/50 rounded animate-pulse mb-2" />
            <div className="h-4 w-48 bg-muted/30 rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="glass rounded-2xl p-6 h-32 animate-pulse bg-muted/20" />
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (isError || !data) {
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

  const revTrend = data.trends.revenue
  const ordTrend = data.trends.orders

  const stats = [
    {
      title: "Ventas de Hoy",
      value: `$${data.today.revenue.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      icon: DollarSign,
      trend: { value: Math.abs(revTrend), isPositive: revTrend >= 0 },
      color: "green",
    },
    {
      title: "Órdenes Hoy",
      value: data.today.ordersCount,
      icon: ShoppingBag,
      trend: { value: Math.abs(ordTrend), isPositive: ordTrend >= 0 },
      color: "blue",
    },
    {
      title: "Clientes Únicos",
      value: data.today.uniqueCustomers,
      icon: Users,
      color: "purple",
    },
    {
      title: "Pendientes",
      value: data.pendingCount,
      icon: Clock,
      trend: { value: 0, isPositive: data.pendingCount === 0 },
      color: "amber",
    },
  ]

  const topProducts = data.topProducts.map((p) => ({
    name: p.name,
    sales: p.quantity,
    revenue: `$${p.revenue.toFixed(2)}`,
  }))

  const recentOrders = data.recentOrders.map((o) => ({
    id: o.id,
    customer: o.customer,
    items: o.items,
    total: `$${o.total.toFixed(2)}`,
    time: formatTimeDiff(o.createdAt),
    status: translateStatus(o.status) as any,
  }))

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard de Sucursal</h1>
          <p className="text-muted-foreground">Resumen de actividad de tu sucursal</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Ventas de la Semana">
            <WeeklySalesChart data={data.weeklySales} />
          </ChartCard>
          <ChartCard title="Productos Más Vendidos">
            <TopProductsList products={topProducts} />
          </ChartCard>
        </div>

        <ChartCard title="Órdenes Recientes">
          <RecentOrdersTable orders={recentOrders} />
        </ChartCard>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Comparativa vs Ayer">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue hoy</span>
                <span className="font-bold text-foreground">${data.today.revenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Revenue ayer</span>
                <span className="font-medium text-muted-foreground">${data.yesterday.revenue.toFixed(2)}</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/30 pt-3">
                <span className="text-sm font-medium text-foreground">Variación</span>
                <div className={`flex items-center gap-1 text-sm font-semibold ${revTrend >= 0 ? "text-success" : "text-destructive"}`}>
                  {revTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{revTrend >= 0 ? "+" : ""}{revTrend}%</span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Órdenes vs Ayer">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Hoy</span>
                <span className="font-bold text-foreground">{data.today.ordersCount} órdenes</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Ayer</span>
                <span className="font-medium text-muted-foreground">{data.yesterday.ordersCount} órdenes</span>
              </div>
              <div className="flex items-center justify-between border-t border-border/30 pt-3">
                <span className="text-sm font-medium text-foreground">Variación</span>
                <div className={`flex items-center gap-1 text-sm font-semibold ${ordTrend >= 0 ? "text-success" : "text-destructive"}`}>
                  {ordTrend >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  <span>{ordTrend >= 0 ? "+" : ""}{ordTrend}%</span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Ticket Promedio">
            <div className="p-4">
              <div className="text-3xl font-bold text-foreground mb-2">
                ${data.today.ordersCount > 0
                  ? (data.today.revenue / data.today.ordersCount).toFixed(2)
                  : "0.00"}
              </div>
              <p className="text-sm text-muted-foreground">Por orden hoy</p>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Clientes únicos</span>
                  <span className="font-medium text-foreground">{data.today.uniqueCustomers}</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
