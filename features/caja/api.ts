import api from "@/lib/api"

export interface ZReportItem {
  name: string
  quantity: number
  total: number
}

export interface ZReportOrder {
  _id: string
  orderNumber: number
  createdAt: string
  status: string
  paymentMethod: string
  paymentStatus: string
  source: string
  subtotal: number
  tax: number
  discount: number
  total: number
  items: { name: string; quantity: number; unitPrice: number; itemTotal: number }[]
}

export interface ZReportData {
  date: string
  timezone: string
  generatedAt: string
  totalOrders: number
  totalRevenue: number
  subtotalRevenue: number
  totalTax: number
  totalDiscount: number
  cancelledCount: number
  refundedCount: number
  averageTicket: number
  byPaymentMethod: Record<string, { count: number; total: number }>
  topItems: ZReportItem[]
  orders: ZReportOrder[]
}

export const PAYMENT_LABELS: Record<string, string> = {
  cash: "Efectivo",
  card: "Tarjeta",
  transfer: "Transferencia",
  terminal: "Terminal",
  bank_transfer: "Transferencia bancaria",
  wallet: "Wallet",
  unknown: "Sin método",
}

export const STATUS_LABELS: Record<string, string> = {
  completed: "Completada",
  cancelled: "Cancelada",
  pending: "Pendiente",
  confirmed: "Confirmada",
  preparing: "Preparando",
  ready: "Lista",
  refunded: "Reembolsada",
}

export async function getZReport(date: string, BranchId?: string): Promise<ZReportData | null> {
  try {
    let url = `/orders/z-report?date=${date}`
    if (BranchId) url += `&BranchId=${BranchId}`
    const result = await api.get<ZReportData>(url)
    if (result && typeof result.totalOrders === "number") return result
  } catch (err) {
    console.error("[ZReport] API error:", err)
  }
  return null
}

export async function downloadZReportCSV(date: string, BranchId?: string): Promise<void> {
  let url = `/orders/z-report/csv?date=${date}`
  if (BranchId) url += `&BranchId=${BranchId}`
  const blob = await api.download(url)
  const objectUrl = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = objectUrl
  a.download = `cierre-caja-${date}.csv`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(objectUrl)
}
