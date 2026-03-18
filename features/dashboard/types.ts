import type { LucideIcon } from "lucide-react"

export interface DashboardStats {
  title: string
  value: string | number
  change?: number
  trend?: "up" | "down" | { value: number; isPositive: boolean }
  icon: string | LucideIcon
  color?: string
}

export interface Order {
  id: string
  customer: string
  items: number
  total: string
  time: string
  status: "Completado" | "Pendiente" | "Cancelado" | string
}

export interface Product {
  name: string
  sales: number
  revenue: string
}

export interface WeeklySales {
  day: string
  value: number
}


export interface DashboardStatsResponse {
  today: {
    revenue: number
    ordersCount: number
    uniqueCustomers: number
  }
  yesterday: {
    revenue: number
    ordersCount: number
  }
  trends: {
    revenue: number
    orders: number
  }
  pendingCount: number
  weeklySales: WeeklySales[]
  topProducts: {
    name: string
    quantity: number
    revenue: number
  }[]
  recentOrders: {
    id: string
    customer: string
    items: number
    total: number
    status: string
    createdAt: string
  }[]
}

export interface AdminStatsResponse extends Omit<DashboardStatsResponse, "today"> {
  totalShops: number
  totalUsers: number
  activeSessions: number
  platformRevenueToday: number
  today: DashboardStatsResponse["today"]
}
