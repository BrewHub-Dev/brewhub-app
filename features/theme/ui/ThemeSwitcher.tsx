"use client"

import { useState, useRef, useEffect } from "react"
import { Palette, Check, Sun, Moon } from "lucide-react"
import { useTheme } from "./useTheme"

/** Small color dot showing the preset's primary color. */
function PresetSwatch({ color }: Readonly<{ color: string | undefined }>) {
  return (
    <span
      className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-600 shrink-0"
      style={{ backgroundColor: color ?? "var(--primary)" }}
    />
  )
}

export default function ThemeSwitcher() {
  const { mode, toggleMode, presetId, presets, setPreset, previewPreset, cancelPreview } = useTheme()
  const [open, setOpen] = useState(false)
  const panelRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    if (!open) return

    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        cancelPreview()
        setOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [open, cancelPreview])

  return (
    <div className="relative" ref={panelRef}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-200/50 dark:hover:bg-gray-700/50 transition-all"
      >
        <Palette className="w-5 h-5" />
        <span className="text-sm font-medium">Tema</span>
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute bottom-full left-0 mb-2 w-56 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-xl p-2 z-50">
          {/* Mode toggle */}
          <button
            onClick={toggleMode}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {mode === "light" ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            <span>{mode === "light" ? "Modo Oscuro" : "Modo Claro"}</span>
          </button>

          <div className="h-px bg-gray-200 dark:bg-gray-700 my-1" />

          {/* Presets */}
          <p className="px-3 py-1 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Colores
          </p>
          {presets.map((preset) => {
            const isActive = preset.id === presetId
            const swatchColor = mode === "dark" ? preset.dark.primary : preset.light.primary

            return (
              <button
                key={preset.id}
                onMouseEnter={() => previewPreset(preset.id)}
                onMouseLeave={() => { if (!isActive) cancelPreview() }}
                onClick={() => {
                  setPreset(preset.id)
                  setOpen(false)
                }}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                }`}
              >
                <PresetSwatch color={swatchColor} />
                <span className="flex-1 text-left">{preset.name}</span>
                {isActive && <Check className="w-4 h-4 text-primary" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
