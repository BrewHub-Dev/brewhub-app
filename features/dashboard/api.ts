import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { DashboardStats, Order, Product, WeeklySales } from "./types"


export async function getDashboardStats(): Promise<DashboardStats[]> {
  try {
    const orders: any[] = await api.get("/orders")
    if (Array.isArray(orders)) {
      const today = new Date().toDateString()
      const todayOrders = orders.filter(
        (o) => new Date(o.createdAt).toDateString() === today
      )
      const totalSales = todayOrders.reduce((sum, o) => sum + (o.total ?? 0), 0)
      const uniqueCustomers = new Set(
        todayOrders.map((o) => o.customerId || o.guestName).filter(Boolean)
      ).size

      return [
        {
          title: "Ventas de Hoy",
          value: `$${totalSales.toFixed(2)}`,
          change: 0,
          trend: "up",
          icon: "dollar",
        },
        {
          title: "Órdenes",
          value: String(todayOrders.length),
          change: 0,
          trend: "up",
          icon: "bag",
        },
        {
          title: "Clientes",
          value: String(uniqueCustomers),
          change: 0,
          trend: "up",
          icon: "users",
        },
        {
          title: "Pendientes",
          value: String(orders.filter((o) => o.status === "pending").length),
          change: 0,
          trend: "down",
          icon: "clock",
        },
      ]
    }
  } catch (err) {
    console.error("Dashboard stats failed to fetch real data:", err)
    throw err
  }
  return []
}

export async function getRecentOrders(): Promise<Order[]> {
  try {
    const orders: any[] = await api.get("/orders")
    if (Array.isArray(orders)) {
      return orders.slice(0, 10).map((o) => ({
        id: o.orderNumber || o._id,
        customer: o.customer
          ? `${o.customer.name} ${o.customer.lastName}`
          : (o.guestName || "Cliente"),
        items: o.items?.length ?? 0,
        total: `$${(o.total ?? 0).toFixed(2)}`,
        time: formatTimeDiff(o.createdAt),
        status: translateStatus(o.status) as Order["status"],
      }))
    }
  } catch (err) {
    console.error("Recent orders failed to fetch real data:", err)
    throw err
  }
  return []
}

export async function getTopProducts(): Promise<Product[]> {
  try {
    const orders: any[] = await api.get("/orders")
    if (Array.isArray(orders)) {
      const productMap = new Map<string, { name: string; sales: number; revenue: number }>()
      orders.forEach((order) => {
        (order.items ?? []).forEach((item: any) => {
          const key = item.name || item.itemId
          const existing = productMap.get(key)
          const qty = item.quantity ?? 1
          const price = item.price ?? 0
          if (existing) {
            existing.sales += qty
            existing.revenue += price * qty
          } else {
            productMap.set(key, { name: key, sales: qty, revenue: price * qty })
          }
        })
      })
      return Array.from(productMap.values())
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 5)
        .map((p) => ({ name: p.name, sales: p.sales, revenue: `$${p.revenue.toFixed(2)}` }))
    }
  } catch (err) {
    console.error("Top products failed to fetch real data:", err)
    throw err
  }
  return []
}

export async function getWeeklySales(): Promise<WeeklySales[]> {
  try {
    const orders: any[] = await api.get("/orders")
    if (Array.isArray(orders)) {
      const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
      const salesByDay = new Map<string, number>()
      days.forEach((d) => salesByDay.set(d, 0))

      const now = new Date()
      orders.forEach((o) => {
        const d = new Date(o.createdAt)
        const diffDays = Math.floor((now.getTime() - d.getTime()) / 86_400_000)
        if (diffDays < 7) {
          const label = days[d.getDay()]
          salesByDay.set(label, (salesByDay.get(label) ?? 0) + (o.total ?? 0))
        }
      })

      const ordered = ["Lun", "Mar", "Mié", "Jue", "Vie", "Sáb", "Dom"]
      return ordered.map((day) => ({ day, value: +(salesByDay.get(day) ?? 0).toFixed(2) }))
    }
  } catch (err) {
    console.error("Weekly sales failed to fetch real data:", err)
    throw err
  }
  return []
}


export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: getDashboardStats,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })
}

export function useRecentOrders() {
  return useQuery({
    queryKey: ["dashboard-orders"],
    queryFn: getRecentOrders,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

export function useTopProducts() {
  return useQuery({
    queryKey: ["dashboard-top-products"],
    queryFn: getTopProducts,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })
}

export function useWeeklySales() {
  return useQuery({
    queryKey: ["dashboard-weekly-sales"],
    queryFn: getWeeklySales,
    staleTime: 60_000,
    refetchInterval: 5 * 60_000,
  })
}

function formatTimeDiff(dateString: string): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 60) return `Hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} d`
}

function translateStatus(status: string): string {
  const map: Record<string, string> = {
    pending: "Pendiente",
    confirmed: "Confirmado",
    preparing: "Preparando",
    ready: "Listo",
    completed: "Completado",
    cancelled: "Cancelado",
  }
  return map[status] ?? status
}
