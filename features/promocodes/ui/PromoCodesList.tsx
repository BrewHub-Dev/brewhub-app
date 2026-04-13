"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getPromoCodes,
  createPromoCode,
  updatePromoCode,
  deletePromoCode,
  type PromoCode,
  type PromoCodeInput,
} from "../api"
import {
  Tag,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Gift,
  Percent,
  DollarSign,
  Calendar,
  Clock,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"


const PAGE_SIZES = [20, 30, 40] as const

const PROMO_TYPES = [
  { value: "percentage", label: "Porcentaje (%)", icon: Percent },
  { value: "fixed", label: "Monto fijo ($)", icon: DollarSign },
  { value: "buy_x_get_y", label: "2x1 (Comprar X, llevar Y)", icon: Gift },
] as const

function PromoBadge({ promo }: { promo: PromoCode }) {
  const TypeIcon = PROMO_TYPES.find((t) => t.value === promo.type)?.icon || Gift

  if (!promo.isActive) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-100 text-gray-600 border border-gray-200">
        Inactivo
      </span>
    )
  }

  const isExpired = promo.validUntil && new Date(promo.validUntil) < new Date()
  if (isExpired) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-700 border border-red-200">
        <AlertCircle className="w-3 h-3" /> Expirado
      </span>
    )
  }

  const isValid = !promo.validFrom || new Date(promo.validFrom) <= new Date()
  if (!isValid) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-700 border border-blue-200">
        <Clock className="w-3 h-3" /> Pendiente
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 border border-green-200">
      <TypeIcon className="w-3 h-3" />{" "}
      {promo.type === "percentage" ? `${promo.value}%` : promo.type === "fixed" ? `$${promo.value}` : `${promo.value}x1`}
    </span>
  )
}

