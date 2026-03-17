import api from "@/lib/api"
import type { Order } from "@/features/orders/api"

export async function verifyQRHash(qrTokenHash: string): Promise<Order> {
    return api.post("/orders/verify-qr-hash", { qrTokenHash })
}

