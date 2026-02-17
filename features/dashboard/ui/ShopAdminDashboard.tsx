"use client"
import { useEffect, useState } from "react"
import StatCard from "./StatCard"
import ChartCard from "./ChartCard"
import WeeklySalesChart from "./WeeklySalesChart"
import TopProductsList from "./TopProductsList"
import RecentOrdersTable from "./RecentOrdersTable"
import { getDashboardStats, getRecentOrders, getTopProducts, getWeeklySales } from "../api"
import type { DashboardStats, Order, Product, WeeklySales } from "../types"
import { Building2, TrendingUp, Package, AlertCircle } from "lucide-react"

export default function ShopAdminDashboard() {
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

  const shopAdminStats: DashboardStats[] = [
    { title: "Total Sucursales", value: "5", icon: Building2, trend: { value: 0, isPositive: true }, color: "blue" },
    { title: "Rendimiento", value: "+18.2%", icon: TrendingUp, trend: { value: 5.4, isPositive: true }, color: "green" },
    { title: "Stock Total", value: "12,450", icon: Package, trend: { value: 2.1, isPositive: false }, color: "purple" },
    { title: "Alertas", value: "3", icon: AlertCircle, trend: { value: 1, isPositive: false }, color: "amber" },
  ]

  const branchComparison = [
    { name: "Sucursal Centro", sales: 45231, trend: 12.5 },
    { name: "Sucursal Norte", sales: 38420, trend: 8.2 },
    { name: "Sucursal Sur", sales: 32180, trend: -3.1 },
    { name: "Sucursal Este", sales: 28950, trend: 15.7 },
    { name: "Sucursal Oeste", sales: 24670, trend: 6.3 },
  ]

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Dashboard de Tienda</h1>
          <p className="text-muted-foreground">Vista general de todas tus sucursales</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {shopAdminStats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => <StatCard key={stat.title} {...stat} />)}
        </div>

        <div className="mb-8">
          <ChartCard title="Rendimiento por Sucursal">
            <div className="p-4">
              <div className="space-y-4">
                {branchComparison.map((branch, index) => (
                  <div key={branch.name} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                        <span className="text-sm font-semibold text-primary">{index + 1}</span>
                      </div>
                      <div>
                        <p className="font-medium text-foreground">{branch.name}</p>
                        <p className="text-sm text-muted-foreground">${branch.sales.toLocaleString()}</p>
                      </div>
                    </div>
                    <div className={`flex items-center gap-1 px-2 py-1 rounded-full ${
                      branch.trend >= 0 ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive"
                    }`}>
                      <span className="text-sm font-medium">
                        {branch.trend >= 0 ? "+" : ""}{branch.trend}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </ChartCard>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <ChartCard title="Ventas de la Tienda - Semana">
            <WeeklySalesChart data={weeklySales} />
          </ChartCard>
          <ChartCard title="Productos Más Vendidos">
            <TopProductsList products={topProducts} />
          </ChartCard>
        </div>

        <ChartCard title="Órdenes Recientes (Todas las Sucursales)">
          <RecentOrdersTable orders={recentOrders} />
        </ChartCard>
      </div>
    </div>
  )
}
