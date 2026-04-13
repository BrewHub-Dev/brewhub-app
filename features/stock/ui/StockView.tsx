"use client"

import { useState, useCallback } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getStockEnabled,
  setStockEnabled,
  getStockItems,
  createStockItem,
  updateStockItem,
  deleteStockItem,
  adjustStockQuantity,
  STOCK_UNITS,
  type StockItem,
  type StockItemInput,
  type StockUnit,
} from "../api"
import { getBranches } from "@/features/branches/api"
import type { Branch } from "@/features/branches/api"
import {
  Package,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  Plus,
  Minus,
  ToggleLeft,
  ToggleRight,
  Search,
  RefreshCw,
  Edit2,
  Trash2,
  X,
  Save,
  Coffee,
  Globe,
  GitBranch,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const SUGGESTED_CATEGORIES = [
  "Granos y Café",
  "Jarabes y Saborizantes",
  "Lácteos",
  "Chocolate y Cacao",
  "Suplementos",
  "Insumos de Pastelería",
  "Bebidas Base",
  "Empaque",
  "Otros",
]

function stockStatus(item: StockItem): "out" | "low" | "ok" {
  if (item.quantity === 0) return "out"
  if (item.quantity <= item.minQuantity) return "low"
  return "ok"
}

function StockBadge({ item }: { item: StockItem }) {
  const status = stockStatus(item)
  if (status === "out")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <X className="w-3 h-3" /> Sin stock
      </span>
    )
  if (status === "low")
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
        <AlertTriangle className="w-3 h-3" /> Stock bajo
      </span>
    )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <CheckCircle2 className="w-3 h-3" /> OK
    </span>
  )
}

function BranchTabs({
  branches,
  selected,
  onChange,
  loading,
}: {
  branches: Branch[]
  selected: string | "global"
  onChange: (id: string | "global") => void
  loading: boolean
}) {
  if (loading) {
    return (
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-9 w-24 rounded-full bg-muted/30 animate-pulse shrink-0" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
      <button
        onClick={() => onChange("global")}
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all border ${
          selected === "global"
            ? "bg-primary text-primary-foreground border-primary shadow-sm"
            : "bg-card/40 text-muted-foreground border-border/40 hover:bg-muted/20"
        }`}
      >
        <Globe className="w-3.5 h-3.5" />
        Global
      </button>
      {branches.map((b) => (
        <button
          key={b._id}
          onClick={() => onChange(b._id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium shrink-0 transition-all border ${
            selected === b._id
              ? "bg-primary text-primary-foreground border-primary shadow-sm"
              : "bg-card/40 text-muted-foreground border-border/40 hover:bg-muted/20"
          }`}
        >
          <GitBranch className="w-3.5 h-3.5" />
          {b.name}
        </button>
      ))}
    </div>
  )
}

// ── Global aggregated row (sum across branches) ────────────
interface AggregatedItem {
  name: string
  category: string
  unit: StockUnit
  totalQuantity: number
  minQuantity: number
  branchCount: number
  byBranch?: Record<string, { quantity: number; branchName: string }>
}

