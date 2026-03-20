"use client"
import { Package, Clock, Star, Gift, Loader2 } from "lucide-react"
import ChartCard from "./ChartCard"
import { useClientDashboard, useClientOrders, translateStatus, formatTimeDiff } from "../api"
import { useAuth } from "@/lib/auth-store"

export default function ClientDashboard() {
  const { user } = useAuth()
  const userId = user?._id

  const { data: counts, isLoading: loadingCounts } = useClientDashboard(userId)
  const { data: ordersRaw = [], isLoading: loadingOrders } = useClientOrders(userId)

  const isLoading = loadingCounts || loadingOrders

  const totalOrders = counts?.total ?? 0
  const activeOrders = counts?.inProduction ?? 0
  const completedOrders = counts?.completed ?? 0

  const recentOrders = Array.isArray(ordersRaw)
    ? ordersRaw.map((o: any) => ({
        id: o.orderNumber ?? o._id,
        date: new Date(o.createdAt).toLocaleDateString("es-MX"),
        items: o.items?.length ?? 0,
        total: o.total ?? 0,
        status: translateStatus(o.status),
        time: formatTimeDiff(o.createdAt),
      }))
    : []

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Mi Dashboard</h1>
          <p className="text-muted-foreground">
            Bienvenido{user?.name ? `, ${user.name}` : ""} de vuelta
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-chart-1" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalOrders}
            </div>
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          </div>

          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : activeOrders}
            </div>
            <p className="text-sm text-muted-foreground">Pedidos Activos</p>
          </div>

          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-chart-3" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : completedOrders}
            </div>
            <p className="text-sm text-muted-foreground">Pedidos Completados</p>
          </div>

          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">
              {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : totalOrders}
            </div>
            <p className="text-sm text-muted-foreground">Órdenes Totales</p>
          </div>
        </div>

        <ChartCard title="Mis Pedidos Recientes">
          {loadingOrders ? (
            <div className="p-8 flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground text-sm">
              No tienes pedidos aún. ¡Haz tu primer pedido!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Tiempo</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                      <td className="py-3 px-4 text-sm font-medium text-foreground">{order.id}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.items}</td>
                      <td className="py-3 px-4 text-sm font-medium text-foreground">${order.total.toFixed(2)}</td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">{order.time}</td>
                      <td className="py-3 px-4">
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                          order.status === "Completado"
                            ? "bg-success/20 text-success"
                            : order.status === "Cancelado"
                              ? "bg-destructive/20 text-destructive"
                              : "bg-primary/20 text-primary"
                        }`}>
                          {order.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Resumen de Actividad">
            <div className="p-4 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total de pedidos</span>
                <span className="font-bold text-foreground">{totalOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Completados</span>
                <span className="font-medium text-success">{completedOrders}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">En proceso</span>
                <span className={`font-medium ${activeOrders > 0 ? "text-primary" : "text-muted-foreground"}`}>
                  {activeOrders}
                </span>
              </div>
              {totalOrders > 0 && (
                <div className="mt-2">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs text-muted-foreground">Tasa de completado</span>
                    <span className="text-xs font-medium text-foreground">
                      {Math.round((completedOrders / totalOrders) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-primary h-2 rounded-full transition-all"
                      style={{ width: `${Math.round((completedOrders / totalOrders) * 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </ChartCard>

          <ChartCard title="Estado de Pedidos Activos">
            <div className="p-4">
              {activeOrders === 0 ? (
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-2">
                    <Package className="w-6 h-6 text-success" />
                  </div>
                  <p className="text-sm text-muted-foreground">No tienes pedidos activos</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                    <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                    <div>
                      <p className="text-sm font-medium text-foreground">{activeOrders} pedido{activeOrders > 1 ? "s" : ""} en proceso</p>
                      <p className="text-xs text-muted-foreground">Siendo preparado{activeOrders > 1 ? "s" : ""} ahora</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
