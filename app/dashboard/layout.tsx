"use client"
import { ReactNode } from "react"
import AuthGuard from "@/features/auth/ui/AuthGuard"
import DashboardLayoutView from "@/features/layout/ui/DashboardLayoutView"

export default function DashboardLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <AuthGuard mode="private">
      <DashboardLayoutView>{children}</DashboardLayoutView>
    </AuthGuard>
  )
}
