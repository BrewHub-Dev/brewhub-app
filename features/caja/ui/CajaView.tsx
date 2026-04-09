"use client"

import { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import {
  getZReport,
  downloadZReportCSV,
  PAYMENT_LABELS,
  STATUS_LABELS,
  type ZReportOrder,
} from "../api"
import {
  Banknote,
  CreditCard,
  ArrowLeftRight,
  Monitor,
  TrendingUp,
  ShoppingBag,
  XCircle,
  Loader2,
  Printer,
  FileSpreadsheet,
  ChevronDown,
  ChevronRight,
  Receipt,
  Tag,
  BarChart3,
  RefreshCw,
  Clock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { DateTime } from "luxon"
import { get } from "@/lib/api"

import { useAuth } from "@/lib/auth-store"

interface BranchData {
  _id: string
  name: string
  timezone?: string
}

interface ShopData {
  _id: string
  name: string
  localization?: {
    timezone?: string
  }
}

const PAYMENT_ICONS: Record<string, React.ElementType> = {
  cash: Banknote,
  card: CreditCard,
  transfer: ArrowLeftRight,
  terminal: Monitor,
  bank_transfer: ArrowLeftRight,
  wallet: Banknote,
}

const STATUS_COLOR: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
  refunded: "bg-purple-100 text-purple-700",
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  preparing: "bg-orange-100 text-orange-700",
  ready: "bg-teal-100 text-teal-700",
}

function getTodayInZone(timezone: string = "America/Mexico_City"): string {
  return DateTime.now().setZone(timezone).toISODate() || DateTime.now().toISODate()
}

function fmt(n: number) {
  return n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function fmtTime(iso: string, timezone: string = "America/Mexico_City") {
  if (!iso) return "-"
  const dt = DateTime.fromISO(iso, { zone: "utc" }).setZone(timezone)
  return dt.toFormat("HH:mm")
}


function OrderRow({ order, timezone }: { order: ZReportOrder; timezone: string }) {
  const [open, setOpen] = useState(false)
  const Icon = PAYMENT_ICONS[order.paymentMethod] ?? Banknote

  return (
    <div className="border border-border/40 rounded-xl overflow-hidden">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center gap-3 p-3 bg-card/30 hover:bg-muted/20 transition-all text-left"
      >
        <div className="flex items-center gap-1.5 text-muted-foreground shrink-0">
          {open ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
          <span className="text-xs font-mono">#{order.orderNumber}</span>
        </div>
        <Clock className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-xs text-muted-foreground shrink-0">{fmtTime(order.createdAt)}</span>
        <span
          className={`text-xs font-medium px-2 py-0.5 rounded-full shrink-0 ${STATUS_COLOR[order.status] ?? "bg-muted text-muted-foreground"}`}
        >
          {STATUS_LABELS[order.status] ?? order.status}
        </span>
        <div className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
          <Icon className="w-3.5 h-3.5" />
          {PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod}
        </div>
        <span className="ml-auto font-bold text-sm tabular-nums shrink-0">
          ${fmt(order.total)}
        </span>
      </button>

      {open && (
        <div className="p-3 bg-muted/10 border-t border-border/30 space-y-1.5">
          {order.items.map((item, i) => (
            <div key={i} className="flex items-center justify-between text-sm">
              <span className="text-foreground">
                <span className="text-muted-foreground mr-2">{item.quantity}×</span>
                {item.name}
              </span>
              <span className="tabular-nums text-muted-foreground">${fmt(item.itemTotal)}</span>
            </div>
          ))}
          {(order.discount > 0 || order.tax > 0) && (
            <div className="pt-1.5 mt-1.5 border-t border-border/30 space-y-1">
              {order.discount > 0 && (
                <div className="flex justify-between text-xs text-green-600">
                  <span>Descuento</span>
                  <span>-${fmt(order.discount)}</span>
                </div>
              )}
              {order.tax > 0 && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Impuesto</span>
                  <span>+${fmt(order.tax)}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CajaView() {
  const { user } = useAuth()
  const isShopAdmin = user?.role === "SHOP_ADMIN"
  const [selectedDate, setSelectedDate] = useState(getTodayInZone())
  const [selectedBranchId, setSelectedBranchId] = useState<string>("")
  const [branchTimezone, setBranchTimezone] = useState<string>("America/Mexico_City")
  const [exporting, setExporting] = useState(false)
  const [activeTab, setActiveTab] = useState<"resumen" | "ordenes" | "items">("resumen")

  useEffect(() => {
    const saved = localStorage.getItem("selectedBranchId")
    if (saved) {
      setSelectedBranchId(saved)
    }
  }, [])

  useEffect(() => {
    async function fetchTimezone() {
      if (!isShopAdmin) {
        if (user?.ShopId) {
          try {
            const shop = await get<ShopData>(`/shops/${user.ShopId}`)
            if (shop?.localization?.timezone) {
              setBranchTimezone(shop.localization.timezone)
            }
          } catch (err) {
            console.error("Failed to fetch shop timezone", err)
          }
        }
        return
      }

      if (!selectedBranchId) return
      try {
        const branch = await get<BranchData>(`/branches/${selectedBranchId}`)
        if (branch?.timezone) {
          setBranchTimezone(branch.timezone)
        }
      } catch (err) {
        console.error("Failed to fetch branch timezone", err)
      }
    }
    fetchTimezone()
  }, [selectedBranchId, isShopAdmin, user?.ShopId])

  useEffect(() => {
    const handleBranchChange = (e: CustomEvent) => {
      setSelectedBranchId(e.detail.branchId)
    }
    window.addEventListener("branchSelected", handleBranchChange as EventListener)
    return () => window.removeEventListener("branchSelected", handleBranchChange as EventListener)
  }, [])

  useEffect(() => {
    setSelectedDate(getTodayInZone(branchTimezone))
  }, [branchTimezone])

  const { data, isLoading, refetch, isFetching } = useQuery({
    queryKey: ["z-report", selectedDate, selectedBranchId],
    queryFn: () => getZReport(selectedDate, selectedBranchId || undefined),
    staleTime: 60_000,
  })

  async function handleExport() {
    setExporting(true)
    try {
      await downloadZReportCSV(selectedDate, selectedBranchId || undefined)
    } finally {
      setExporting(false)
    }
  }

  const hasData = data && data.totalOrders > 0

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">

        <div className="flex flex-wrap items-start justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Cierre de Caja</h1>
            <p className="text-muted-foreground mt-1">Z-Report — Reporte de ventas del día</p>
            {data?.timezone && (
              <p className="text-xs text-muted-foreground mt-1">Zona horaria: {data.timezone}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <input
              type="date"
              value={selectedDate}
              max={getTodayInZone(branchTimezone)}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-3 py-2 rounded-xl border border-border bg-card text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="gap-2">
              <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
            <Button variant="outline" size="sm" onClick={() => window.print()} className="gap-2">
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Imprimir</span>
            </Button>
            <Button
              size="sm"
              onClick={handleExport}
              disabled={exporting}
              className="gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              {exporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileSpreadsheet className="w-4 h-4" />}
              <span className="hidden sm:inline">Exportar CSV</span>
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
          </div>
        ) : !data ? null : (
          <div className="space-y-6">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="glass rounded-2xl p-5 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <TrendingUp className="w-4 h-4" /> Total ingresos
                </div>
                <p className="text-2xl font-bold text-primary">${fmt(data.totalRevenue)}</p>
                {data.totalDiscount > 0 && (
                  <p className="text-xs text-green-600">-${fmt(data.totalDiscount)} en dctos</p>
                )}
              </div>
              <div className="glass rounded-2xl p-5 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <ShoppingBag className="w-4 h-4" /> Órdenes
                </div>
                <p className="text-2xl font-bold">{data.totalOrders}</p>
                <p className="text-xs text-muted-foreground">completadas</p>
              </div>
              <div className="glass rounded-2xl p-5 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <Receipt className="w-4 h-4" /> Ticket prom.
                </div>
                <p className="text-2xl font-bold">${fmt(data.averageTicket)}</p>
              </div>
              <div className="glass rounded-2xl p-5 flex flex-col gap-1">
                <div className="flex items-center gap-2 text-muted-foreground text-xs uppercase tracking-wide">
                  <XCircle className="w-4 h-4" /> Canceladas
                </div>
                <p className="text-2xl font-bold text-red-500">{data.cancelledCount}</p>
                {data.refundedCount > 0 && (
                  <p className="text-xs text-purple-500">{data.refundedCount} reembolsada{data.refundedCount > 1 ? "s" : ""}</p>
                )}
              </div>
            </div>

            {(data.totalTax > 0 || data.totalDiscount > 0) && (
              <div className="glass rounded-2xl p-5 flex flex-wrap gap-6">
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Subtotal</p>
                  <p className="text-lg font-semibold">${fmt(data.subtotalRevenue)}</p>
                </div>
                {data.totalTax > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Impuestos</p>
                    <p className="text-lg font-semibold text-orange-500">+${fmt(data.totalTax)}</p>
                  </div>
                )}
                {data.totalDiscount > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground uppercase tracking-wide">Descuentos</p>
                    <p className="text-lg font-semibold text-green-500">-${fmt(data.totalDiscount)}</p>
                  </div>
                )}
                <div className="ml-auto">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">Total</p>
                  <p className="text-xl font-bold text-primary">${fmt(data.totalRevenue)}</p>
                </div>
              </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 p-1 bg-muted/30 rounded-xl w-fit">
              {(["resumen", "ordenes", "items"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeTab === tab
                      ? "bg-card shadow text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab === "resumen" ? "Métodos de pago" : tab === "ordenes" ? "Órdenes" : "Items vendidos"}
                </button>
              ))}
            </div>

            {/* Tab: Métodos de pago */}
            {activeTab === "resumen" && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" /> Desglose por método de pago
                </h2>
                {Object.keys(data.byPaymentMethod).length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay ventas para este día.</p>
                ) : (
                  <div className="space-y-3">
                    {Object.entries(data.byPaymentMethod).map(([method, stats]) => {
                      const Icon = PAYMENT_ICONS[method] ?? Banknote
                      const pct = data.totalRevenue > 0 ? (stats.total / data.totalRevenue) * 100 : 0
                      return (
                        <div key={method} className="space-y-1">
                          <div className="flex items-center gap-4 p-4 rounded-xl bg-muted/20 border border-border/30">
                            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-foreground">{PAYMENT_LABELS[method] ?? method}</p>
                              <p className="text-xs text-muted-foreground">
                                {stats.count} órden{stats.count !== 1 ? "es" : ""} · {pct.toFixed(1)}% del total
                              </p>
                            </div>
                            <p className="text-lg font-bold tabular-nums">${fmt(stats.total)}</p>
                          </div>
                          <div className="h-1.5 rounded-full bg-muted/30 overflow-hidden">
                            <div
                              className="h-full bg-primary/60 rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}

                {/* Cash in drawer */}
                {data.byPaymentMethod["cash"] && (
                  <div className="mt-6 p-5 rounded-xl bg-green-500/10 border border-green-500/20">
                    <h3 className="font-semibold text-foreground mb-1 flex items-center gap-2">
                      <Banknote className="w-5 h-5 text-green-500" />
                      Efectivo esperado en caja
                    </h3>
                    <p className="text-3xl font-bold text-green-500">${fmt(data.byPaymentMethod["cash"].total)}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Este monto debe cuadrar con el efectivo físico en caja al cierre del día
                    </p>
                  </div>
                )}
              </div>
            )}

            {/* Tab: Órdenes */}
            {activeTab === "ordenes" && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5" />
                  Todas las órdenes del día
                  <span className="ml-auto text-sm font-normal text-muted-foreground">
                    {data.orders.length} en total
                  </span>
                </h2>
                {data.orders.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay órdenes para este día.</p>
                ) : (
                  <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
                    {data.orders.map((order) => (
                      <OrderRow key={order._id} order={order} timezone={data.timezone} />
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "items" && (
              <div className="glass rounded-2xl p-6">
                <h2 className="font-semibold text-foreground mb-4 flex items-center gap-2">
                  <Tag className="w-5 h-5" /> Productos más vendidos
                </h2>
                {data.topItems.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No hay datos de productos.</p>
                ) : (
                  <div className="space-y-2">
                    {data.topItems.map((item, i) => {
                      const maxQty = data.topItems[0]?.quantity ?? 1
                      const pct = (item.quantity / maxQty) * 100
                      return (
                        <div key={item.name} className="flex items-center gap-4 p-3 rounded-xl bg-muted/20 border border-border/30">
                          <span className="w-6 text-center text-xs font-bold text-muted-foreground shrink-0">
                            {i + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate">{item.name}</p>
                            <div className="mt-1 h-1.5 rounded-full bg-muted/30 overflow-hidden">
                              <div
                                className="h-full bg-primary/50 rounded-full"
                                style={{ width: `${pct}%` }}
                              />
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="font-bold tabular-nums">{item.quantity} uds</p>
                            <p className="text-xs text-muted-foreground">${fmt(item.total)}</p>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {!hasData && (
              <div className="text-center py-16 text-muted-foreground">
                <Receipt className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p className="font-medium">Sin ventas para el {selectedDate}</p>
                <p className="text-sm mt-1">No se encontraron órdenes completadas en este día.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
