import api from "@/lib/api"

const STOCK_ENABLED_KEY = "bh_stock_enabled"

export const STOCK_UNITS = ["kg", "g", "l", "ml", "pcs", "caja", "bolsa", "botella", "lata", "sobre"] as const
export type StockUnit = typeof STOCK_UNITS[number]

export interface StockItem {
  _id: string
  branchId: string
  name: string
  category: string
  unit: StockUnit
  quantity: number
  minQuantity: number
  maxQuantity?: number
  description?: string
  supplier?: string
  cost?: number
  active: boolean
  createdAt?: string
  updatedAt?: string
}

export interface StockItemInput {
  branchId: string
  name: string
  category: string
  unit: StockUnit
  quantity: number
  minQuantity: number
  maxQuantity?: number
  description?: string
  supplier?: string
  cost?: number
}

export interface PaginatedStock {
  data: StockItem[]
  pagination: {
    total: number
    page: number
    limit: number
    pages: number
    hasNext: boolean
    hasPrev: boolean
  }
}

const EMPTY_PAGINATED: PaginatedStock = {
  data: [],
  pagination: { total: 0, page: 1, limit: 50, pages: 0, hasNext: false, hasPrev: false },
}

// ── Shop settings ─────────────────────────────────────────

export async function getStockEnabled(): Promise<boolean> {
  try {
    const shop = await api.get<Record<string, unknown>>("/shops/me")
    if (typeof shop?.stockEnabled === "boolean") {
      localStorage.setItem(STOCK_ENABLED_KEY, String(shop.stockEnabled))
      return shop.stockEnabled
    }
  } catch {}
  try {
    const cached = localStorage.getItem(STOCK_ENABLED_KEY)
    if (cached !== null) return cached === "true"
  } catch {}
  return false
}

export async function setStockEnabled(enabled: boolean): Promise<void> {
  try {
    await api.patch("/shops/settings", { stockEnabled: enabled })
  } catch {}
  try {
    localStorage.setItem(STOCK_ENABLED_KEY, String(enabled))
  } catch {}
}

// ── Stock CRUD ────────────────────────────────────────────

export async function getStockItems(params?: { page?: number; limit?: number; branchId?: string }): Promise<PaginatedStock> {
  try {
    const qs = new URLSearchParams()
    if (params?.page) qs.set("page", String(params.page))
    qs.set("limit", String(params?.limit ?? 50))
    if (params?.branchId) qs.set("branchId", params.branchId)
    const res = await api.get<PaginatedStock>(`/stock?${qs}`)
    return res ?? EMPTY_PAGINATED
  } catch {
    return EMPTY_PAGINATED
  }
}

export async function getLowStockItems(): Promise<StockItem[]> {
  try {
    const res = await api.get<StockItem[]>("/stock/low")
    return Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function createStockItem(data: StockItemInput): Promise<StockItem> {
  return api.post<StockItem>("/stock", data)
}

export async function updateStockItem(id: string, data: Partial<StockItemInput>): Promise<StockItem> {
  return api.patch<StockItem>(`/stock/${id}`, data)
}

export async function deleteStockItem(id: string): Promise<void> {
  await api.del(`/stock/${id}`)
}

export async function adjustStockQuantity(id: string, delta: number): Promise<StockItem> {
  return api.patch<StockItem>(`/stock/${id}/adjust`, { delta })
}
