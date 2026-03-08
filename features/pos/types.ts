export type PaymentMethod = "cash" | "card" | "transfer"

export interface Modifier {
  name: string
  required: boolean
  options: { name: string; extraPrice: number }[]
}

export type Item = {
  id: string
  name: string
  price: number
  code?: string
  sku?: string
  barcode?: string
  description?: string
  images?: string[]
  taxIncluded?: boolean
  modifiers?: Modifier[]
  category?: {
    id: string
    name: string
    description?: string
    isActive?: boolean
    shopId?: string
  }
  active?: boolean
}

export type SelectedModifier = {
  name: string
  optionName: string
  extraPrice: number
}

export type Scanned = {
  item: Item
  qty: number
  selectedModifiers?: SelectedModifier[]
  notes?: string
}

export interface POSState {
  query: string
  scanned: Scanned[]
  customer: string
  branchId: string
  paymentMethod: PaymentMethod
  subtotal: number
  tax: number
  total: number
}
