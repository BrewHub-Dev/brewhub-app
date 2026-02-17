export interface ItemModifierOption {
  name: string
  extraPrice: number
}

export interface ItemModifier {
  name: string
  required: boolean
  options: ItemModifierOption[]
}

export interface Item {
  _id: string
  name: string
  description?: string
  sku: string
  barcode: string
  ShopId: string
  price: number
  cost?: number
  active: boolean
  categoryId: string
  taxIncluded?: boolean
  images?: string[]
  modifiers?: ItemModifier[]
  stock?: number
  id?: string
  code?: string
  category?: {
    _id?: string
    name?: string
    description?: string
    isActive: boolean
    ShopId?: string
  }
  image?: string
}

export interface ItemFormData {
  name: string
  code: string
  price: number
  categoryId: string
  stock: number
  description?: string
}

export interface ItemsStats {
  totalItems: number
  averagePrice: number
  totalCategories: number
}
