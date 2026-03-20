"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getOrders, updateOrderStatus } from "../api"
import type { OrderStatus } from "../api"
import { Pagination } from "@/components/ui/Pagination"
import {
  Clock,
  ChefHat,
  CheckCircle2,
  XCircle,
  Package,
  Loader2,
  RefreshCw,
  Eye,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const STATUS_CONFIG: Record<OrderStatus, { label: string; color: string; icon: React.ElementType }> = {
  pending: { label: "Pendiente", color: "bg-yellow-500/20 text-yellow-500 border-yellow-500/30", icon: Clock },
  confirmed: { label: "Confirmado", color: "bg-blue-500/20 text-blue-500 border-blue-500/30", icon: Package },
  preparing: { label: "Preparando", color: "bg-orange-500/20 text-orange-500 border-orange-500/30", icon: ChefHat },
  ready: { label: "Listo", color: "bg-green-500/20 text-green-500 border-green-500/30", icon: CheckCircle2 },
  completed: { label: "Completado", color: "bg-muted text-muted-foreground border-border", icon: CheckCircle2 },
  cancelled: { label: "Cancelado", color: "bg-red-500/20 text-red-500 border-red-500/30", icon: XCircle },
}

const NEXT_STATUS: Partial<Record<OrderStatus, OrderStatus>> = {
  pending: "confirmed",
  confirmed: "preparing",
  preparing: "ready",
  ready: "completed",
}

function formatTime(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

const STATUS_FILTERS: { key: OrderStatus | "all"; label: string }[] = [
  { key: "all", label: "Todas" },
  { key: "pending", label: "Pendiente" },
  { key: "confirmed", label: "Confirmado" },
  { key: "preparing", label: "Preparando" },
  { key: "ready", label: "Listo" },
  { key: "completed", label: "Completado" },
  { key: "cancelled", label: "Cancelado" },
]

export default function OrdersView() {
  const [statusFilter, setStatusFilter] = useState<OrderStatus | "all">("all")
  const [page, setPage] = useState(1)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const queryClient = useQueryClient()

  const { data = { data: [], pagination: { total: 0, page: 1, limit: 20, pages: 0, hasNext: false, hasPrev: false } }, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["orders", statusFilter, page],
    queryFn: () => getOrders(statusFilter !== "all" ? { status: statusFilter, page, limit: 20 } : { page, limit: 20 }),
    refetchInterval: 30_000,
  })

  const orders = data.data
  const pagination = data.pagination

  const updateMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
    },
  })

  function handleFilterChange(filter: OrderStatus | "all") {
    setStatusFilter(filter)
    setPage(1)
    setExpandedId(null)
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Órdenes</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona y actualiza el estado de las órdenes en tiempo real
              {pagination.total > 0 && (
                <span className="ml-2 text-sm text-muted-foreground">
                  · {pagination.total} en total
                </span>
              )}
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="gap-2"
          >
            <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
            Actualizar
          </Button>
        </div>

        {/* Status filter tabs */}
        <div className="flex gap-2 mb-6 flex-wrap">
          {STATUS_FILTERS.map(({ key, label }) => {
            const cfg = key !== "all" ? STATUS_CONFIG[key] : null
            return (
              <button
                key={key}
                onClick={() => handleFilterChange(key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-all ${
                  statusFilter === key
                    ? cfg
                      ? `${cfg.color}`
                      : "bg-primary/20 text-primary border-primary/30"
                    : "bg-muted/20 text-muted-foreground border-border hover:bg-muted/40"
                }`}
              >
                {label}
                {statusFilter === key && pagination.total > 0 && (
                  <span className="ml-1.5 opacity-70">({pagination.total})</span>
                )}
              </button>
            )
          })}
        </div>

        {/* Orders list */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            <Package className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">No hay órdenes</p>
            <p className="text-sm">Las órdenes aparecerán aquí cuando los clientes realicen pedidos</p>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {orders.map((order) => {
                const cfg = STATUS_CONFIG[order.status]
                const StatusIcon = cfg.icon
                const nextStatus = NEXT_STATUS[order.status]
                const isExpanded = expandedId === order._id

                return (
                  <div
                    key={order._id}
                    className="rounded-xl border border-border/50 bg-card/30 glass overflow-hidden transition-all"
                  >
                    <div className="flex items-center gap-4 p-4">
                      <div className="min-w-[100px]">
                        <p className="text-sm font-mono font-semibold text-foreground">#{order.orderNumber}</p>
                        <p className="text-xs text-muted-foreground">{formatTime(order.createdAt)}</p>
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">
                          {order.customer
                            ? `${order.customer.name} ${order.customer.lastName}`
                            : order.guestName || "Cliente"}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.branchName ?? "Sin sucursal"} · {order.source === "pos" ? "POS" : "App"}
                        </p>
                      </div>

                      <div className="text-center min-w-[60px]">
                        <p className="text-sm font-semibold">{order.items?.length ?? 0}</p>
                        <p className="text-xs text-muted-foreground">items</p>
                      </div>

                      <div className="text-right min-w-[80px]">
                        <p className="text-sm font-bold text-primary">${order.total?.toFixed(2)}</p>
                        <p className="text-xs text-muted-foreground capitalize">{order.paymentMethod}</p>
                      </div>

                      <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium min-w-[110px] justify-center ${cfg.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {cfg.label}
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2">
                        {nextStatus && (
                          <Button
                            size="sm"
                            variant="outline"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: order._id, status: nextStatus })}
                            className="text-xs h-8 px-3"
                          >
                            → {STATUS_CONFIG[nextStatus].label}
                          </Button>
                        )}
                        {order.status !== "cancelled" && order.status !== "completed" && (
                          <Button
                            size="sm"
                            variant="ghost"
                            disabled={updateMutation.isPending}
                            onClick={() => updateMutation.mutate({ id: order._id, status: "cancelled" })}
                            className="text-xs h-8 px-2 text-destructive hover:text-destructive"
                          >
                            <XCircle className="w-4 h-4" />
                          </Button>
                        )}
                        <button
                          onClick={() => setExpandedId(isExpanded ? null : order._id)}
                          className="text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {isExpanded && (
                      <div className="border-t border-border/30 p-4 bg-muted/10">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2">Detalle de la orden</p>
                        <div className="space-y-1.5">
                          {(order.items ?? []).map((item, idx) => (
                            <div key={idx} className="flex justify-between text-sm">
                              <span className="text-foreground">
                                {item.quantity}× {item.name}
                                {item.modifiers && item.modifiers.length > 0 && (
                                  <span className="text-muted-foreground ml-1">
                                    ({item.modifiers.map(m => m.optionName).join(", ")})
                                  </span>
                                )}
                              </span>
                              <span className="text-muted-foreground">${(item.itemTotal).toFixed(2)}</span>
                            </div>
                          ))}
                        </div>
                        {order.notes && (
                          <p className="mt-2 text-xs text-muted-foreground border-t border-border/20 pt-2">
                            {order.notes}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>

            <Pagination pagination={pagination} onPageChange={setPage} />
          </>
        )}
      </div>
    </div>
  )
}
