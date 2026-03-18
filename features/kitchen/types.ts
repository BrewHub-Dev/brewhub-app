export type KitchenOrderStatus = "confirmed" | "preparing" | "ready"

export interface KitchenOrderItem {
  name: string
  quantity: number
  notes?: string
  modifiers?: { name: string; optionName: string }[]
}

export interface KitchenOrder {
  _id: string
  orderNumber: string
  source: "pos" | "app"
  status: KitchenOrderStatus
  items: KitchenOrderItem[]
  guestName?: string
  customer?: { name: string; lastName: string } | null
  notes?: string
  createdAt: string
  confirmedAt?: string
  preparingAt?: string
}
