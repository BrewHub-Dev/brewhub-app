"use client"
import { useEffect, useState } from "react"
import StatCard from "./StatCard"
import ChartCard from "./ChartCard"
import WeeklySalesChart from "./WeeklySalesChart"
import TopProductsList from "./TopProductsList"
import RecentOrdersTable from "./RecentOrdersTable"
import { getDashboardStats, getRecentOrders, getTopProducts, getWeeklySales } from "../api"
import type { DashboardStats, Order, Product, WeeklySales } from "../types"
import { Store, TrendingUp, Users, DollarSign } from "lucide-react"

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats[]>([])
  const [recentOrders, setRecentOrders] = useState<Order[]>([])
  const [topProducts, setTopProducts] = useState<Product[]>([])
  const [weeklySales, setWeeklySales] = useState<WeeklySales[]>([])

  useEffect(() => {
    Promise.all([
      getDashboardStats(),
      getRecentOrders(),
      getTopProducts(),
      getWeeklySales(),
    ]).then(([statsData, ordersData, productsData, salesData]) => {
      setStats(statsData)
      setRecentOrders(ordersData)
      setTopProducts(productsData)
      setWeeklySales(salesData)
    })
  }, [])

  const adminStats: DashboardStats[] = [
    { title: "Total Tiendas", value: "12", icon: Store, trend: { value: 8.2, isPositive: true }, color: "blue" },
    { title: "Ventas Globales", value: "$45,231.89", icon: DollarSign, trend: { value: 12.5, isPositive: true }, color: "green" },
    { title: "Total Usuarios", value: "2,350", icon: Users, trend: { value: 15.3, isPositive: true }, color: "purple" },
    { title: "Crecimiento", value: "+20.1%", icon: TrendingUp, trend: { value: 4.3, isPositive: true }, color: "amber" },
  ]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard Global</h1>
          <p className="text-muted-foreground">Vista general del sistema BrewHub</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {adminStats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Ventas Globales - Semana">
            <WeeklySalesChart data={weeklySales} />
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
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">Operativo</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Base de Datos</span>
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">Conectada</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Cache</span>
                <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">Activo</span>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Tiendas Activas">
            <div className="p-4">
              <div className="text-3xl font-bold text-foreground mb-2">12 / 12</div>
              <p className="text-sm text-muted-foreground">Todas las tiendas operando normalmente</p>
            </div>
          </ChartCard>

          <ChartCard title="Sesiones Activas">
            <div className="p-4">
              <div className="text-3xl font-bold text-foreground mb-2">847</div>
              <p className="text-sm text-muted-foreground">Usuarios conectados ahora</p>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
