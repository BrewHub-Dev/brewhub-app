import { useQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import type { DashboardStatsResponse, AdminStatsResponse } from "./types"


export function useDashboard() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: (): Promise<DashboardStatsResponse> => api.get("/orders/dashboard-stats"),
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
    select: (data) => data,
  })
}


export function useAdminDashboard() {
  return useQuery({
    queryKey: ["dashboard", "admin"],
    queryFn: (): Promise<AdminStatsResponse> => api.get("/admin/dashboard-stats"),
    staleTime: 2 * 60_000,
    refetchInterval: 5 * 60_000,
  })
}


export function useClientDashboard(userId: string | undefined) {
  return useQuery({
    queryKey: ["dashboard", "client", userId],
    queryFn: () => api.get(`/orders/user/${userId}/dashboard-counts`),
    enabled: !!userId,
    staleTime: 60_000,
    refetchInterval: 3 * 60_000,
  })
}

export function useClientOrders(userId: string | undefined) {
  return useQuery({
    queryKey: ["orders", "user", userId],
    queryFn: () => api.get(`/orders/user/${userId}`),
    enabled: !!userId,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}


export function translateStatus(status: string): string {
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

export function formatTimeDiff(dateString: string | Date): string {
  const diff = Date.now() - new Date(dateString).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 60) return `Hace ${min} min`
  const hrs = Math.floor(min / 60)
  if (hrs < 24) return `Hace ${hrs} h`
  return `Hace ${Math.floor(hrs / 24)} d`
}
