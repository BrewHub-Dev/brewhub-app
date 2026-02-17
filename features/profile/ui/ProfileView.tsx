"use client"
import { useState, useEffect } from "react"
import { User, Save } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { useUserData } from "@/features/avatar/api"
import ShopAvatar from "@/features/avatar/ui/ShopAvatar"
import PersonalInfoCard from "./PersonalInfoCard"
import WorkInfoCard from "./WorkInfoCard"
import PreferencesCard from "./PreferencesCard"
import { getUserPreferences, updateUserPreferences } from "../api"
import type { UserPreferences } from "../types"

export default function ProfileView() {
  const { user } = useAuth()
  const userId = user?._id
  const { data: userData } = useUserData(userId)

  const [isEditing, setIsEditing] = useState(false)
  const [preferences, setPreferences] = useState<UserPreferences>({
    emailNotifications: true,
    darkMode: true,
    soundEffects: false,
  })

  useEffect(() => {
    if (userId) {
      getUserPreferences(userId).then(setPreferences)
    }
  }, [userId])

  const displayName = user ? [user?.name, user?.lastName].filter(Boolean).join(" ") : ""
  const email = user?.emailAddress || ""
  const branchName = userData?.branch?.name ?? "No asignada"
  const shopId = user?.ShopId ?? userData?.ShopId

  const handlePreferenceChange = (key: keyof UserPreferences, value: boolean) => {
    const newPreferences = { ...preferences, [key]: value }
    setPreferences(newPreferences)
    if (userId) {
      updateUserPreferences(userId, newPreferences)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Perfil de Usuario</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
        </div>

        {/* Profile Header */}
        <div className="glass rounded-2xl p-8 mb-6 hover:shadow-2xl transition-all">
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 rounded-full bg-primary/20 border border-border/20 flex items-center justify-center overflow-hidden">
              {shopId ? (
                <ShopAvatar
                  shopId={shopId}
                  fallback={<User className="w-12 h-12 text-primary" />}
                />
              ) : (
                <User className="w-12 h-12 text-primary" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold mb-1">{displayName || "Usuario"}</h2>
              <p className="text-muted-foreground mb-4">{email}</p>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="px-4 py-2 bg-primary/20 text-primary rounded-xl border border-primary/30 hover:bg-primary/30 hover:shadow-lg transition-all"
              >
                {isEditing ? "Cancelar" : "Editar Perfil"}
              </button>
            </div>
          </div>
        </div>

        {/* Profile Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PersonalInfoCard
            displayName={displayName}
            email={email}
            phone={userData?.phone || ""}
            isEditing={isEditing}
          />
          <WorkInfoCard
            branchName={branchName}
            role={user?.role || "Empleado"}
            address={userData?.address}
          />
        </div>

        {/* Preferences */}
        <PreferencesCard
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
        />

        {/* Save Button */}
        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-muted/20 text-foreground rounded-lg hover:bg-muted/40 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-medium"
            >
              <Save className="w-5 h-5" />
              Guardar Cambios
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
