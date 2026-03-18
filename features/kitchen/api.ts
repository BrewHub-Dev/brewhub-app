import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import api from "@/lib/api"
import type { KitchenOrder } from "./types"

export function useKitchenOrders() {
  return useQuery<KitchenOrder[]>({
    queryKey: ["kitchen", "orders"],
    queryFn: async () => {
      const confirmed = await api.get("/orders?status=confirmed")
      const preparing = await api.get("/orders?status=preparing")
      const ready = await api.get("/orders?status=ready")
      const all = [...(confirmed ?? []), ...(preparing ?? []), ...(ready ?? [])]
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
