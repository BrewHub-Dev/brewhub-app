import api from "@/lib/api"
import type { Order, OrderStatus } from "@/features/orders/api"

export type { Order, OrderStatus }

export async function verifyQRHash(qrTokenHash: string): Promise<Order> {
  const { data } = await api.post("/orders/verify-qr-hash", { qrTokenHash })
  return data
}

export async function updateOrderStatus(
  orderId: string,
  status: OrderStatus
): Promise<Order> {
  const { data } = await api.patch(`/orders/${orderId}/status`, { status })
  return data
}
