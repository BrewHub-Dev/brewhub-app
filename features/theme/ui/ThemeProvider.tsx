"use client"

import { createContext, useCallback, useEffect, useRef, useState, type ReactNode } from "react"
import type { ColorMode, ThemeConfig, ThemeContextValue, ThemePreset } from "../types"
import { themePresets, getPresetById } from "../presets"
import { applyPreset, applyColorMode } from "../engine"
import { STORAGE_KEY, LEGACY_STORAGE_KEY, DEFAULT_PRESET_ID, DEFAULT_MODE } from "../config"

export const ThemeContext = createContext<ThemeContextValue | undefined>(undefined)

function loadConfig(): ThemeConfig {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as ThemeConfig
      if (getPresetById(parsed.presetId)) return parsed
    }

    // Legacy migration: old provider stored just "light" or "dark"
    const legacy = localStorage.getItem(LEGACY_STORAGE_KEY)
    if (legacy === "light" || legacy === "dark") {
      const migrated: ThemeConfig = { presetId: DEFAULT_PRESET_ID, mode: legacy }
      saveConfig(migrated)
      localStorage.removeItem(LEGACY_STORAGE_KEY)
      return migrated
    }
  } catch {
    // Ignore parse errors
  }

  return { presetId: DEFAULT_PRESET_ID, mode: DEFAULT_MODE }
}

function saveConfig(config: ThemeConfig): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config))
}

export function ThemeProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [config, setConfig] = useState<ThemeConfig>({
    presetId: DEFAULT_PRESET_ID,
    mode: DEFAULT_MODE,
  })
  const [mounted, setMounted] = useState(false)
  const [isPreviewing, setIsPreviewing] = useState(false)
  const committedConfigRef = useRef<ThemeConfig>(config)
  const previousPresetRef = useRef<ThemePreset | undefined>(undefined)

  // On mount: load persisted config and apply
  useEffect(() => {
    const saved = loadConfig()
    setConfig(saved)
    committedConfigRef.current = saved

    const preset = getPresetById(saved.presetId) ?? getPresetById(DEFAULT_PRESET_ID)!
    applyColorMode(saved.mode)
    applyPreset(preset, saved.mode)
    previousPresetRef.current = preset

    setMounted(true)
  }, [])

  // Whenever config changes after mount, apply to DOM
  useEffect(() => {
    if (!mounted) return

    const preset = getPresetById(config.presetId) ?? getPresetById(DEFAULT_PRESET_ID)!
    applyColorMode(config.mode)
    applyPreset(preset, config.mode, previousPresetRef.current)
    previousPresetRef.current = preset
  }, [config, mounted])

  const setMode = useCallback((mode: ColorMode) => {
    setConfig((prev) => {
      const next = { ...prev, mode }
      if (!isPreviewing) {
        saveConfig(next)
        committedConfigRef.current = next
      }
      return next
    })
  }, [isPreviewing])

  const toggleMode = useCallback(() => {
    setConfig((prev) => {
      const mode: ColorMode = prev.mode === "light" ? "dark" : "light"
      const next = { ...prev, mode }
      if (!isPreviewing) {
        saveConfig(next)
        committedConfigRef.current = next
      }
      return next
    })
  }, [isPreviewing])

  const setPreset = useCallback((presetId: string) => {
    if (!getPresetById(presetId)) return
    setConfig((prev) => {
      const next = { ...prev, presetId }
      saveConfig(next)
      committedConfigRef.current = next
      return next
    })
    setIsPreviewing(false)
  }, [])

  const previewPreset = useCallback((presetId: string) => {
    if (!getPresetById(presetId)) return
    setIsPreviewing(true)
    setConfig((prev) => ({ ...prev, presetId }))
  }, [])

  const commitPreview = useCallback(() => {
    saveConfig(config)
    committedConfigRef.current = config
    setIsPreviewing(false)
  }, [config])

  const cancelPreview = useCallback(() => {
    setIsPreviewing(false)
    setConfig(committedConfigRef.current)
  }, [])

  if (!mounted) {
    return <>{children}</>
  }

  return (
    <ThemeContext.Provider
      value={{
        mode: config.mode,
        presetId: config.presetId,
        presets: themePresets,
        setMode,
        toggleMode,
        setPreset,
        previewPreset,
        commitPreview,
        cancelPreview,
        isPreviewing,
      }}
    >
      {children}
    </ThemeContext.Provider>
  )
}
