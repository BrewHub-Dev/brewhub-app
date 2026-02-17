"use client"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-store"
import AuthGuard from "@/features/auth/ui/AuthGuard"

export default function HomePage() {
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    if (user) {
      router.push("/dashboard")
    }
  }, [user, router])

  return (
    <AuthGuard mode="private">
      <div className="min-h-screen bg-gradient-to-br from-[#0b1020] to-[#0b0e14] flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Redirigiendo al dashboard...</p>
        </div>
      </div>
    </AuthGuard>
  )
}
