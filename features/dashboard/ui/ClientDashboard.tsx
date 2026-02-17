"use client"
import { useEffect, useState } from "react"
import ChartCard from "./ChartCard"
import { Package, Clock, Star, Gift } from "lucide-react"

export default function ClientDashboard() {
  const [orders, setOrders] = useState<any[]>([])

  useEffect(() => {
    setOrders([
      { id: "ORD-001", date: "2024-02-15", status: "Entregado", total: 45.50, items: 3 },
      { id: "ORD-002", date: "2024-02-10", status: "Entregado", total: 32.00, items: 2 },
      { id: "ORD-003", date: "2024-02-05", status: "En proceso", total: 28.75, items: 2 },
    ])
  }, [])

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Mi Dashboard</h1>
          <p className="text-muted-foreground">Bienvenido de vuelta</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-chart-1/10 flex items-center justify-center">
                <Package className="w-6 h-6 text-chart-1" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">12</div>
            <p className="text-sm text-muted-foreground">Total de Pedidos</p>
          </div>

          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-success/10 flex items-center justify-center">
                <Clock className="w-6 h-6 text-success" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">1</div>
            <p className="text-sm text-muted-foreground">Pedidos Activos</p>
          </div>

          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-chart-3/10 flex items-center justify-center">
                <Star className="w-6 h-6 text-chart-3" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">450</div>
            <p className="text-sm text-muted-foreground">Puntos Acumulados</p>
          </div>

          <div className="glass glass-strong rounded-2xl p-6 border border-border/50">
            <div className="flex items-center justify-between mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                <Gift className="w-6 h-6 text-primary" />
              </div>
            </div>
            <div className="text-2xl font-bold text-foreground mb-1">3</div>
            <p className="text-sm text-muted-foreground">Cupones Disponibles</p>
          </div>
        </div>

        <ChartCard title="Mis Pedidos Recientes">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Fecha</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Items</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Estado</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 text-sm font-medium text-foreground">{order.id}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{order.date}</td>
                    <td className="py-3 px-4 text-sm text-muted-foreground">{order.items}</td>
                    <td className="py-3 px-4 text-sm font-medium text-foreground">${order.total.toFixed(2)}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === "Entregado"
                          ? "bg-success/20 text-success"
                          : "bg-accent text-accent-foreground"
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>

        <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Programa de Fidelidad">
            <div className="p-4">
              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm text-muted-foreground">Progreso hacia el siguiente nivel</span>
                  <span className="text-sm font-medium text-foreground">450 / 1000</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div className="bg-primary h-2 rounded-full" style={{ width: "45%" }} />
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Necesitas 550 puntos más para alcanzar el nivel Oro</p>
            </div>
          </ChartCard>

          <ChartCard title="Cupones Activos">
            <div className="p-4 space-y-3">
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-primary">20% de descuento</span>
                  <span className="text-xs text-primary/80">Válido hasta 28/02</span>
                </div>
                <p className="text-sm text-primary/80">En tu próximo pedido</p>
              </div>

              <div className="p-3 rounded-lg bg-accent border border-accent-foreground/20">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-accent-foreground">Café gratis</span>
                  <span className="text-xs text-accent-foreground/80">Válido hasta 15/03</span>
                </div>
                <p className="text-sm text-accent-foreground/80">Con compra mínima de $20</p>
              </div>
            </div>
          </ChartCard>
        </div>
      </div>
    </div>
  )
}
