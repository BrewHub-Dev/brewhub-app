"use client"
import { useState, useRef, useEffect } from "react"
import { ChevronDown, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectOption {
  value: string
  label: string
  disabled?: boolean
}

interface SelectProps {
  value: string
  onChange: (value: string) => void
  options: SelectOption[]
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  id?: string
}

export function Select({
  value,
  onChange,
  options,
  placeholder,
  disabled,
  required,
  className,
  id,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", handleKeyDown)
    return () => document.removeEventListener("keydown", handleKeyDown)
  }, [])

  return (
    <div ref={ref} className={cn("relative w-full", className)}>
      {required && (
        <input
          tabIndex={-1}
          required
          value={value}
          onChange={() => {}}
          className="absolute opacity-0 w-0 h-0 pointer-events-none"
        />
      )}

      <button
        id={id}
        type="button"
        disabled={disabled}
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full rounded-lg px-4 py-2.5 flex items-center justify-between gap-2 text-sm",
          "bg-white/60 backdrop-blur-md border border-white/20",
          "hover:bg-white/70 transition-all duration-200",
          "focus:outline-none focus:ring-2 focus:ring-primary/40",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          open && "ring-2 ring-primary/40"
        )}
      >
        <span className={cn("truncate", !selected && "text-muted-foreground")}>
          {selected ? selected.label : (placeholder ?? "Seleccionar")}
        </span>

        <ChevronDown
          className={cn(
            "w-4 h-4 text-muted-foreground transition-transform duration-200",
            open && "rotate-180"
          )}
        />
      </button>

      {open && (
        <div className="absolute z-50 w-full mt-1.5 rounded-lg border border-white/20 bg-white/70 backdrop-blur-xl shadow-lg animate-in fade-in zoom-in-95 duration-150">
          <div className="max-h-56 overflow-y-auto py-1">
            {placeholder !== undefined && (
              <button
                type="button"
                onClick={() => {
                  onChange("")
                  setOpen(false)
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm flex items-center justify-between",
                  "hover:bg-primary/10 transition-colors",
                  value === "" && "text-primary font-medium"
                )}
              >
                <span>{placeholder}</span>
                {value === "" && <Check className="w-3.5 h-3.5" />}
              </button>
            )}

            {options.map((opt) => (
              <button
                key={opt.value}
                type="button"
                disabled={opt.disabled}
                onClick={() => {
                  if (!opt.disabled) {
                    onChange(opt.value)
                    setOpen(false)
                  }
                }}
                className={cn(
                  "w-full px-4 py-2 text-left text-sm flex items-center justify-between",
                  "hover:bg-primary/10 transition-colors",
                  opt.value === value && "text-primary font-medium",
                  opt.disabled && "opacity-40 cursor-not-allowed"
                )}
              >
                <span className="truncate">{opt.label}</span>
                {opt.value === value && <Check className="w-3.5 h-3.5" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
