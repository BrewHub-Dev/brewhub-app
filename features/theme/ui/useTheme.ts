"use client"

import { useContext } from "react"
import { ThemeContext } from "./ThemeProvider"
import type { ThemeContextValue } from "../types"

export function useTheme(): ThemeContextValue {
  const context = useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider")
  }
  return context
}

/**
 * Backward-compatible hook that exposes the same API as the old ThemeProvider.
 * Use this for existing consumers that used { theme, toggleTheme, setTheme }.
 */
export function useColorMode() {
  const { mode, toggleMode, setMode } = useTheme()
  return {
    theme: mode,
    toggleTheme: toggleMode,
    setTheme: setMode,
  }
}
