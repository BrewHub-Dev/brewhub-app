"use client"

import { useState, useEffect } from "react"
import { loadStripe } from "@stripe/stripe-js"
import { X, CheckCircle2, XCircle, Wifi, WifiOff, CreditCard, Loader2, Monitor } from "lucide-react"
import { Button } from "@/components/ui/button"
import { markOrderPaid } from "../api"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

type TerminalState = "idle" | "reading" | "processing" | "success" | "error"

interface TestCard {
  id: string
  label: string
  brand: string
  pmId: string
  scenario: "success" | "decline"
}

const TEST_CARDS: TestCard[] = [
  { id: "visa", label: "Visa", brand: "•••• 4242", pmId: "pm_card_visa", scenario: "success" },
  { id: "mastercard", label: "Mastercard", brand: "•••• 5555", pmId: "pm_card_mastercard", scenario: "success" },
  { id: "declined", label: "Tarjeta declinada", brand: "•••• 0002", pmId: "pm_card_chargeDeclined", scenario: "decline" },
]

const STATE_MESSAGES: Record<TerminalState, string> = {
  idle: "Selecciona una tarjeta para simular",
  reading: "Leyendo tarjeta...",
  processing: "Procesando pago...",
  success: "¡Pago aprobado!",
  error: "Pago rechazado",
}

interface StripeTerminalModalProps {
  clientSecret: string
  orderId: string
  orderNumber: string
  total: number
  onSuccess: (orderNumber: string) => void
  onCancel: () => void
}

