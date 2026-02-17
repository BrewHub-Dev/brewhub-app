import { DashboardStats, Order, Product, WeeklySales } from "./types"

export async function getDashboardStats(): Promise<DashboardStats[]> {
  return [
    {
      title: "Ventas de Hoy",
      value: "$1,245.00",
      change: 12.5,
      trend: "up",
      icon: "dollar",
    },
    {
      title: "Órdenes",
      value: "47",
      change: 8.2,
      trend: "up",
      icon: "bag",
    },
    {
      title: "Clientes",
      value: "38",
      change: -3.1,
      trend: "down",
      icon: "users",
    },
    {
      title: "Tiempo Promedio",
      value: "4.2 min",
      change: 5.4,
      trend: "down",
      icon: "clock",
    },
  ]
}

export async function getRecentOrders(): Promise<Order[]> {
  return [
    { id: "ORD-001", customer: "Ana García", items: 3, total: "$18.50", time: "Hace 5 min", status: "Completado" },
    { id: "ORD-002", customer: "Carlos López", items: 2, total: "$12.30", time: "Hace 12 min", status: "Completado" },
    { id: "ORD-003", customer: "María Torres", items: 4, total: "$24.80", time: "Hace 18 min", status: "Completado" },
    { id: "ORD-004", customer: "Juan Pérez", items: 1, total: "$5.50", time: "Hace 25 min", status: "Completado" },
  ]
}

export async function getTopProducts(): Promise<Product[]> {
  return [
    { name: "Americano", sales: 28, revenue: "$50.40" },
    { name: "Latte", sales: 24, revenue: "$60.00" },
    { name: "Cappuccino", sales: 18, revenue: "$41.40" },
    { name: "Croissant", sales: 15, revenue: "$18.00" },
  ]
}

export async function getWeeklySales(): Promise<WeeklySales[]> {
  return [
    { day: "Lun", value: 120 },
    { day: "Mar", value: 145 },
    { day: "Mié", value: 132 },
    { day: "Jue", value: 168 },
    { day: "Vie", value: 185 },
    { day: "Sáb", value: 210 },
    { day: "Dom", value: 178 },
  ]
}
