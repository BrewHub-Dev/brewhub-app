"use client"

import { useEffect, useRef, useState } from "react"
import { useQueryClient } from "@tanstack/react-query"
import { io, Socket } from "socket.io-client"
import { BASE } from "@/lib/api"

interface OrderUpdatedEvent {
  orderId?: string
  orderNumber?: string
}

interface OrderStatusChangedEvent {
  orderId?: string
  status?: string
  branchId?: string
}

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

export function useOrderUpdates() {
  const queryClient = useQueryClient()
  const socketRef = useRef<Socket | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const token = getToken()
    if (!token) return

    const user = getUser()
    const serverUrl = BASE.replace(/\/+$/, "")

    const socket = io(serverUrl, {
      auth: { token },
      transports: ["websocket", "polling"],
      reconnectionAttempts: 10,
      reconnectionDelay: 2000,
      reconnectionDelayMax: 10000,
    })

    socketRef.current = socket

    socket.on("connect", () => {
      setConnected(true)
      if (user?.ShopId) {
        socket.emit("join:room", `shop:${user.ShopId}`)
      }
    })

    socket.on("disconnect", () => {
      setConnected(false)
    })

    socket.on("connect_error", (err) => {
      setConnected(false)
      console.warn("[WS] Connection error:", err.message)
    })

    socket.on("order:updated", (_data?: OrderUpdatedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
    })

    socket.on("order:statusChanged", (_data?: OrderStatusChangedEvent) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["dashboard"] })
      queryClient.invalidateQueries({ queryKey: ["kitchen"] })
    })

    return () => {
      socket.disconnect()
      socketRef.current = null
      setConnected(false)
    }
  }, [queryClient])

  return { connected }
}
