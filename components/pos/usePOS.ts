"use client"

import { useMemo, useState } from "react"

export type Item = { id: string; name: string; price: number }
export type Scanned = { item: Item; qty: number }

const SAMPLE_ITEMS: Item[] = [
  { id: "001", name: "Americano", price: 1.8 },
  { id: "002", name: "Latte", price: 2.5 },
  { id: "003", name: "Cappuccino", price: 2.3 },
  { id: "004", name: "Croissant", price: 1.2 },
]

export function usePOS(initialItems: Item[] = SAMPLE_ITEMS) {
  const [query, setQuery] = useState("")
  const [scanned, setScanned] = useState<Scanned[]>([])
  const [customer, setCustomer] = useState("")

  const suggestions = useMemo(() => {
    if (!query) return initialItems
    return initialItems.filter((i) => i.name.toLowerCase().includes(query.toLowerCase()) || i.id.includes(query))
  }, [query, initialItems])

  const addItem = (item: Item) => {
    setScanned((s) => {
      const exists = s.find((x) => x.item.id === item.id)
      if (exists) return s.map((x) => (x.item.id === item.id ? { ...x, qty: x.qty + 1 } : x))
      return [...s, { item, qty: 1 }]
    })
    setQuery("")
  }

  const removeItem = (id: string) => setScanned((s) => s.filter((x) => x.item.id !== id))
  const changeQty = (id: string, qty: number) => setScanned((s) => s.map((x) => (x.item.id === id ? { ...x, qty: Math.max(1, qty) } : x)))
  const clear = () => {
    setScanned([])
    setCustomer("")
  }

  const subtotal = scanned.reduce((sum, it) => sum + it.item.price * it.qty, 0)
  const tax = +(subtotal * 0.08).toFixed(2)
  const total = +(subtotal + tax).toFixed(2)

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
    subtotal,
    tax,
    total,
  }
}
