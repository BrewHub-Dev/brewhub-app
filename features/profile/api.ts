import api from "@/lib/api"
import { UserProfile, UserPreferences } from "./types"

const PREFS_KEY = "bh_preferences"

export async function getUserProfile(): Promise<UserProfile> {
  return api.get<UserProfile>("/users/me")
}

export async function updateUserProfile(_userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  return api.patch<UserProfile>("/users/me", data)
}

export async function getUserPreferences(_userId: string): Promise<UserPreferences> {
  try {
    if (typeof window === "undefined") return { emailNotifications: true, darkMode: true, soundEffects: false }
    const raw = localStorage.getItem(PREFS_KEY)
    if (raw) return JSON.parse(raw) as UserPreferences
  } catch {}
  return { emailNotifications: true, darkMode: true, soundEffects: false }
}

export async function updateUserPreferences(_userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
  const current = await getUserPreferences(_userId)
  const updated = { ...current, ...preferences }
  try {
    if (typeof window !== "undefined") {
      localStorage.setItem(PREFS_KEY, JSON.stringify(updated))
    }
  } catch {}
  return updated
}
