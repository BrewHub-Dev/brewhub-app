export type Item = { 
  id: string
  name: string
  price: number
  code?: string
  sku?: string
  barcode?: string
}

export type Scanned = { 
  item: Item
  qty: number
}

export interface POSState {
  query: string
  scanned: Scanned[]
  customer: string
  subtotal: number
  tax: number
  total: number
}
