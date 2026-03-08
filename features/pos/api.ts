import api from "@/lib/api"
import { Item, PaymentMethod, SelectedModifier } from "./types"

export async function getPOSItems(): Promise<Item[]> {
  try {
    const response = await api.get("/items")

    if (!response) return []

    const data = Array.isArray(response) ? response : []

    return data.map((item: any) => ({
      id: item._id,
      name: item.name,
      price: item.price,
      code: item.sku || item.barcode,
      description: item.description,
      images: item.images,
      taxIncluded: item.taxIncluded,
      modifiers: item.modifiers,
      active: item.active,
      category: item.category ? {
        id: item.category._id,
        name: item.category.name,
        description: item.category.description,
        isActive: item.category.isActive,
        shopId: item.category.ShopId,
      } : undefined,
    }))
  } catch (err) {
    console.error("Error al obtener items para POS:", err)
    return []
  }
}

export async function getBranches(): Promise<{ id: string; name: string }[]> {
  try {
    const response = await api.get("/branches")
    if (!response) return []
    const data = Array.isArray(response) ? response : []
    return data.map((b: any) => ({ id: b._id, name: b.name }))
  } catch (err) {
    console.error("Error al obtener sucursales para POS:", err)
    return []
  }
}

export interface CheckoutPayload {
  BranchId: string
  guestName?: string
  customerId?: string
  items: {
    itemId: string
    quantity: number
    modifiers?: { name: string; optionName: string }[]
    notes?: string
  }[]
  paymentMethod: PaymentMethod
  paymentStatus: "paid" | "pending"
  discount?: number
  notes?: string
}

export interface CheckoutResult {
  ok: boolean
  order: {
    _id: string
    orderNumber: string
    total: number
    status: string
  }
}

export async function processCheckout(payload: CheckoutPayload): Promise<CheckoutResult> {
  const response = await api.post("/orders/pos", payload)
  return response
}
