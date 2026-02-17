"use client"
import { useEffect, useState } from "react"
import StatCard from "./StatCard"
import ChartCard from "./ChartCard"
import WeeklySalesChart from "./WeeklySalesChart"
import TopProductsList from "./TopProductsList"
import RecentOrdersTable from "./RecentOrdersTable"
import { getDashboardStats, getRecentOrders, getTopProducts, getWeeklySales } from "../api"
import type { DashboardStats, Order, Product, WeeklySales } from "../types"

export default function BranchAdminDashboard() {
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
            <WeeklySalesChart data={weeklySales} />
          </ChartCard>
          <ChartCard title="Productos Más Vendidos">
            <TopProductsList products={topProducts} />
          </ChartCard>
        </div>

        <ChartCard title="Órdenes Recientes">
          <RecentOrdersTable orders={recentOrders} />
        </ChartCard>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
          <ChartCard title="Inventario">
            <div className="p-4">
              <div className="text-3xl font-bold text-foreground mb-2">2,450</div>
              <p className="text-sm text-muted-foreground">Items en stock</p>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Stock bajo</span>
                  <span className="font-medium text-warning">12 items</span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Personal">
            <div className="p-4">
              <div className="text-3xl font-bold text-foreground mb-2">8</div>
              <p className="text-sm text-muted-foreground">Empleados activos</p>
              <div className="mt-3 pt-3 border-t border-border">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">En turno ahora</span>
                  <span className="font-medium text-success">3</span>
                </div>
              </div>
            </div>
          </ChartCard>

          <ChartCard title="Horario">
            <div className="p-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Estado</span>
                  <span className="px-2 py-1 text-xs font-medium text-success bg-success/20 rounded-full">Abierto</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Cierra en</span>
                  <span className="text-sm font-medium text-foreground">4h 30m</span>
                </div>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