function GlobalRow({ item, branches }: { item: AggregatedItem; branches: Branch[] }) {
  const isOut = item.totalQuantity === 0
  const isLow = item.totalQuantity > 0 && item.totalQuantity <= item.minQuantity
  const branchList = Object.values(item.byBranch || {})
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col gap-2 p-4 rounded-xl border border-border/40 bg-card/30">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
          <Coffee className="w-5 h-5 text-primary" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{item.category}</p>
        </div>
        {isOut ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
            <X className="w-3 h-3" /> Sin stock
          </span>
        ) : isLow ? (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-700 border border-yellow-200">
            <AlertTriangle className="w-3 h-3" /> Stock bajo
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
            <CheckCircle2 className="w-3 h-3" /> OK
          </span>
        )}
        <div className="text-right shrink-0">
          <span className="font-bold text-lg tabular-nums">{item.totalQuantity}</span>
          <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="p-2 rounded-lg hover:bg-muted/30 text-muted-foreground transition-all"
        >
          <GitBranch className={`w-4 h-4 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </button>
      </div>

      {expanded && branchList.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-border/30">
          {branchList.map((b, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-muted/20">
              <span className="text-xs text-muted-foreground truncate">{b.branchName}</span>
              <span className={`text-sm font-semibold ${b.quantity === 0 ? "text-red-500" : b.quantity <= 5 ? "text-yellow-500" : "text-green-500"}`}>
                {b.quantity} {item.unit}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Form modal ────────────────────────────────────────────
const EMPTY_FORM = (branchId: string): StockItemInput => ({
  branchId,
  name: "",
  category: "",
  unit: "kg",
  quantity: 0,
  minQuantity: 0,
  description: "",
  supplier: "",
  cost: undefined,
})

interface FormModalProps {
  initial?: StockItem | null
  branches: Branch[]
  defaultBranchId: string
  onSave: (data: StockItemInput) => void
  onClose: () => void
  loading: boolean
}

function FormModal({ initial, branches, defaultBranchId, onSave, onClose, loading }: FormModalProps) {
  const [form, setForm] = useState<StockItemInput>(() =>
    initial
      ? {
          branchId: initial.branchId,
          name: initial.name,
          category: initial.category,
          unit: initial.unit,
          quantity: initial.quantity,
          minQuantity: initial.minQuantity,
          maxQuantity: initial.maxQuantity,
          description: initial.description ?? "",
          supplier: initial.supplier ?? "",
          cost: initial.cost,
        }
      : EMPTY_FORM(defaultBranchId)
  )
  const [customCategory, setCustomCategory] = useState(!SUGGESTED_CATEGORIES.includes(initial?.category ?? ""))

  function set(field: keyof StockItemInput, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.name.trim() || !form.category.trim() || !form.branchId) return
    onSave({
      ...form,
      name: form.name.trim(),
      category: form.category.trim(),
      quantity: Number(form.quantity) || 0,
      minQuantity: Number(form.minQuantity) || 0,
      maxQuantity: form.maxQuantity ? Number(form.maxQuantity) : undefined,
      cost: form.cost != null && form.cost !== (undefined as unknown) ? Number(form.cost) : undefined,
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-lg font-bold text-foreground">
            {initial ? "Editar insumo" : "Nuevo insumo de stock"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Branch <span className="text-red-500">*</span>
            </label>
            <select
              value={form.branchId}
              onChange={(e) => set("branchId", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Seleccionar branch</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Granos de café Colombia"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Categoría <span className="text-red-500">*</span>
            </label>
            {customCategory ? (
              <div className="flex gap-2">
                <Input
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  placeholder="Nombre de la categoría"
                  required
                />
                <button
                  type="button"
                  onClick={() => { setCustomCategory(false); set("category", "") }}
                  className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  Usar lista
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <select
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                  className="flex-1 h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  required
                >
                  <option value="">Seleccionar categoría</option>
                  {SUGGESTED_CATEGORIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setCustomCategory(true)}
                  className="text-xs text-muted-foreground hover:text-foreground whitespace-nowrap"
                >
                  + Otra
                </button>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Unidad</label>
              <select
                value={form.unit}
                onChange={(e) => set("unit", e.target.value as StockUnit)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {STOCK_UNITS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Cantidad actual</label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.quantity}
                onChange={(e) => set("quantity", e.target.value)}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Mínimo (alerta)
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.minQuantity}
                onChange={(e) => set("minQuantity", e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Máximo <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.maxQuantity ?? ""}
                onChange={(e) => set("maxQuantity", e.target.value || undefined)}
                placeholder="Sin límite"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Proveedor <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                value={form.supplier ?? ""}
                onChange={(e) => set("supplier", e.target.value)}
                placeholder="Nombre del proveedor"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Costo unitario <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.cost ?? ""}
                onChange={(e) => set("cost", e.target.value || undefined)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Notas adicionales..."
              rows={2}
              className="w-full px-3 py-2 rounded-lg border border-input bg-background text-sm resize-none focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initial ? "Guardar cambios" : "Crear insumo"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ── Delete confirmation ───────────────────────────────────
function DeleteConfirm({ name, onConfirm, onClose, loading }: { name: string; onConfirm: () => void; onClose: () => void; loading: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-bold text-foreground mb-1">Eliminar insumo</h3>
        <p className="text-sm text-muted-foreground mb-6">
          ¿Eliminar <strong>{name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">Cancelar</Button>
          <Button onClick={onConfirm} disabled={loading} className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

// ── Stock row ─────────────────────────────────────────────
function StockRow({
  item,
  onEdit,
  onDelete,
  onAdjust,
  adjusting,
}: {
  item: StockItem
  onEdit: (item: StockItem) => void
  onDelete: (item: StockItem) => void
  onAdjust: (id: string, delta: number) => void
  adjusting: boolean
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Coffee className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm truncate">{item.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">{item.category}</span>
          {item.supplier && (
            <span className="text-xs text-muted-foreground/60">· {item.supplier}</span>
          )}
        </div>
      </div>

      <div className="hidden sm:block shrink-0">
        <StockBadge item={item} />
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onAdjust(item._id, -1)}
          disabled={item.quantity === 0 || adjusting}
          className="w-7 h-7 rounded-lg border border-border bg-muted/20 flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <Minus className="w-3.5 h-3.5" />
        </button>
        <div className="text-center w-20">
          <span className="font-bold text-lg tabular-nums">{item.quantity}</span>
          <span className="text-xs text-muted-foreground ml-1">{item.unit}</span>
        </div>
        <button
          onClick={() => onAdjust(item._id, +1)}
          disabled={adjusting}
          className="w-7 h-7 rounded-lg border border-border bg-muted/20 flex items-center justify-center hover:bg-muted/40 disabled:opacity-30 transition-all"
        >
          <Plus className="w-3.5 h-3.5" />
        </button>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(item)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(item)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-all"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

// ── Disabled placeholder ──────────────────────────────────
function StockDisabled({ onEnable }: { onEnable: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-muted/20 flex items-center justify-center mb-6">
        <Package className="w-10 h-10 text-muted-foreground opacity-40" />
      </div>
      <h2 className="text-xl font-bold text-foreground mb-2">Control de stock desactivado</h2>
      <p className="text-muted-foreground text-sm max-w-sm mb-8">
        Activa el módulo de stock para gestionar tus insumos: granos de café, jarabes, lácteos y más.
      </p>
      <Button onClick={onEnable} className="gap-2 px-8">
        <ToggleRight className="w-4 h-4" />
        Activar control de stock
      </Button>
    </div>
  )
}

// ── Main view ─────────────────────────────────────────────
export default function StockView() {
  const queryClient = useQueryClient()
  const [selectedBranch, setSelectedBranch] = useState<string | "global">("global")
  const [search, setSearch] = useState("")
  const [filter, setFilter] = useState<"all" | "low" | "out">("all")
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<StockItem | null>(null)
  const [deletingItem, setDeletingItem] = useState<StockItem | null>(null)
  const [adjustingId, setAdjustingId] = useState<string | null>(null)

  const { data: stockEnabled, isLoading: loadingSettings } = useQuery({
    queryKey: ["stock-settings"],
    queryFn: getStockEnabled,
  })

  const { data: branches = [], isLoading: loadingBranches } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
    enabled: stockEnabled === true,
  })

// Fetch ALL items when in global mode
  const { data: paginatedStock, isLoading: loadingItems, refetch, isFetching } = useQuery({
    queryKey: ["stock-items", selectedBranch],
    queryFn: async () => {
      if (selectedBranch === "global") {
        const branchIdForQuery = selectedBranch === "global" ? undefined : selectedBranch
        if (!branchIdForQuery) {
          const allItems: StockItem[] = []
          for (const branch of branches) {
            const result = await getStockItems({ limit: 200, branchId: branch._id })
            allItems.push(...result.data)
          }
          return { data: allItems, pagination: { total: allItems.length, page: 1, limit: 200, pages: 1, hasNext: false, hasPrev: false } }
        }
        return getStockItems({ limit: 200, branchId: branchIdForQuery })
      }
      return getStockItems({ limit: 200, branchId: selectedBranch })
    },
    enabled: stockEnabled === true,
  })

  const items = paginatedStock?.data ?? []

  const toggleMutation = useMutation({
    mutationFn: (enabled: boolean) => setStockEnabled(enabled),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stock-settings"] }),
  })

  const createMutation = useMutation({
    mutationFn: (data: StockItemInput) => createStockItem(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<StockItemInput> }) =>
      updateStockItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] })
      setEditingItem(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteStockItem(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-items"] })
      setDeletingItem(null)
    },
  })

  const adjustMutation = useMutation({
    mutationFn: ({ id, delta }: { id: string; delta: number }) =>
      adjustStockQuantity(id, delta),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["stock-items"] }),
    onSettled: () => setAdjustingId(null),
  })

  const handleAdjust = useCallback(
    (id: string, delta: number) => {
      setAdjustingId(id)
      adjustMutation.mutate({ id, delta })
    },
    [adjustMutation]
  )

  // Global view: aggregate by name+unit and show by branch
  const aggregated: AggregatedItem[] = (() => {
    if (selectedBranch !== "global") return []
    const map = new Map<string, AggregatedItem>()
    for (const item of items) {
      const branch = branches.find(b => b._id === item.branchId)
      const branchName = branch?.name || "Unknown"
      const key = `${item.name}::${item.unit}`
      const existing = map.get(key)
      if (existing) {
        existing.totalQuantity += item.quantity
        existing.branchCount += 1
        if (existing.byBranch) {
          existing.byBranch[item.branchId] = { quantity: item.quantity, branchName }
        }
      } else {
        map.set(key, {
          name: item.name,
          category: item.category,
          unit: item.unit,
          totalQuantity: item.quantity,
          minQuantity: item.minQuantity,
          branchCount: 1,
          byBranch: { [item.branchId]: { quantity: item.quantity, branchName } },
        })
      }
    }
    return Array.from(map.values())
  })()

  const displayItems = selectedBranch === "global" ? [] : items

  const filtered = displayItems.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch =
      item.name.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q) ||
      (item.supplier ?? "").toLowerCase().includes(q)
    const matchFilter =
      filter === "all"
        ? true
        : filter === "out"
        ? item.quantity === 0
        : filter === "low"
        ? item.quantity > 0 && item.quantity <= item.minQuantity
        : true
    return matchSearch && matchFilter
  })

  const filteredAggregated = aggregated.filter((item) => {
    const q = search.toLowerCase()
    const matchSearch = item.name.toLowerCase().includes(q) || item.category.toLowerCase().includes(q)
    const matchFilter =
      filter === "all"
        ? true
        : filter === "out"
        ? item.totalQuantity === 0
        : filter === "low"
        ? item.totalQuantity > 0 && item.totalQuantity <= item.minQuantity
        : true
    return matchSearch && matchFilter
  })

  const countSource = selectedBranch === "global" ? aggregated : items
  const outCount = selectedBranch === "global"
    ? aggregated.filter((i) => i.totalQuantity === 0).length
    : items.filter((i) => i.quantity === 0).length
  const lowCount = selectedBranch === "global"
    ? aggregated.filter((i) => i.totalQuantity > 0 && i.totalQuantity <= i.minQuantity).length
    : items.filter((i) => i.quantity > 0 && i.quantity <= i.minQuantity).length

  const defaultBranchId = selectedBranch === "global" ? (branches[0]?._id ?? "") : selectedBranch

  if (loadingSettings) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Control de Stock</h1>
            <p className="text-muted-foreground mt-1">
              {stockEnabled
                ? selectedBranch === "global"
                  ? "Vista global — suma de todas las branches"
                  : `Branch: ${branches.find((b) => b._id === selectedBranch)?.name ?? "..."}`
                : "Módulo desactivado — actívalo para comenzar"}
            </p>
          </div>

          <div className="flex items-center gap-3 p-4 rounded-2xl border border-border/40 bg-card/40">
            <div className="hidden sm:block">
              <p className="text-sm font-semibold text-foreground">
                {stockEnabled ? "Activado" : "Desactivado"}
              </p>
              <p className="text-xs text-muted-foreground">Control de stock</p>
            </div>
            <button
              onClick={() => toggleMutation.mutate(!stockEnabled)}
              disabled={toggleMutation.isPending}
              className="shrink-0"
            >
              {stockEnabled ? (
                <ToggleRight className="w-10 h-10 text-primary" />
              ) : (
                <ToggleLeft className="w-10 h-10 text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {!stockEnabled ? (
          <StockDisabled onEnable={() => toggleMutation.mutate(true)} />
        ) : (
          <>
            <BranchTabs
              branches={branches}
              selected={selectedBranch}
              onChange={(id) => {
                setSelectedBranch(id)
                setSearch("")
                setFilter("all")
              }}
              loading={loadingBranches}
            />

            {(outCount > 0 || lowCount > 0) && (
              <div className="mb-6 p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                <p className="text-sm text-yellow-700">
                  {outCount > 0 && <strong>{outCount} insumo{outCount > 1 ? "s" : ""} sin stock</strong>}
                  {outCount > 0 && lowCount > 0 && " · "}
                  {lowCount > 0 && <strong>{lowCount} con stock bajo</strong>}
                  . Revisa tu inventario.
                </p>
              </div>
            )}

            <div className="grid grid-cols-3 gap-4 mb-6">
              <button
                onClick={() => setFilter("all")}
                className={`rounded-2xl p-4 text-left transition-all hover:shadow-lg border ${filter === "all" ? "border-primary/50 ring-1 ring-primary/30 bg-card/60" : "border-border/40 bg-card/30"}`}
              >
                <p className="text-2xl font-bold text-foreground">{countSource.length}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Total insumos</p>
              </button>
              <button
                onClick={() => setFilter("low")}
                className={`rounded-2xl p-4 text-left transition-all hover:shadow-lg border ${filter === "low" ? "border-yellow-500/50 ring-1 ring-yellow-500/30 bg-yellow-50/20" : "border-border/40 bg-card/30"}`}
              >
                <p className="text-2xl font-bold text-yellow-500">{lowCount}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Stock bajo</p>
              </button>
              <button
                onClick={() => setFilter("out")}
                className={`rounded-2xl p-4 text-left transition-all hover:shadow-lg border ${filter === "out" ? "border-red-500/50 ring-1 ring-red-500/30 bg-red-50/20" : "border-border/40 bg-card/30"}`}
              >
                <p className="text-2xl font-bold text-red-500">{outCount}</p>
                <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">Sin stock</p>
              </button>
            </div>

            <div className="flex gap-3 mb-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buscar insumo, categoría o proveedor..."
                  className="pl-9 bg-muted/20 border"
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="gap-2 shrink-0"
              >
                <RefreshCw className={`w-4 h-4 ${isFetching ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
              {selectedBranch !== "global" && (
                <Button
                  size="sm"
                  onClick={() => setShowForm(true)}
                  className="gap-2 shrink-0"
                >
                  <Plus className="w-4 h-4" />
                  <span className="hidden sm:inline">Nuevo insumo</span>
                </Button>
              )}
            </div>

            {loadingItems ? (
              <div className="flex items-center justify-center h-40">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : selectedBranch === "global" ? (
              filteredAggregated.length === 0 ? (
                <div className="text-center py-16 text-muted-foreground">
                  <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  <p>No hay insumos registrados en ninguna branch</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {filteredAggregated.map((item) => (
                    <GlobalRow key={`${item.name}::${item.unit}`} item={item} branches={branches} />
                  ))}
                </div>
              )
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <Package className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="mb-4">
                  {items.length === 0
                    ? "No hay insumos en esta branch"
                    : "No hay insumos que coincidan con el filtro"}
                </p>
                {items.length === 0 && (
                  <Button onClick={() => setShowForm(true)} className="gap-2">
                    <Plus className="w-4 h-4" />
                    Agregar primer insumo
                  </Button>
                )}
              </div>
            ) : (
              <div className="space-y-2">
                {filtered.map((item) => (
                  <StockRow
                    key={item._id}
                    item={item}
                    onEdit={(i) => setEditingItem(i)}
                    onDelete={(i) => setDeletingItem(i)}
                    onAdjust={handleAdjust}
                    adjusting={adjustingId === item._id}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <FormModal
          initial={null}
          branches={branches}
          defaultBranchId={defaultBranchId}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setShowForm(false)}
          loading={createMutation.isPending}
        />
      )}

      {editingItem && (
        <FormModal
          initial={editingItem}
          branches={branches}
          defaultBranchId={editingItem.branchId}
          onSave={(data) => updateMutation.mutate({ id: editingItem._id, data })}
          onClose={() => setEditingItem(null)}
          loading={updateMutation.isPending}
        />
      )}

      {deletingItem && (
        <DeleteConfirm
          name={deletingItem.name}
          onConfirm={() => deleteMutation.mutate(deletingItem._id)}
          onClose={() => setDeletingItem(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
