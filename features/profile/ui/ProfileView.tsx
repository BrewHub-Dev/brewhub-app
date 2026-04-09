"use client"
import { useState, useEffect } from "react"
import { User, Save } from "lucide-react"
import { useAuth } from "@/lib/auth-store"
import { useUserData } from "@/features/avatar/api"
import ShopAvatar from "@/features/avatar/ui/ShopAvatar"
import PersonalInfoCard from "./PersonalInfoCard"
import WorkInfoCard from "./WorkInfoCard"
import PreferencesCard from "./PreferencesCard"
import { getUserPreferences, updateUserPreferences, updateUserProfile } from "../api"
import type { UserPreferences } from "../types"

export default function ProfileView() {
  const { user, updateUser } = useAuth()
  const userId = user?._id
  const { data: userData } = useUserData(userId)

  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [name, setName] = useState(user?.name || "")
  const [lastName, setLastName] = useState(user?.lastName || "")
  const [phone, setPhone] = useState(userData?.phone || "")
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

  useEffect(() => {
    if (user) {
      setName(user.name || "")
      setLastName(user.lastName || "")
    }
  }, [user])

  useEffect(() => {
    if (userData?.phone !== undefined) {
      setPhone(userData.phone || "")
    }
  }, [userData])

  const displayName = [name, lastName].filter(Boolean).join(" ")
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

  const handleSave = async () => {
    if (!userId) return
    setIsSaving(true)
    try {
      const updateData: { name: string; lastName?: string; phone?: string } = {
        name: name.trim(),
      }
      
      if (lastName.trim()) {
        updateData.lastName = lastName.trim()
      }
      
      if (phone.trim()) {
        updateData.phone = phone.trim()
      }
      
      const updatedUser = await updateUserProfile(userId, updateData)
      
      updateUser({
        name: updatedUser.name,
        lastName: updatedUser.lastName,
      })
      
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving profile:", error)
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 text-foreground">Perfil de Usuario</h1>
          <p className="text-muted-foreground">Gestiona tu información personal y preferencias</p>
        </div>

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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <PersonalInfoCard
            displayName={name}
            lastName={lastName}
            email={email}
            phone={phone}
            isEditing={isEditing}
            onNameChange={setName}
            onLastNameChange={setLastName}
            onPhoneChange={setPhone}
          />
          <WorkInfoCard
            branchName={branchName}
            role={user?.role || "Empleado"}
            address={userData?.address}
          />
        </div>

        <PreferencesCard
          preferences={preferences}
          onPreferenceChange={handlePreferenceChange}
        />

        {isEditing && (
          <div className="flex justify-end gap-4">
            <button
              onClick={() => {
                setIsEditing(false)
                setName(user?.name || "")
                setLastName(user?.lastName || "")
                setPhone(userData?.phone || "")
              }}
              className="px-6 py-3 bg-muted/20 text-foreground rounded-lg hover:bg-muted/40 transition-all"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-6 py-3 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-all flex items-center gap-2 font-medium disabled:opacity-50"
            >
              {isSaving ? (
                <span className="animate-spin">⟳</span>
              ) : (
                <Save className="w-5 h-5" />
              )}
              {isSaving ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