export function StripeTerminalModal({
  clientSecret,
  orderId,
  orderNumber,
  total,
  onSuccess,
  onCancel,
}: StripeTerminalModalProps) {
  const [terminalState, setTerminalState] = useState<TerminalState>("idle")
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    const t = setTimeout(() => setConnected(true), 800)
    return () => clearTimeout(t)
  }, [])

  async function handleCardPresent(card: TestCard) {
    if (terminalState !== "idle" || !connected) return

    setTerminalState("reading")
    setErrorMessage(null)

    await new Promise((r) => setTimeout(r, 1200))
    setTerminalState("processing")

    try {
      const stripe = await stripePromise
      if (!stripe) throw new Error("Stripe no disponible")

      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: card.pmId,
      })

      if (error) {
        setTerminalState("error")
        setErrorMessage(error.message ?? "Pago rechazado")
        return
      }

      if (paymentIntent?.status === "succeeded") {
        setTerminalState("success")
        try {
          await markOrderPaid(orderId)
        } catch {}
        setTimeout(() => onSuccess(orderNumber), 1500)
      } else {
        setTerminalState("error")
        setErrorMessage("El pago no fue procesado")
      }
    } catch (err) {
      setTerminalState("error")
      setErrorMessage(err instanceof Error ? err.message : "Error de conexión")
    }
  }

  function handleRetry() {
    setTerminalState("idle")
    setErrorMessage(null)
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <Monitor className="w-4 h-4 text-gray-500" />
            <span className="font-semibold text-gray-900 text-sm">Terminal Simulada</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1 text-xs">
              {connected ? (
                <><Wifi className="w-3.5 h-3.5 text-green-500" /><span className="text-green-600">Conectada</span></>
              ) : (
                <><WifiOff className="w-3.5 h-3.5 text-gray-400" /><span className="text-gray-400">Conectando...</span></>
              )}
            </div>
            <button onClick={onCancel} disabled={terminalState === "processing"} className="text-gray-400 hover:text-gray-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Terminal screen */}
        <div className="bg-gray-900 mx-4 mt-4 rounded-xl p-5 text-center">
          <p className="text-gray-400 text-xs mb-1 uppercase tracking-widest">Brewsy POS</p>
          <p className="text-white text-3xl font-bold mb-1">${total.toFixed(2)}</p>
          <p className="text-gray-400 text-xs">MXN · Orden #{orderNumber}</p>

          <div className="mt-4 flex items-center justify-center gap-2">
            {terminalState === "idle" && connected && (
              <span className="text-green-400 text-sm animate-pulse">Listo para cobrar</span>
            )}
            {terminalState === "idle" && !connected && (
              <span className="text-yellow-400 text-sm">Conectando terminal...</span>
            )}
            {terminalState === "reading" && (
              <><Loader2 className="w-4 h-4 text-yellow-400 animate-spin" /><span className="text-yellow-400 text-sm">Leyendo tarjeta...</span></>
            )}
            {terminalState === "processing" && (
              <><Loader2 className="w-4 h-4 text-blue-400 animate-spin" /><span className="text-blue-400 text-sm">Procesando...</span></>
            )}
            {terminalState === "success" && (
              <><CheckCircle2 className="w-4 h-4 text-green-400" /><span className="text-green-400 text-sm font-semibold">¡Aprobado!</span></>
            )}
            {terminalState === "error" && (
              <><XCircle className="w-4 h-4 text-red-400" /><span className="text-red-400 text-sm">{errorMessage ?? "Rechazado"}</span></>
            )}
          </div>
        </div>

        {/* Card slot graphic */}
        <div className="mx-4 mt-3 flex items-center gap-3 p-3 rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
          <div className={`w-10 h-7 rounded border-2 flex items-center justify-center shrink-0 transition-all ${
            terminalState === "reading" ? "border-yellow-400 bg-yellow-50" :
            terminalState === "processing" ? "border-blue-400 bg-blue-50" :
            terminalState === "success" ? "border-green-400 bg-green-50" :
            terminalState === "error" ? "border-red-400 bg-red-50" :
            "border-gray-300 bg-white"
          }`}>
            <CreditCard className={`w-5 h-5 ${
              terminalState === "reading" ? "text-yellow-500" :
              terminalState === "processing" ? "text-blue-500" :
              terminalState === "success" ? "text-green-500" :
              terminalState === "error" ? "text-red-500" :
              "text-gray-400"
            }`} />
          </div>
          <div>
            <p className="text-xs font-medium text-gray-700">Ranura de tarjeta</p>
            <p className="text-xs text-gray-400">{STATE_MESSAGES[terminalState]}</p>
          </div>
        </div>

        {/* Test card buttons */}
        <div className="p-4">
          {terminalState === "idle" && (
            <>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">Simular tarjeta</p>
              <div className="space-y-2">
                {TEST_CARDS.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardPresent(card)}
                    disabled={!connected}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-sm font-medium transition-all ${
                      card.scenario === "success"
                        ? "border-green-200 bg-green-50 text-green-800 hover:bg-green-100 disabled:opacity-50"
                        : "border-red-200 bg-red-50 text-red-800 hover:bg-red-100 disabled:opacity-50"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard className="w-4 h-4" />
                      <span>{card.label}</span>
                    </div>
                    <span className="font-mono text-xs opacity-60">{card.brand}</span>
                  </button>
                ))}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100">
                <Button variant="ghost" onClick={onCancel} className="w-full text-sm text-gray-500">
                  Cancelar cobro
                </Button>
              </div>
            </>
          )}

          {(terminalState === "reading" || terminalState === "processing") && (
            <div className="text-center py-4">
              <div className="flex justify-center gap-1 mb-2">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-primary animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500">No retires la tarjeta...</p>
            </div>
          )}

          {terminalState === "success" && (
            <div className="text-center py-4">
              <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-2" />
              <p className="font-semibold text-gray-900">Pago completado</p>
              <p className="text-sm text-gray-500">Orden #{orderNumber}</p>
            </div>
          )}

          {terminalState === "error" && (
            <div className="text-center py-4 space-y-3">
              <XCircle className="w-10 h-10 text-red-500 mx-auto" />
              <p className="text-sm text-red-600">{errorMessage ?? "El pago fue rechazado"}</p>
              <div className="flex gap-2">
                <Button variant="outline" onClick={handleRetry} className="flex-1">
                  Reintentar
                </Button>
                <Button variant="ghost" onClick={onCancel} className="flex-1">
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
