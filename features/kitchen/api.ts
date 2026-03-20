import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { KitchenOrder } from "./types"

export function useKitchenOrders() {
  return useQuery<KitchenOrder[]>({
    queryKey: ["kitchen", "orders"],
    queryFn: async () => {
      const [confirmedRes, preparingRes, readyRes] = await Promise.all([
        api.get("/orders?status=confirmed&limit=100"),
        api.get("/orders?status=preparing&limit=100"),
        api.get("/orders?status=ready&limit=100"),
      ])
      const all = [
        ...(confirmedRes?.data ?? []),
        ...(preparingRes?.data ?? []),
        ...(readyRes?.data ?? []),
      ]
      return all.sort(
        (a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    },
    staleTime: 15_000,
    refetchInterval: 15_000,
  })
}

const ACTION_MAP: Record<string, string> = {
  preparing: "prepare",
  ready: "ready",
  completed: "complete",
}

export function useAdvanceOrder() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ orderId, newStatus }: { orderId: string; newStatus: string }) => {
      const action = ACTION_MAP[newStatus]
      if (!action) throw new Error(`No action for status: ${newStatus}`)
      return api.patch(`/orders/${orderId}/${action}`, {})
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["kitchen"] })
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    },
  })
}

export function timeSince(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const min = Math.floor(diff / 60_000)
  if (min < 1) return "Ahora"
  if (min < 60) return `${min} min`
  return `${Math.floor(min / 60)}h ${min % 60}min`
}
