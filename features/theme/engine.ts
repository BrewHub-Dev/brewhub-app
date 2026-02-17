import type { ThemeColors, ThemePreset, ColorMode } from "./types"

const root = () => document.documentElement

/**
 * Apply CSS variable overrides to :root via inline styles.
 * Inline styles have higher specificity than :root {} and .dark {} rules,
 * so preset overrides "win" automatically.
 */
export function applyThemeColors(colors: ThemeColors): void {
  const style = root().style
  for (const [key, value] of Object.entries(colors)) {
    if (value) {
      style.setProperty(`--${key}`, value)
    }
  }
}

/** Remove inline style overrides so globals.css defaults take effect. */
export function clearThemeColors(keys: string[]): void {
  const style = root().style
  for (const key of keys) {
    style.removeProperty(`--${key}`)
  }
}

/** Collect all keys set across both modes of a preset. */
function getAllPresetKeys(preset: ThemePreset): string[] {
  return [...new Set([...Object.keys(preset.light), ...Object.keys(preset.dark)])]
}

/**
 * Apply a full preset for the given mode.
 * 1. Clears previous inline overrides so CSS defaults re-emerge
 * 2. Applies the mode-specific overrides from the preset
 */
export function applyPreset(
  preset: ThemePreset,
  mode: ColorMode,
  previousPreset?: ThemePreset,
): void {
  if (previousPreset) {
    clearThemeColors(getAllPresetKeys(previousPreset))
  }

  const colors = mode === "dark" ? preset.dark : preset.light
  applyThemeColors(colors)
}

/** Toggle the .dark class on <html>. */
export function applyColorMode(mode: ColorMode): void {
  root().classList.toggle("dark", mode === "dark")
}
