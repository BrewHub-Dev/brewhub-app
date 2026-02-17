export interface UserProfile {
  id: string
  name?: string
  lastName?: string
  emailAddress: string
  role?: string
  phone?: string
  branch?: {
    name: string
  }
  shopId?: string
  ShopId?: string
}

export interface UserPreferences {
  emailNotifications: boolean
  darkMode: boolean
  soundEffects: boolean
}
