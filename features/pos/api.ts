import api from "@/lib/api"
import { Item } from "./types"

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
      category: item.category ? {
      id: item.category._id,
      name: item.category.name,
      description: item.category.description,
      isActive: item.category.isActive,
      shopId: item.category.ShopId,
      } : undefined,
      taxIncluded: item.taxIncluded,
      images: item.images,
      modifiers: item.modifiers,
      active: item.active,
    }))
  } catch (err) {
    console.error("Error al obtener items para POS:", err)
    return []
  }
}

export async function processCheckout(data: {
  customer?: string
  items: { id: string; qty: number; price: number }[]
  total: number
}) {
  const response = await api.post("/orders", data)
  return response
}
