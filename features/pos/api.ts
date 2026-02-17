import { Item } from "./types"

export async function getItems(): Promise<Item[]> {
  return [
    { id: "001", name: "Americano", price: 1.8, code: "001" },
    { id: "002", name: "Latte", price: 2.5, code: "002" },
    { id: "003", name: "Cappuccino", price: 2.3, code: "003" },
    { id: "004", name: "Croissant", price: 1.2, code: "004" },
  ]
}

export async function processCheckout(data: {
  customer?: string
  items: { id: string; qty: number; price: number }[]
  total: number
}) {
  console.log("Procesando venta:", data)
  return { success: true, orderId: `ORD-${Date.now()}` }
}
