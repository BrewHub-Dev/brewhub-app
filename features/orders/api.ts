import api from "@/lib/api"
import type { PaginationMeta } from "@/components/ui/Pagination"

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

export interface PaginatedOrders {
    data: Order[]
    pagination: PaginationMeta
}

const EMPTY_PAGINATION: PaginatedOrders = {
    data: [],
    pagination: { total: 0, page: 1, limit: 20, pages: 0, hasNext: false, hasPrev: false },
}

export async function getOrders(params?: {
    status?: OrderStatus
    BranchId?: string
    page?: number
    limit?: number
}): Promise<PaginatedOrders> {
    try {
        let path = "/orders"
        const query: string[] = []
        if (params?.status) query.push(`status=${params.status}`)
        if (params?.BranchId) query.push(`BranchId=${params.BranchId}`)
        if (params?.page) query.push(`page=${params.page}`)
        if (params?.limit) query.push(`limit=${params.limit}`)
        if (query.length > 0) path += `?${query.join("&")}`

        const response = await api.get(path)
        if (!response || !response.data) return EMPTY_PAGINATION
        return response as PaginatedOrders
    } catch (err) {
        console.error("Error al obtener órdenes:", err)
        return EMPTY_PAGINATION
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

export async function refundOrder(orderId: string): Promise<{ ok: boolean; refund?: unknown }> {
    return api.post(`/orders/${orderId}/refund`, {})
}
