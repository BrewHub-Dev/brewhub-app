"use client"

import { useMemo, useState, useCallback } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import type { Item, Scanned, PaymentMethod, SelectedModifier } from "../types"
import { processCheckout } from "../api"

export function usePOS(items: Item[]) {
  const queryClient = useQueryClient()
  const [query, setQuery] = useState("")
  const [scanned, setScanned] = useState<Scanned[]>([])
  const [customer, setCustomer] = useState("")
  const [branchId, setBranchId] = useState("")
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash")
  const [lastOrder, setLastOrder] = useState<{ orderNumber: string; total: number } | null>(null)
  const [validationError, setValidationError] = useState<string | null>(null)

  const suggestions = useMemo(() => {
    if (!query) return items
    const q = query.toLowerCase()
    return items.filter(
      (i) =>
        i.name.toLowerCase().includes(q) ||
        i.id?.includes(query) ||
        i.code?.includes(query) ||
        i.category?.name.toLowerCase().includes(q)
    )
  }, [query, items])

  const addItem = useCallback((item: Item, modifiers?: SelectedModifier[]) => {
    setScanned((s) => {
      const exists = s.find((x) => x.item.id === item.id)
      if (exists && (!modifiers || modifiers.length === 0)) {
        return s.map((x) => (x.item.id === item.id ? { ...x, qty: x.qty + 1 } : x))
      }
      return [...s, { item, qty: 1, selectedModifiers: modifiers ?? [] }]
    })
    setQuery("")
  }, [])

  const removeItem = useCallback(
    (id: string) => setScanned((s) => s.filter((x) => x.item.id !== id)),
    []
  )

  const changeQty = useCallback(
    (id: string, qty: number) =>
      setScanned((s) => s.map((x) => (x.item.id === id ? { ...x, qty: Math.max(1, qty) } : x))),
    []
  )

  const clear = useCallback(() => {
    setScanned([])
    setCustomer("")
    setLastOrder(null)
    setValidationError(null)
    checkoutMutation.reset()
  }, [])

  const subtotal = scanned.reduce((sum, it) => {
    const modExtra = (it.selectedModifiers ?? []).reduce((s, m) => s + m.extraPrice, 0)
    return sum + (it.item.price + modExtra) * it.qty
  }, 0)

  const tax = +(
    scanned.reduce((sum, it) => {
      if (it.item.taxIncluded) return sum
      const modExtra = (it.selectedModifiers ?? []).reduce((s, m) => s + m.extraPrice, 0)
      return sum + (it.item.price + modExtra) * it.qty * 0.16
    }, 0)
  ).toFixed(2)

  const total = +(subtotal + tax).toFixed(2)

  const checkoutMutation = useMutation({
    mutationFn: processCheckout,
    onSuccess: (result) => {
      if (result.ok) {
        setLastOrder({
          orderNumber: result.order.orderNumber,
          total: result.order.total,
        })
        setScanned([])
        setCustomer("")
        setValidationError(null)
        queryClient.invalidateQueries({ queryKey: ["orders"] })
      }
    },
  })

  const error =
    validationError ??
    (checkoutMutation.error instanceof Error
      ? checkoutMutation.error.message
      : checkoutMutation.error
        ? String(checkoutMutation.error)
        : null)

  const setError = useCallback(
    (e: string | null) => {
      setValidationError(e)
      if (!e) checkoutMutation.reset()
    },
    [checkoutMutation]
  )

  const checkout = useCallback(() => {
    if (scanned.length === 0) {
      setValidationError("Agrega al menos un producto al carrito.")
      return
    }
    if (!branchId) {
      setValidationError("Selecciona una sucursal antes de cobrar.")
      return
    }
    setValidationError(null)
    checkoutMutation.mutate({
      BranchId: branchId,
      guestName: customer || undefined,
      items: scanned.map((s) => ({
        itemId: s.item.id,
        quantity: s.qty,
        modifiers: (s.selectedModifiers ?? []).map((m) => ({
          name: m.name,
          optionName: m.optionName,
        })),
      })),
      paymentMethod,
      paymentStatus: "paid",
    })
  }, [scanned, branchId, customer, paymentMethod, checkoutMutation])

  return {
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
    branchId,
    setBranchId,
    paymentMethod,
    setPaymentMethod,
    subtotal,
    tax,
    total,
    checkout,
    isCheckingOut: checkoutMutation.isPending,
    lastOrder,
    setLastOrder,
    error,
    setError,
  }
}
