"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Html5Qrcode } from "html5-qrcode"
import { verifyQRHash, updateOrderStatus } from "../api"
import type { Order, OrderStatus } from "../api"
import {
  Camera,
  CheckCircle2,
  XCircle,
  Clock,
  ChefHat,
  Package,
  Loader2,
  RotateCcw,
  ScanLine,
  AlertCircle,
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

const NEXT_STATUS_LABEL: Partial<Record<OrderStatus, string>> = {
  pending: "Confirmar orden",
  confirmed: "Iniciar preparación",
  preparing: "Marcar como listo",
  ready: "Completar orden",
}

function formatTime(dateString: string) {
  const d = new Date(dateString)
  return d.toLocaleString("es-MX", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })
}

type ScanState =
  | { phase: "scanning" }
  | { phase: "loading" }
  | { phase: "found"; order: Order }
  | { phase: "success"; order: Order }
  | { phase: "error"; message: string }

export default function QRScannerView() {
  const [state, setState] = useState<ScanState>({ phase: "scanning" })
  const scannerRef = useRef<Html5Qrcode | null>(null)
  const scannerContainerId = "qr-reader"
  const queryClient = useQueryClient()

  const stopScanner = useCallback(async () => {
    try {
      const scanner = scannerRef.current
      if (scanner) {
        const scannerState = scanner.getState()
        if (scannerState === 2) { // SCANNING
          await scanner.stop()
        }
      }
    } catch {
      // ignore stop errors
    }
  }, [])

  const startScanner = useCallback(async () => {
    await stopScanner()

    const scanner = new Html5Qrcode(scannerContainerId)
    scannerRef.current = scanner

    try {
      await scanner.start(
        { facingMode: "environment" },
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1,
        },
        async (decodedText) => {
          await stopScanner()
          setState({ phase: "loading" })

          try {
            const order = await verifyQRHash(decodedText)
            setState({ phase: "found", order })
          } catch (err) {
            setState({
              phase: "error",
              message: (err as Error).message || "No se pudo verificar el QR",
            })
          }
        },
        () => {} // ignore scan errors (no QR in frame)
      )
    } catch (err) {
      setState({
        phase: "error",
        message: "No se pudo acceder a la cámara. Verifica los permisos del navegador.",
      })
    }
  }, [stopScanner])

  useEffect(() => {
    if (state.phase === "scanning") {
      startScanner()
    }
    return () => {
      stopScanner()
    }
  }, [state.phase, startScanner, stopScanner])

  const advanceMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: OrderStatus }) =>
      updateOrderStatus(id, status),
    onSuccess: (updatedOrder) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      setState({ phase: "success", order: updatedOrder })
    },
    onError: (err) => {
      setState({
        phase: "error",
        message: (err as Error).message || "Error al actualizar la orden",
      })
    },
  })

  const handleScanAnother = () => {
    setState({ phase: "scanning" })
  }

  return (
    <div className="p-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <ScanLine className="w-8 h-8 text-primary" />
            Escanear QR
          </h1>
          <p className="text-muted-foreground mt-1">
            Escanea el código QR del cliente para verificar y avanzar su orden
          </p>
        </div>

        {state.phase === "scanning" && (
          <div className="rounded-xl border border-border/50 bg-card/30 glass overflow-hidden">
            <div className="p-4 border-b border-border/30 flex items-center gap-2">
              <Camera className="w-4 h-4 text-primary" />
              <span className="text-sm font-medium">Cámara activa</span>
            </div>
            <div className="p-4 flex justify-center">
              <div
                id={scannerContainerId}
                className="w-full max-w-[350px] rounded-lg overflow-hidden"
              />
            </div>
            <div className="p-4 border-t border-border/30 text-center">
              <p className="text-sm text-muted-foreground">
                Apunta la cámara al código QR de la orden del cliente
              </p>
            </div>
          </div>
        )}

        {state.phase === "loading" && (
          <div className="rounded-xl border border-border/50 bg-card/30 glass p-12 flex flex-col items-center gap-4">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Verificando QR...</p>
          </div>
        )}

        {state.phase === "found" && (
          <OrderCard
            order={state.order}
            onAdvance={(status) =>
              advanceMutation.mutate({ id: state.order._id, status })
            }
            isAdvancing={advanceMutation.isPending}
            onScanAnother={handleScanAnother}
          />
        )}

        {state.phase === "success" && (
          <div className="rounded-xl border border-green-500/30 bg-green-500/10 p-8 flex flex-col items-center gap-4">
            <CheckCircle2 className="w-12 h-12 text-green-500" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Orden actualizada</p>
              <p className="text-sm text-muted-foreground mt-1">
                #{state.order.orderNumber} &rarr;{" "}
                {STATUS_CONFIG[state.order.status as OrderStatus]?.label ?? state.order.status}
              </p>
            </div>
            <Button onClick={handleScanAnother} className="gap-2 mt-2">
              <RotateCcw className="w-4 h-4" />
              Escanear otra orden
            </Button>
          </div>
        )}

        {state.phase === "error" && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-8 flex flex-col items-center gap-4">
            <AlertCircle className="w-12 h-12 text-red-500" />
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Error</p>
              <p className="text-sm text-muted-foreground mt-1">{state.message}</p>
            </div>
            <Button onClick={handleScanAnother} variant="outline" className="gap-2 mt-2">
              <RotateCcw className="w-4 h-4" />
              Reintentar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

function OrderCard({
  order,
  onAdvance,
  isAdvancing,
  onScanAnother,
}: {
  order: Order
  onAdvance: (status: OrderStatus) => void
  isAdvancing: boolean
  onScanAnother: () => void
}) {
  const status = order.status as OrderStatus
  const cfg = STATUS_CONFIG[status]
  const StatusIcon = cfg.icon
  const nextStatus = NEXT_STATUS[status]
  const nextLabel = NEXT_STATUS_LABEL[status]

  return (
    <div className="rounded-xl border border-border/50 bg-card/30 glass overflow-hidden">
      <div className="p-5 border-b border-border/30">
        <div className="flex items-center justify-between mb-3">
          <p className="text-lg font-mono font-bold text-foreground">#{order.orderNumber}</p>
          <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${cfg.color}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            {cfg.label}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>{formatTime(order.createdAt)}</span>
          <span>{order.source === "pos" ? "POS" : "App"}</span>
          {order.branchName && <span>{order.branchName}</span>}
        </div>
        {(order.customer || order.guestName) && (
          <p className="text-sm font-medium text-foreground mt-2">
            {order.customer
              ? `${order.customer.name} ${order.customer.lastName}`
              : order.guestName}
          </p>
        )}
      </div>

      <div className="p-5 border-b border-border/30">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3">
          Items ({order.items?.length ?? 0})
        </p>
        <div className="space-y-2">
          {(order.items ?? []).map((item, idx) => (
            <div key={idx} className="flex justify-between text-sm">
              <span className="text-foreground">
                {item.quantity}x {item.name}
                {item.modifiers && item.modifiers.length > 0 && (
                  <span className="text-muted-foreground ml-1">
                    ({item.modifiers.map((m) => m.optionName).join(", ")})
                  </span>
                )}
              </span>
              <span className="text-muted-foreground">${item.itemTotal.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="p-5 border-b border-border/30">
        <div className="flex justify-between text-sm mb-1">
          <span className="text-muted-foreground">Subtotal</span>
          <span>${order.subtotal.toFixed(2)}</span>
        </div>
        {order.tax > 0 && (
          <div className="flex justify-between text-sm mb-1">
            <span className="text-muted-foreground">Impuesto</span>
            <span>${order.tax.toFixed(2)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold mt-2 pt-2 border-t border-border/20">
          <span>Total</span>
          <span className="text-primary">${order.total.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-xs text-muted-foreground mt-1">
          <span>Pago: {order.paymentMethod ?? "N/A"}</span>
          <span className="capitalize">{order.paymentStatus ?? "pendiente"}</span>
        </div>
      </div>

      <div className="p-5 flex gap-3">
        {nextStatus ? (
          <Button
            onClick={() => onAdvance(nextStatus)}
            disabled={isAdvancing}
            className="flex-1 gap-2"
          >
            {isAdvancing ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            {nextLabel}
          </Button>
        ) : (
          <div className="flex-1 text-center text-sm text-muted-foreground py-2">
            Esta orden ya está {cfg.label.toLowerCase()}
          </div>
        )}
        <Button variant="outline" onClick={onScanAnother} className="gap-2">
          <RotateCcw className="w-4 h-4" />
          Escanear otra
        </Button>
      </div>
    </div>
  )
}
