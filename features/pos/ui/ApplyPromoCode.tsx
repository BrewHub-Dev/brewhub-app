"use client"

import { useState } from "react"
import { applyPromoCode, type ApplyPromoCodeInput } from "@/features/promocodes/api"
import { X, Tag, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

interface ApplyPromoCodeProps {
  subtotal: number
  items: { itemId: string; quantity: number; price: number; categoryId?: string }[]
  onApply: (discount: number) => void
}

export default function ApplyPromoCode({ subtotal, items, onApply }: ApplyPromoCodeProps) {
  const [code, setCode] = useState("")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [appliedCode, setAppliedCode] = useState<string | null>(null)
  const [currentDiscount, setCurrentDiscount] = useState(0)

  async function handleApply() {
    if (!code.trim()) return

    setLoading(true)
    setMessage(null)

    try {
      const input: ApplyPromoCodeInput = {
        code: code.trim().toUpperCase(),
        subtotal,
        items,
      }

      const result = await applyPromoCode(input)

      if (result.valid) {
        setMessage({ type: "success", text: `Descuento aplicado: $${result.discount.toFixed(2)}` })
        setAppliedCode(code.trim().toUpperCase())
        setCurrentDiscount(result.discount)
        onApply(result.discount)
        setCode("")
      } else {
        setMessage({ type: "error", text: result.message })
      }
    } catch (error) {
      setMessage({ type: "error", text: "Error al aplicar código" })
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    setAppliedCode(null)
    setCurrentDiscount(0)
    setMessage(null)
    onApply(0)
  }

  if (appliedCode) {
    return (
      <div className="flex items-center gap-2 p-2 rounded-lg bg-green-50 border border-green-200">
        <CheckCircle className="w-4 h-4 text-green-600 shrink-0" />
        <div className="flex-1">
          <span className="text-sm font-medium text-green-700">{appliedCode}</span>
          <span className="text-xs text-green-600 ml-2">-${currentDiscount.toFixed(2)}</span>
        </div>
        <button onClick={handleRemove} className="p-1 text-green-600 hover:text-green-800">
          <X className="w-4 h-4" />
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            placeholder="Código de cupón"
            className="pl-9 uppercase font-mono"
            onKeyDown={(e) => e.key === "Enter" && handleApply()}
          />
        </div>
        <Button onClick={handleApply} disabled={loading || !code.trim()} size="sm">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Aplicar"}
        </Button>
      </div>

      {message && (
        <div
          className={`flex items-center gap-2 p-2 rounded-lg text-sm ${
            message.type === "success"
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-red-50 text-red-700 border border-red-200"
          }`}
        >
          {message.type === "success" ? (
            <CheckCircle className="w-4 h-4 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0" />
          )}
          <span>{message.text}</span>
        </div>
      )}
    </div>
  )
}