function PromoForm({
  initial,
  onSave,
  onClose,
  loading,
}: {
  initial?: PromoCode | null
  onSave: (data: PromoCodeInput) => void
  onClose: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<PromoCodeInput>(
    initial
      ? {
          code: initial.code,
          type: initial.type,
          value: initial.value,
          description: initial.description ?? "",
          target: initial.target ?? "all",
          applicableItems: initial.applicableItems ?? [],
          applicableCategories: initial.applicableCategories ?? [],
          minOrderAmount: initial.minOrderAmount,
          maxDiscount: initial.maxDiscount,
          maxUses: initial.maxUses,
          perUserLimit: initial.perUserLimit,
          validFrom: initial.validFrom?.split("T")[0] ?? "",
          validUntil: initial.validUntil?.split("T")[0] ?? "",
          isActive: initial.isActive,
        }
      : {
          code: "",
          type: "percentage",
          value: 10,
          description: "",
          target: "all",
          isActive: true,
        }
  )

  const [scheduleEnabled, setScheduleEnabled] = useState(!!initial?.validFrom || !!initial?.validUntil)

  function set(field: keyof PromoCodeInput, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.code.trim() || !form.value) return

    const data: PromoCodeInput = {
      ...form,
      code: form.code.trim().toUpperCase(),
      value: Number(form.value) || 0,
      minOrderAmount: form.minOrderAmount ? Number(form.minOrderAmount) : undefined,
      maxDiscount: form.maxDiscount ? Number(form.maxDiscount) : undefined,
      maxUses: form.maxUses ? Number(form.maxUses) : undefined,
      perUserLimit: form.perUserLimit ? Number(form.perUserLimit) : undefined,
      validFrom: scheduleEnabled && form.validFrom ? new Date(form.validFrom).toISOString() : undefined,
      validUntil: scheduleEnabled && form.validUntil ? new Date(form.validUntil).toISOString() : undefined,
    }

    onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-lg font-bold text-foreground">
            {initial ? "Editar cupón" : "Nuevo cupón de descuento"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Código <span className="text-red-500">*</span>
            </label>
            <Input
              value={form.code}
              onChange={(e) => set("code", e.target.value)}
              placeholder="EJ: DESCUENTO20"
              className="uppercase font-mono"
              required
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Tipo <span className="text-red-500">*</span>
              </label>
              <select
                value={form.type}
                onChange={(e) => set("type", e.target.value)}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                {PROMO_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Valor <span className="text-red-500">*</span>
              </label>
              <Input
                type="number"
                min="0"
                step={form.type === "percentage" ? "1" : "0.01"}
                max={form.type === "percentage" ? "100" : undefined}
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Descripción <span className="text-muted-foreground text-xs">(opcional)</span>
            </label>
            <Input
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Ej: Descuento por lanzamiento"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Mínimo orden <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.minOrderAmount ?? ""}
                onChange={(e) => set("minOrderAmount", e.target.value || undefined)}
                placeholder="0.00"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Descuento máx. <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="number"
                min="0"
                step="0.01"
                value={form.maxDiscount ?? ""}
                onChange={(e) => set("maxDiscount", e.target.value || undefined)}
                placeholder="Sin límite"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Límite usos <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="number"
                min="1"
                value={form.maxUses ?? ""}
                onChange={(e) => set("maxUses", e.target.value || undefined)}
                placeholder="Sin límite"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Por usuario <span className="text-muted-foreground text-xs">(opcional)</span>
              </label>
              <Input
                type="number"
                min="1"
                value={form.perUserLimit ?? ""}
                onChange={(e) => set("perUserLimit", e.target.value || undefined)}
                placeholder="Sin límite"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={scheduleEnabled}
                onChange={(e) => setScheduleEnabled(e.target.checked)}
                className="rounded border-input"
              />
              <span className="font-medium text-foreground">Programar vigencia</span>
            </label>

            {scheduleEnabled && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Desde</label>
                  <Input
                    type="date"
                    value={form.validFrom ?? ""}
                    onChange={(e) => set("validFrom", e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Hasta</label>
                  <Input
                    type="date"
                    value={form.validUntil ?? ""}
                    onChange={(e) => set("validUntil", e.target.value)}
                  />
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="isActive"
              checked={form.isActive ?? true}
              onChange={(e) => set("isActive", e.target.checked)}
              className="rounded border-input"
            />
            <label htmlFor="isActive" className="text-sm text-foreground">
              Cupón activo
            </label>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initial ? "Guardar cambios" : "Crear cupón"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

function DeleteConfirm({
  name,
  onConfirm,
  onClose,
  loading,
}: {
  name: string
  onConfirm: () => void
  onClose: () => void
  loading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center">
        <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <h3 className="font-bold text-foreground mb-1">Eliminar cupón</h3>
        <p className="text-sm text-muted-foreground mb-6">
          ¿Eliminar el código <strong>{name}</strong>? Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancelar
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
            Eliminar
          </Button>
        </div>
      </div>
    </div>
  )
}

function PromoRow({
  promo,
  onEdit,
  onDelete,
}: {
  promo: PromoCode
  onEdit: (promo: PromoCode) => void
  onDelete: (promo: PromoCode) => void
}) {
  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <Tag className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm font-mono">{promo.code}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {promo.description || "Sin descripción"}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <PromoBadge promo={promo} />
      </div>

      <div className="text-right shrink-0 hidden sm:block w-24">
        <span className="text-xs text-muted-foreground">
          {promo.usesCount || 0} / {promo.maxUses || "∞"}
        </span>
      </div>

      {promo.validFrom || promo.validUntil ? (
        <div className="shrink-0 hidden md:block">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <Calendar className="w-3 h-3" />
            {promo.validUntil
              ? new Date(promo.validUntil).toLocaleDateString("es-MX")
              : "Sin fecha"}
          </div>
        </div>
      ) : null}

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(promo)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(promo)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-all"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function PromoCodesList() {
  const [pageSize, setPageSize] = useState(20);
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingPromo, setEditingPromo] = useState<PromoCode | null>(null)
  const [deletingPromo, setDeletingPromo] = useState<PromoCode | null>(null)

  const { data: promos = [], isLoading } = useQuery({
    queryKey: ["promocodes"],
    queryFn: getPromoCodes,
  })

  const paginatedPromos = promos.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(promos.length / pageSize)

  function goToPrev() {
    if (page > 1) setPage(page - 1)
  }

  function goToNext() {
    if (page < totalPages) setPage(page + 1)
  }

  function handlePageSizeChange(newSize: number) {
    setPageSize(newSize)
    setPage(1)
  }

  const createMutation = useMutation({
    mutationFn: (data: PromoCodeInput) => createPromoCode(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocodes"] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<PromoCodeInput> }) =>
      updatePromoCode(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocodes"] })
      setEditingPromo(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deletePromoCode(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["promocodes"] })
      setDeletingPromo(null)
    },
  })

  const activeCount = promos.filter((p) => p.isActive).length
  const expiredCount = promos.filter(
    (p) => p.isActive && p.validUntil && new Date(p.validUntil) < new Date()
  ).length

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Promociones</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona tus cupones y descuentos
            </p>
          </div>

          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nuevo cupón
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl p-4 border border-border/40 bg-card/30">
            <p className="text-2xl font-bold text-foreground">{promos.length}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Total cupones
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-green-500/30 bg-green-50/20">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Activos
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-red-500/30 bg-red-50/20">
            <p className="text-2xl font-bold text-red-600">{expiredCount}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Expirados
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="mb-4">No hay cupones yet</p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear primer cupón
            </Button>
          </div>
        ) : promos.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Tag className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="mb-4">No hay cupones todavía</p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear primer cupón
            </Button>
          </div>
        ) : (
          <>
            <div className="space-y-2">
              {paginatedPromos.map((promo) => (
              <PromoRow
                key={promo._id}
                promo={promo}
                onEdit={(p) => setEditingPromo(p)}
                onDelete={(p) => setDeletingPromo(p)}
              />
            ))}
            </div>

            {totalPages >= 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-border/40">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Mostrar</span>
                  <select
                    value={pageSize}
                    onChange={(e) => handlePageSizeChange(Number(e.target.value))}
                    className="h-8 px-2 rounded-lg border border-border bg-background text-sm hover:bg-muted/50 transition-colors"
                  >
                    {PAGE_SIZES.map((size) => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </select>
                  <span className="text-sm text-muted-foreground">por página</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm text-muted-foreground">
                    Página {page} de {totalPages} ({promos.length} total)
                  </span>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToPrev}
                      disabled={page === 1}
                      className="gap-1"
                    >
                      <ChevronLeft className="w-4 h-4" />
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={goToNext}
                      disabled={page === totalPages}
                      className="gap-1"
                    >
                      Siguiente
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {showForm && (
        <PromoForm
          initial={null}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setShowForm(false)}
          loading={createMutation.isPending}
        />
      )}

      {editingPromo && (
        <PromoForm
          initial={editingPromo}
          onSave={(data) => updateMutation.mutate({ id: editingPromo._id, data })}
          onClose={() => setEditingPromo(null)}
          loading={updateMutation.isPending}
        />
      )}

      {deletingPromo && (
        <DeleteConfirm
          name={deletingPromo.code}
          onConfirm={() => deleteMutation.mutate(deletingPromo._id)}
          onClose={() => setDeletingPromo(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
