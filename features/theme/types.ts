export type ThemeColorKey =
  | "background" | "foreground"
  | "card" | "card-foreground"
  | "popover" | "popover-foreground"
  | "primary" | "primary-foreground"
  | "secondary" | "secondary-foreground"
  | "muted" | "muted-foreground"
  | "accent" | "accent-foreground"
  | "destructive"
  | "border" | "input" | "ring"
  | "success" | "success-foreground"
  | "warning" | "warning-foreground"
  | "chart-1" | "chart-2" | "chart-3" | "chart-4" | "chart-5"
  | "sidebar" | "sidebar-foreground"
  | "sidebar-primary" | "sidebar-primary-foreground"
  | "sidebar-accent" | "sidebar-accent-foreground"
  | "sidebar-border" | "sidebar-ring"

/** Partial color map — presets only override what they change. Values are oklch strings. */
export type ThemeColors = Partial<Record<ThemeColorKey, string>>

export type ColorMode = "light" | "dark"

export interface ThemePreset {
  id: string
  name: string
  description?: string
  light: ThemeColors
  dark: ThemeColors
}

export interface ThemeConfig {
  presetId: string
  mode: ColorMode
}

export interface ThemeContextValue {
  mode: ColorMode
  presetId: string
  presets: ThemePreset[]
  setMode: (mode: ColorMode) => void
  toggleMode: () => void
  setPreset: (presetId: string) => void
  previewPreset: (presetId: string) => void
  commitPreview: () => void
  cancelPreview: () => void
  isPreviewing: boolean
}
