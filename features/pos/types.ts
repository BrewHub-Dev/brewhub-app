export type Item = { 
  id: string
  name: string
  price: number
  code?: string
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
