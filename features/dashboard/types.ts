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
  status: "Completado" | "Pendiente" | "Cancelado"
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
