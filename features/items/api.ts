import { Item, ItemFormData } from "./types"
import api, { BASE } from "@/lib/api";
import type { PaginationMeta } from "@/components/ui/Pagination"

export interface PaginatedItems {
  data: Item[]
  pagination: PaginationMeta
}

const EMPTY_PAGINATION: PaginatedItems = {
  data: [],
  pagination: { total: 0, page: 1, limit: 20, pages: 0, hasNext: false, hasPrev: false },
}

export async function getItems(params?: { page?: number; limit?: number }): Promise<PaginatedItems> {
  try {
    let path = "/items"
    const query: string[] = []
    if (params?.page) query.push(`page=${params.page}`)
    if (params?.limit) query.push(`limit=${params.limit}`)
    if (query.length > 0) path += `?${query.join("&")}`

    const response = await api.get(path);

    if (!response || !response.data) return EMPTY_PAGINATION

    const mapped = response.data.map((item: any) => ({
      ...item,
      id: item._id,
      code: item.sku || item.barcode,
      image: item.images?.[0],
    }));

    return { data: mapped, pagination: response.pagination };
  } catch (err) {
    console.error("Error al obtener items:", err);
    return EMPTY_PAGINATION;
  }
}



export async function uploadItemImage(file: File): Promise<{ url: string; publicId: string }> {
  const token = typeof window !== "undefined" ? localStorage.getItem("bh_token") : null
  const rawUser = typeof window !== "undefined" ? localStorage.getItem("bh_user") : null
  const user = rawUser ? JSON.parse(rawUser) : null
  const tenantId = user?.ShopId ?? user?.tenantId ?? null

  const formData = new FormData()
  formData.append("file", file)

  const headers: Record<string, string> = {}
  if (token) headers["Authorization"] = `Bearer ${token}`
  if (tenantId) headers["X-Tenant-Id"] = tenantId

  const url = `${BASE.replace(/\/+$/, "")}/upload/image`
  const res = await fetch(url, { method: "POST", credentials: "include", headers, body: formData })

  const data = await res.json()
  if (!res.ok) throw new Error(data.error || "Error al subir imagen")
  return data as { url: string; publicId: string }
}

export async function createItem(data: ItemFormData): Promise<Item> {
  try {
    const itemData = {
      name: data.name,
      description: data.description,
      sku: data.code,
      barcode: data.code,
      price: data.price,
      cost: data.cost,
      categoryId: data.categoryId,
      active: data.active,
      taxIncluded: data.taxIncluded,
      images: data.images,
      modifiers: data.modifiers,
    }

    const response = await api.post("/items", itemData)

    return {
      ...response,
      id: response._id,
      code: response.sku || response.barcode,
      image: response.images?.[0],
    }
  } catch (err) {
    console.error("Error al crear item:", err)
    throw err
  }
}

export async function updateItem(id: string, data: Partial<ItemFormData>): Promise<Item> {
  try {
    const itemData: Record<string, unknown> = {}
    if (data.name !== undefined) itemData.name = data.name
    if (data.description !== undefined) itemData.description = data.description
    if (data.code !== undefined) { itemData.sku = data.code; itemData.barcode = data.code }
    if (data.price !== undefined) itemData.price = data.price
    if (data.cost !== undefined) itemData.cost = data.cost
    if (data.categoryId !== undefined) itemData.categoryId = data.categoryId
    if (data.active !== undefined) itemData.active = data.active
    if (data.taxIncluded !== undefined) itemData.taxIncluded = data.taxIncluded
    if (data.images !== undefined) itemData.images = data.images
    if (data.modifiers !== undefined) itemData.modifiers = data.modifiers

    const response = await api.patch(`/items/${id}`, itemData)

    return {
      ...response,
      id: response._id,
      code: response.sku || response.barcode,
      image: response.images?.[0],
    }
  } catch (err) {
    console.error("Error al actualizar item:", err)
    throw err
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    console.log("Eliminando item:", id)
    await api.del(`/items/${id}`)
    console.log("Item eliminado exitosamente")
  } catch (err) {
    console.error("Error al eliminar item:", err)
    throw err
  }
}

export interface Category {
  _id: string
  id?: string
  name: string
  description?: string
  isActive: boolean
  ShopId: string
}

export async function getCategories(): Promise<Category[]> {
  try {
    const response = await api.get("/categories")
    console.log("Categorías obtenidas:", response)

    if (!response) return []

    const data = Array.isArray(response) ? response : []

    return data.map((cat: any) => ({
      ...cat,
      id: cat._id,
    }))
  } catch (err) {
    console.error("Error al obtener categorías:", err)

    try {
      const items = await api.get("/items")
      if (Array.isArray(items)) {
        const uniqueCategories = new Map<string, Category>()

        items.forEach((item: any) => {
          if (item.category && typeof item.category === 'object') {
            uniqueCategories.set(item.category._id, {
              _id: item.category._id,
              id: item.category._id,
              name: item.category.name,
              description: item.category.description,
              isActive: item.category.isActive,
              ShopId: item.category.ShopId,
            })
          }
        })

        return Array.from(uniqueCategories.values())
      }
    } catch (fallbackErr) {
      console.error("Error en fallback de categorías:", fallbackErr)
    }

    return []
  }
}
