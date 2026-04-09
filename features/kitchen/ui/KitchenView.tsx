"use client"

import { Loader2, RefreshCw, ChefHat, CheckCircle2, Clock, Utensils } from "lucide-react"
import { useKitchenOrders, useAdvanceOrder, timeSince } from "../api"
import type { KitchenOrder } from "../types"
import { Button } from "@/components/ui/button"
import { useQueryClient } from "@tanstack/react-query"

const STATUS_CONFIG = {
  confirmed: {
    label: "Confirmadas",
    nextStatus: "preparing",
    nextLabel: "Iniciar preparación",
    color: "border-primary/40 bg-primary/5",
    badge: "bg-primary/20 text-primary",
    icon: Clock,
  },
  preparing: {
    label: "En preparación",
    nextStatus: "ready",
    nextLabel: "Marcar como listo",
    color: "border-warning/40 bg-warning/5",
    badge: "bg-warning/20 text-warning",
    icon: Utensils,
  },
  ready: {
    label: "Listos para entrega",
    nextStatus: "completed",
    nextLabel: "Completar orden",
    color: "border-success/40 bg-success/5",
    badge: "bg-success/20 text-success",
    icon: CheckCircle2,
  },
}

function KitchenCard({ order }: { order: KitchenOrder }) {
  const advanceMutation = useAdvanceOrder()
  const config = STATUS_CONFIG[order.status]
  const Icon = config.icon
  const customerName = order.customer
    ? `${order.customer.name} ${order.customer.lastName}`
    : order.guestName ?? "Cliente"

  const elapsedMs = Date.now() - new Date(order.createdAt).getTime()
  const isUrgent = elapsedMs > 15 * 60_000

  return (
    <div className={`rounded-2xl border-2 ${config.color} ${isUrgent ? "ring-2 ring-destructive/50" : ""} p-5 flex flex-col gap-3 transition-all`}>

      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${config.badge}`}>
              {config.label}
            </span>
            {isUrgent && (
              <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-destructive/20 text-destructive">
                Urgente
              </span>
            )}
          </div>
          <h3 className="text-lg font-bold text-foreground">#{order.orderNumber}</h3>
          <p className="text-sm text-muted-foreground">{customerName}</p>
        </div>
        <div className="flex flex-col items-end gap-1">
          <Icon className="w-6 h-6 text-muted-foreground" />
          <span className={`text-xs font-medium ${isUrgent ? "text-destructive" : "text-muted-foreground"}`}>
            {timeSince(order.createdAt)}
          </span>
          <span className="text-xs text-muted-foreground capitalize">{order.source}</span>
        </div>
      </div>

      <div className="space-y-2 border-t border-border/40 pt-3">
        {order.items.map((item, idx) => (
          <div key={idx} className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-foreground/10 flex items-center justify-center text-xs font-bold text-foreground flex-shrink-0">
                  {item.quantity}
                </span>
                <span className="text-sm font-medium text-foreground">{item.name}</span>
              </div>
              {item.modifiers && item.modifiers.length > 0 && (
                <div className="ml-8 mt-1 space-y-0.5">
                  {item.modifiers.map((mod, midx) => (
                    <p key={midx} className="text-xs text-muted-foreground">
                      + {mod.name}: {mod.optionName}
                    </p>
                  ))}
                </div>
              )}
              {item.notes && (
                <p className="ml-8 text-xs text-warning mt-0.5">Nota: {item.notes}</p>
              )}
            </div>
          </div>
        ))}
      </div>

      {order.notes && (
        <div className="rounded-lg bg-warning/10 border border-warning/20 px-3 py-2">
          <p className="text-xs font-medium text-warning">Nota de orden: {order.notes}</p>
        </div>
      )}

      <Button
        onClick={() => advanceMutation.mutate({ orderId: order._id, newStatus: config.nextStatus })}
        disabled={advanceMutation.isPending}
        className="w-full mt-1"
        variant={order.status === "ready" ? "default" : "secondary"}
      >
        {advanceMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-2" />
        ) : null}
        {config.nextLabel}
      </Button>
    </div>
  )
}

export default function KitchenView() {
  const { data: orders = [], isLoading, isError, dataUpdatedAt } = useKitchenOrders()
  const queryClient = useQueryClient()

  const confirmed = orders.filter((o) => o.status === "confirmed")
  const preparing = orders.filter((o) => o.status === "preparing")
  const ready = orders.filter((o) => o.status === "ready")

  const lastUpdate = dataUpdatedAt ? new Date(dataUpdatedAt).toLocaleTimeString("es-MX") : "--"

  return (
    <div className="p-6 min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center">
            <ChefHat className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Pantalla de Cocina</h1>
            <p className="text-xs text-muted-foreground">Última actualización: {lastUpdate} · Auto-refresh cada 15s</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="w-2 h-2 rounded-full bg-primary" />
            <span className="text-muted-foreground">{confirmed.length} confirmadas</span>
            <span className="w-2 h-2 rounded-full bg-warning ml-2" />
            <span className="text-muted-foreground">{preparing.length} preparando</span>
            <span className="w-2 h-2 rounded-full bg-success ml-2" />
            <span className="text-muted-foreground">{ready.length} listas</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["kitchen"] })}
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} />
          </Button>
        </div>
      </div>

      {isLoading && orders.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span>Cargando órdenes...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex items-center justify-center py-24">
          <div className="flex flex-col items-center gap-3 text-muted-foreground">
            <ChefHat className="w-12 h-12 opacity-30" />
            <p className="text-lg font-medium">Sin órdenes activas</p>
            <p className="text-sm">Las nuevas órdenes aparecerán aquí automáticamente</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="font-semibold text-foreground">Confirmadas</h2>
              <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-primary/20 text-primary">
                {confirmed.length}
              </span>
            </div>
            <div className="space-y-4">
              {confirmed.length === 0 ? (
                <div className="rounded-xl border border-border/30 p-6 text-center text-sm text-muted-foreground">
                  Sin órdenes confirmadas
                </div>
              ) : (
                confirmed.map((o) => <KitchenCard key={o._id} order={o} />)
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Utensils className="w-5 h-5 text-warning" />
              <h2 className="font-semibold text-foreground">En Preparación</h2>
              <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-warning/20 text-warning">
                {preparing.length}
              </span>
            </div>
            <div className="space-y-4">
              {preparing.length === 0 ? (
                <div className="rounded-xl border border-border/30 p-6 text-center text-sm text-muted-foreground">
                  Sin órdenes en preparación
                </div>
              ) : (
                preparing.map((o) => <KitchenCard key={o._id} order={o} />)
              )}
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <CheckCircle2 className="w-5 h-5 text-success" />
              <h2 className="font-semibold text-foreground">Listos para Entrega</h2>
              <span className="ml-auto px-2 py-0.5 text-xs font-bold rounded-full bg-success/20 text-success">
                {ready.length}
              </span>
            </div>
            <div className="space-y-4">
              {ready.length === 0 ? (
                <div className="rounded-xl border border-border/30 p-6 text-center text-sm text-muted-foreground">
                  Sin órdenes listas
                </div>
              ) : (
                ready.map((o) => <KitchenCard key={o._id} order={o} />)
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
