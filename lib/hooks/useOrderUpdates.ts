"use client"

import { useEffect, useRef } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { BASE } from "@/lib/api"

function getToken(): string | null {
  try {
    if (typeof window === "undefined") return null
    return localStorage.getItem("bh_token")
  } catch {
    return null
  }
}

function getUser(): { branchId?: string; ShopId?: string; _id?: string } | null {
  try {
    if (typeof window === "undefined") return null
    const raw = localStorage.getItem("bh_user")
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

/**
 * Connects to the backend Socket.io server and invalidates React Query caches
 * when order status changes are received. Mount this once at the dashboard layout level.
 */
export function useOrderUpdates() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const user = getUser()
    const serverUrl = BASE.replace(/\/+$/, "")

    const socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      console.log("[WS] Connected:", socket.id)

      if (user?.ShopId) {
        socket.emit("join:room", `shop:${user.ShopId}`)
      }
    })

    socket.on("connect_error", (err) => {
      console.warn("[WS] Connection error:", err.message)
    })

    socket.on("order:updated", () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    })

    socket.on("order:statusChanged", () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["kitchen"] })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
    }
  }, [queryClient])
}
