import api from "@/lib/api"

export type PromoCodeType = "percentage" | "fixed" | "buy_x_get_y"
export type PromoTarget = "all" | "items" | "categories"

export interface PromoSchedule {
  dayOfWeek?: number[]
  startTime?: string
  endTime?: string
}

export interface PromoCode {
  _id: string
  code: string
  type: PromoCodeType
  value: number
  description?: string
  shopId: string
  branchId?: string
  target: PromoTarget
  applicableItems?: string[]
  applicableCategories?: string[]
  minOrderAmount?: number
  maxDiscount?: number
  maxUses?: number
  usesCount: number
  perUserLimit?: number
  validFrom?: string
  validUntil?: string
  schedule?: PromoSchedule
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface PromoCodeInput {
  code: string
  type: PromoCodeType
  value: number
  description?: string
  target?: PromoTarget
  applicableItems?: string[]
  applicableCategories?: string[]
  minOrderAmount?: number
  maxDiscount?: number
  maxUses?: number
  perUserLimit?: number
  validFrom?: string
  validUntil?: string
  schedule?: PromoSchedule
  isActive?: boolean
}

export async function getPromoCodes(): Promise<PromoCode[]> {
  try {
    const res = await api.get<PromoCode[]>("/promocodes")
    return Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function getPromoCodeById(id: string): Promise<PromoCode | null> {
  try {
    return await api.get<PromoCode>(`/promocodes/${id}`)
  } catch {
    return null
  }
}

export async function createPromoCode(data: PromoCodeInput): Promise<PromoCode> {
  return api.post<PromoCode>("/promocodes", data)
}

export async function updatePromoCode(id: string, data: Partial<PromoCodeInput>): Promise<PromoCode> {
  return api.patch<PromoCode>(`/promocodes/${id}`, data)
}

export async function deletePromoCode(id: string): Promise<void> {
  await api.del(`/promocodes/${id}`)
}

export interface ApplyPromoCodeInput {
  code: string
  subtotal: number
  items?: { itemId: string; quantity: number; price: number; categoryId?: string }[]
}

export interface ApplyPromoCodeResult {
  valid: boolean
  discount: number
  message: string
}

export async function applyPromoCode(data: ApplyPromoCodeInput): Promise<ApplyPromoCodeResult> {
  try {
    return await api.post<ApplyPromoCodeResult>("/promocodes/apply", data)
  } catch (error: any) {
    return {
      valid: false,
      discount: 0,
      message: error?.message || "Error al aplicar código",
    }
  }
}

export async function validatePromoCode(code: string): Promise<{ valid: boolean; promo?: PromoCode; message?: string }> {
  try {
    return await api.get(`/promocodes/validate/${code}`)
  } catch {
    return { valid: false, message: "Código no válido" }
  }
}
