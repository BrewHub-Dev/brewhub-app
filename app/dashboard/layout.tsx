"use client"
import { ReactNode } from "react"
import AuthGuard from "@/features/auth/ui/AuthGuard"
import DashboardLayoutView from "@/features/layout/ui/DashboardLayoutView"
import { useOrderUpdates } from "@/lib/hooks/useOrderUpdates"

function DashboardWithUpdates({ children }: { children: ReactNode }) {
  useOrderUpdates()
  return <DashboardLayoutView>{children}</DashboardLayoutView>
}

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGuard mode="private">
      <DashboardWithUpdates>{children}</DashboardWithUpdates>
    </AuthGuard>
  )
}
