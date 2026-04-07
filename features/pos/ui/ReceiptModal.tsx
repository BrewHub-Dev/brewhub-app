"use client"

import { useRef } from "react"
import { X, Printer } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ReceiptItem {
  name: string
  quantity: number
  price: number
  itemTotal: number
  modifiers?: { name: string; optionName: string }[]
}

interface ReceiptData {
  orderNumber: string
  total: number
  subtotal: number
  tax: number
  items: ReceiptItem[]
  paymentMethod?: string
  guestName?: string
  branchName?: string
  createdAt: string
  notes?: string
  discount?: number
}

interface ReceiptModalProps {
  order: ReceiptData
  cashReceived?: number
  change?: number
  onClose: () => void
}

const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  terminal: "Terminal",
  wallet: "Wallet",
  bank_transfer: "Transferencia bancaria",
}

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  })
}

export function ReceiptModal({ order, cashReceived, change, onClose }: ReceiptModalProps) {
  const printRef = useRef<HTMLDivElement>(null)

  function handlePrint() {
    const content = printRef.current?.innerHTML
    if (!content) return
    const win = window.open("", "_blank", "width=400,height=700")
    if (!win) return
    win.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Ticket #${order.orderNumber}</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body { font-family: 'Courier New', monospace; font-size: 12px; width: 80mm; padding: 8px; background: white; color: #000; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .center { text-align: center; }
            .bold { font-weight: bold; }
            .divider { border-top: 1px dashed #000; margin: 6px 0; }
            .row { display: flex; justify-content: space-between; margin: 2px 0; }
            .item-name { flex: 1; }
            .item-qty { width: 24px; text-align: right; margin-right: 8px; }
            .item-price { width: 60px; text-align: right; }
            .total-row { font-size: 14px; font-weight: bold; }
            .change-row { font-size: 14px; font-weight: bold; color: #000; }
            .footer { text-align: center; margin-top: 12px; font-size: 10px; }
          </style>
        </head>
        <body>${content}</body>
      </html>
    `)
    win.document.close()
    win.focus()
    setTimeout(() => { win.print(); win.close() }, 300)
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b shrink-0">
          <span className="font-semibold text-black">Vista previa del ticket</span>
          <button onClick={onClose} className="text-black hover:text-gray-700">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 p-4">
          <div
            ref={printRef}
            className="font-mono text-xs bg-white text-black border border-dashed border-gray-300 rounded-lg p-4 space-y-1"
            style={{ width: "100%", maxWidth: "320px", margin: "0 auto" }}
          >
            <div className="center bold text-sm">BREWSY POS</div>
            {order.branchName && <div className="center">{order.branchName}</div>}
            <div className="center">{formatDateTime(order.createdAt)}</div>
            <div className="divider" />

            <div className="row">
              <span>Orden:</span>
              <span className="bold">#{order.orderNumber}</span>
            </div>

            {order.guestName && (
              <div className="row">
                <span>Cliente:</span>
                <span>{order.guestName}</span>
              </div>
            )}

            <div className="divider" />

            {order.items.length > 0 ? (
              order.items.map((item, i) => (
                <div key={i}>
                  <div className="row">
                    <span className="item-name">{item.name}</span>
                    <span className="item-qty">x{item.quantity}</span>
                    <span className="item-price">${item.itemTotal.toFixed(2)}</span>
                  </div>

                  {item.modifiers?.map((m, j) => (
                    <div key={j} className="row" style={{ paddingLeft: "8px", color: "#000" }}>
                      <span>+ {m.optionName}</span>
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div className="center">— items del pedido —</div>
            )}

            <div className="divider" />

            {order.items.length > 0 && (
              <div className="row">
                <span>Subtotal</span>
                <span>${order.subtotal.toFixed(2)}</span>
              </div>
            )}

            {order.tax > 0 && (
              <div className="row">
                <span>IVA</span>
                <span>${order.tax.toFixed(2)}</span>
              </div>
            )}

            {order.discount && order.discount > 0 && (
              <div className="row">
                <span>Descuento</span>
                <span>-${order.discount.toFixed(2)}</span>
              </div>
            )}

            <div className="row total-row">
              <span>TOTAL</span>
              <span>${order.total.toFixed(2)}</span>
            </div>

            <div className="divider" />

            <div className="row">
              <span>Pago:</span>
              <span>{PAYMENT_LABELS[order.paymentMethod ?? ""] ?? order.paymentMethod ?? "—"}</span>
            </div>

            {cashReceived && cashReceived > 0 && (
              <>
                <div className="row">
                  <span>Recibido:</span>
                  <span>${cashReceived.toFixed(2)}</span>
                </div>
                <div className="row change-row">
                  <span>CAMBIO:</span>
                  <span>${(change ?? 0).toFixed(2)}</span>
                </div>
              </>
            )}

            {order.notes && (
              <>
                <div className="divider" />
                <div>Nota: {order.notes}</div>
              </>
            )}

            <div className="divider" />
            <div className="footer">
              <div>¡Gracias por tu visita!</div>
              <div style={{ marginTop: "4px" }}>Powered by Brewsy</div>
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-4 border-t shrink-0">
          <Button onClick={handlePrint} className="flex-1 gap-2">
            <Printer className="w-4 h-4" />
            Imprimir
          </Button>
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  )
}
