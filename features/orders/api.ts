import api from "@/lib/api"

export type OrderStatus = "pending" | "confirmed" | "preparing" | "ready" | "completed" | "cancelled"

export interface OrderItem {
    itemId: string
    name: string
    quantity: number
    price: number
    modifiers?: { name: string; optionName: string }[]
    itemTotal: number
}

export interface Order {
    _id: string
    orderNumber: string
    ShopId: string
    BranchId?: string
    customerId?: string
    guestName?: string
    source: "app" | "pos"
    items: OrderItem[]
    subtotal: number
    tax: number
    total: number
    status: OrderStatus
    paymentMethod?: string
    paymentStatus?: string
    notes?: string
    createdAt: string
    updatedAt?: string
    branch?: { _id: string; name: string }
    branchName?: string
    customer?: { _id: string; name: string; lastName: string }
}

export async function getOrders(params?: {
    status?: OrderStatus
    BranchId?: string
}): Promise<Order[]> {
    try {
        let path = "/orders"
        const query: string[] = []
        if (params?.status) query.push(`status=${params.status}`)
        if (params?.BranchId) query.push(`BranchId=${params.BranchId}`)
        if (query.length > 0) path += `?${query.join("&")}`

        const response = await api.get(path)
        if (!response) return []
        return Array.isArray(response) ? response : []
    } catch (err) {
        console.error("Error al obtener órdenes:", err)
        return []
    }
}

export async function getOrderById(orderId: string): Promise<Order | null> {
    try {
        const response = await api.get(`/orders/${orderId}`)
        return response ?? null
    } catch (err) {
        console.error("Error al obtener orden:", err)
        return null
    }
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
    status: OrderStatus,
    notes?: string
): Promise<Order> {
    const endpoint = STATUS_TO_ENDPOINT[status]
    if (!endpoint) throw new Error(`No transition endpoint for status: ${status}`)
    return api.patch(`/orders/${orderId}/${endpoint}`, notes ? { notes } : {})
}
