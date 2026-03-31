"use client"

import { useState } from "react"
import { loadStripe } from "@stripe/stripe-js"
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Loader2, X, CreditCard, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { markOrderPaid } from "../api"

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

function CheckoutForm({
  orderId,
  total,
  customerEmail,
  onSuccess,
  onCancel,
}: {
  orderId: string
  total: number
  customerEmail?: string
  onSuccess: (orderNumber: string) => void
  onCancel: () => void
}) {
  const stripe = useStripe()
  const elements = useElements()
  const [error, setError] = useState<string | null>(null)
  const [processing, setProcessing] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!stripe || !elements) return

    setProcessing(true)
    setError(null)

    const { error: submitError } = await elements.submit()
    if (submitError) {
      setError(submitError.message ?? "Error al procesar el pago")
      setProcessing(false)
      return
    }

    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: window.location.href,
        payment_method_data: {
          billing_details: {
            name: "Cliente POS",
            ...(customerEmail && { email: customerEmail }),
          },
        },
      },
      redirect: "if_required",
    })

    if (confirmError) {
      setError(confirmError.message ?? "Error al confirmar el pago")
      setProcessing(false)
      return
    }

    if (paymentIntent?.status === "succeeded") {
      try {
        await markOrderPaid(orderId)
        onSuccess(orderId)
      } catch {
        // Webhook will handle it as fallback — still show success
        onSuccess(orderId)
      }
    } else {
      setError("El pago no se pudo confirmar. Intenta de nuevo.")
      setProcessing(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <CreditCard className="w-5 h-5 text-primary" />
          <span className="font-semibold text-foreground">Pago con tarjeta</span>
        </div>
        <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
          <X className="w-5 h-5" />
        </button>
      </div>

      <div className="text-center py-2">
        <p className="text-muted-foreground text-sm">Total a cobrar</p>
        <p className="text-3xl font-bold text-primary">${total.toFixed(2)}</p>
      </div>

      <PaymentElement
        options={{
          layout: "tabs",
          fields: {
            billingDetails: {
              name: "never",
              email: customerEmail ? "never" : "auto",
            },
          },
        }}
      />

      {error && (
        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="ghost" onClick={onCancel} disabled={processing} className="flex-1">
          Cancelar
        </Button>
        <Button type="submit" disabled={!stripe || processing} className="flex-1 h-11 font-semibold">
          {processing ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" />Procesando...</>
          ) : (
            `Cobrar $${total.toFixed(2)}`
          )}
        </Button>
      </div>
    </form>
  )
}

interface StripePaymentModalProps {
  clientSecret: string
  orderId: string
  orderNumber: string
  total: number
  customerEmail?: string
  onSuccess: (orderNumber: string) => void
  onCancel: () => void
}

export function StripePaymentModal({
  clientSecret,
  orderId,
  orderNumber,
  total,
  customerEmail,
  onSuccess,
  onCancel,
}: StripePaymentModalProps) {
  const [paid, setPaid] = useState(false)

  function handleSuccess() {
    setPaid(true)
    setTimeout(() => onSuccess(orderNumber), 1800)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-200">
        {paid ? (
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-gray-900">¡Pago exitoso!</p>
              <p className="text-gray-500 text-sm mt-1">Orden #{orderNumber}</p>
            </div>
          </div>
        ) : (
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: "stripe",
                variables: {
                  colorPrimary: "#6366f1",
                  borderRadius: "8px",
                },
              },
            }}
          >
            <CheckoutForm
              orderId={orderId}
              total={total}
              customerEmail={customerEmail}
              onSuccess={handleSuccess}
              onCancel={onCancel}
            />
          </Elements>
        )}
      </div>
    </div>
  )
}
