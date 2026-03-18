import api from "@/lib/api"
import type { Order, OrderStatus } from "@/features/orders/api"

export type { Order, OrderStatus }

export async function verifyQRHash(qrTokenHash: string): Promise<Order> {
  return api.post("/orders/verify-qr-hash", { qrTokenHash })
}

const STATUS_TO_ENDPOINT: Partial<Record<OrderStatus, string>> = {
  confirmed: "confirm",
  preparing: "prepare",
  ready: "ready",
  completed: "complete",
  cancelled: "cancel",
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const endpoint = STATUS_TO_ENDPOINT[status]
  if (!endpoint) throw new Error(`No transition endpoint for status: ${status}`)
  return api.patch(`/orders/${orderId}/${endpoint}`, {})
}
