import { UserProfile, UserPreferences } from "./types"

export async function getUserProfile(userId: string): Promise<UserProfile> {
  return null as any
}

export async function updateUserProfile(userId: string, data: Partial<UserProfile>): Promise<UserProfile> {
  console.log("Actualizando perfil:", userId, data)
  return data as UserProfile
}

export async function getUserPreferences(userId: string): Promise<UserPreferences> {
  return {
    emailNotifications: true,
    darkMode: true,
    soundEffects: false,
  }
}

export async function updateUserPreferences(userId: string, preferences: Partial<UserPreferences>): Promise<UserPreferences> {
  console.log("Actualizando preferencias:", userId, preferences)
  return preferences as UserPreferences
}
