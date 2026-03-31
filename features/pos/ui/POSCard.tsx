"use client"

import { DndContext, MouseSensor, TouchSensor, useSensor, useSensors } from '@dnd-kit/core'
import { useQuery } from "@tanstack/react-query"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/Select"
import {
  Camera,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Banknote,
  CreditCard,
  ArrowLeftRight,
  ShoppingBag,
} from "lucide-react"
import { usePOS } from "./usePOS"
import { getBranches, getPOSItems } from "../api"
import ItemSuggestion from "./ItemSuggestion"
import ScannedList from "./ScannedList"
import ModifierModal from "./ModifierModal"
import { StripePaymentModal } from "./StripePaymentModal"
import type { PaymentMethod, SelectedModifier } from "../types"
import { useState } from "react"

const PAYMENT_METHODS: { value: PaymentMethod; label: string; icon: React.ElementType }[] = [
  { value: "cash", label: "Efectivo", icon: Banknote },
  { value: "card", label: "Tarjeta", icon: CreditCard },
  { value: "transfer", label: "Transferencia", icon: ArrowLeftRight },
]

export default function POSCard() {
  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["pos-items"],
    queryFn: getPOSItems,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  })

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ["pos-branches"],
    queryFn: getBranches,
    staleTime: 10 * 60_000,
    refetchOnWindowFocus: false,
  })

  const {
    query,
    setQuery,
    suggestions,
    scanned,
    addItem,
    removeItem,
    changeQty,
    clear,
    customer,
    setCustomer,
    email,
    setEmail,
    branchId,
    setBranchId,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    tax,
    total,
    checkout,
    checkoutCard,
    finishCardPayment,
    isCheckingOut,
    lastOrder,
    setLastOrder,
    error,
    setError,
  } = usePOS(items)

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  const [selectedItemForMod, setSelectedItemForMod] = useState<any>(null)
  const [stripeData, setStripeData] = useState<{
    clientSecret: string
    orderId: string
    orderNumber: string
    orderTotal: number
    customerEmail: string
  } | null>(null)

  async function handleCobrar() {
    if (paymentMethod === "card") {
      try {
        const { order, clientSecret } = await checkoutCard()
        setStripeData({ clientSecret, orderId: order._id, orderNumber: order.orderNumber, orderTotal: order.total, customerEmail: email })
      } catch {
        // error already set in usePOS
      }
    } else {
      checkout()
    }
  }

  function handleAddItemClick(item: any) {
    if (item.modifiers && item.modifiers.length > 0) {
      setSelectedItemForMod(item)
    } else {
      addItem(item)
    }
  }

  function handleDragEnd(event: any) {
    const { active, over } = event
    if (!over) return
    if (over.id !== 'scanned') return
    const aid: string = active.id
    if (!aid) return
    if (aid.startsWith('item:')) {
      const itemId = aid.split(':')[1]
      const item = suggestions.find((i) => i.id === itemId)
      if (item) handleAddItemClick(item)
    }
  }

  if (loadingItems) {
    return (
      <div className="rounded-2xl p-6 glass border shadow-lg w-full flex items-center justify-center min-h-[300px]">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="w-8 h-8 animate-spin" />
          <span>Cargando productos...</span>
        </div>
      </div>
    )
  }

  if (lastOrder) {
    return (
      <div className="rounded-2xl p-8 glass border shadow-lg w-full flex flex-col items-center justify-center min-h-[400px] gap-4">
        <div className="w-20 h-20 rounded-full bg-green-500/20 flex items-center justify-center">
          <CheckCircle2 className="w-10 h-10 text-green-500" />
        </div>
        <div className="text-center">
          <h3 className="text-2xl font-bold text-foreground">¡Venta completada!</h3>
          <p className="text-muted-foreground mt-1">Orden #{lastOrder.orderNumber}</p>
          <p className="text-3xl font-bold text-primary mt-3">${lastOrder.total.toFixed(2)}</p>
        </div>
        <Button onClick={() => setLastOrder(null)} className="mt-4 px-8">
          Nueva venta
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-2xl p-6 glass border shadow-lg w-full">
      <div className="flex items-center gap-2 mb-4">
        <ShoppingBag className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-semibold">Punto de Venta (POS)</h3>
      </div>

      {error && (
        <div className="mb-4 flex items-center gap-2 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
          <button onClick={() => setError(null)} className="ml-auto"><X className="w-4 h-4" /></button>
        </div>
      )}

      <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          <div className="flex flex-col gap-3">

            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">
                Sucursal
              </label>
              <Select
                value={branchId}
                onChange={setBranchId}
                disabled={loadingBranches}
                placeholder={loadingBranches ? "Cargando..." : "Selecciona una sucursal"}
                options={branches.map((b) => ({ value: b.id, label: b.name }))}
              />
            </div>

            {/* Cliente */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Cliente (opcional)</label>
              <Input
                placeholder="Nombre del cliente"
                value={customer}
                onChange={(e) => setCustomer(e.target.value)}
                className="bg-muted/20 border"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Email del cliente (opcional)</label>
              <Input
                type="email"
                placeholder="correo@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-muted/20 border"
              />
            </div>

            {/* Search */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-1 block">Buscar producto</label>
              <div className="flex items-center gap-2">
                <div className="relative flex-1">
                  <Input
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Nombre, SKU o código de barras"
                    className="bg-muted/20 border"
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && suggestions[0]) handleAddItemClick(suggestions[0])
                    }}
                  />
                  <button type="button" className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground" title="Escanear">
                    <Camera className="w-5 h-5" />
                  </button>
                </div>
                <Button
                  type="button"
                  onClick={() => { if (suggestions[0]) handleAddItemClick(suggestions[0]) }}
                  className="h-10 px-4"
                  variant="secondary"
                >
                  + Agregar
                </Button>
              </div>
            </div>

            {/* Products grid */}
            {items.length === 0 ? (
              <div className="p-4 rounded-lg bg-muted/10 border border-border/20 text-center text-sm text-muted-foreground">
                No hay productos registrados. Agrega items desde el módulo de Items.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto pr-1">
                {suggestions.slice(0, 12).map((it) => (
                  <ItemSuggestion key={it.id} item={it} onAdd={handleAddItemClick} />
                ))}
              </div>
            )}

            {/* Payment method */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 block">
                Método de pago
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PAYMENT_METHODS.map(({ value, label, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setPaymentMethod(value)}
                    className={`flex flex-col items-center gap-1 p-3 rounded-xl border text-sm font-medium transition-all ${paymentMethod === value
                      ? "bg-primary/20 border-primary/50 text-primary shadow-sm shadow-primary/20"
                      : "bg-muted/20 border-border text-muted-foreground hover:bg-muted/40"
                      }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs">{label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: Cart + Totals */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Carrito ({scanned.length} item{scanned.length !== 1 ? 's' : ''})
              </span>
              <button onClick={clear} className="text-xs text-muted-foreground hover:text-destructive flex items-center gap-1 transition-colors">
                <X className="w-3 h-3" />Limpiar
              </button>
            </div>

            <ScannedList scanned={scanned} onRemove={removeItem} onChangeQty={changeQty} onAdd={addItem} />

            <div className="mt-auto p-4 rounded-xl bg-muted/20 border border-border/30 space-y-2">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t border-border/30 pt-2 mt-2">
                <span>Total</span>
                <span className="text-primary">${total.toFixed(2)}</span>
              </div>

              <div className="flex gap-2 pt-1">
                <Button
                  onClick={handleCobrar}
                  disabled={isCheckingOut || scanned.length === 0}
                  className="flex-1 h-11 text-sm font-semibold bg-primary text-primary-foreground"
                >
                  {isCheckingOut ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" />Procesando...</>
                  ) : paymentMethod === "card" ? (
                    `Cobrar con tarjeta $${total.toFixed(2)}`
                  ) : (
                    `Cobrar $${total.toFixed(2)}`
                  )}
                </Button>
                <Button
                  onClick={clear}
                  variant="ghost"
                  className="h-11"
                  disabled={isCheckingOut}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          </div>

        </div>
      </DndContext>

      {selectedItemForMod && (
        <ModifierModal
          item={selectedItemForMod}
          onClose={() => setSelectedItemForMod(null)}
          onAdd={(item, modifiers) => {
            addItem(item, modifiers)
            setSelectedItemForMod(null)
          }}
        />
      )}

      {stripeData && (
        <StripePaymentModal
          clientSecret={stripeData.clientSecret}
          orderId={stripeData.orderId}
          orderNumber={stripeData.orderNumber}
          total={stripeData.orderTotal}
          customerEmail={stripeData.customerEmail}
          onSuccess={(orderNumber) => {
            setStripeData(null)
            finishCardPayment(orderNumber, stripeData.orderTotal)
          }}
          onCancel={() => setStripeData(null)}
        />
      )}
    </div>
  )
}
