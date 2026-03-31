"use client"
import { useState, useRef } from "react"
import { useQuery } from "@tanstack/react-query"
import { Plus, Trash2, Upload, X, ImageIcon, Loader2, ChevronDown, ChevronUp } from "lucide-react"
import { Select } from "@/components/ui/Select"
import type { ItemFormData, ItemModifier, ItemModifierOption } from "../types"
import { getCategories, uploadItemImage } from "../api"

interface ImageUploadProps {
  images: string[]
  onChange: (images: string[]) => void
}

function ImageUpload({ images, onChange }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    setError(null)
    setUploading(true)
    try {
      const result = await uploadItemImage(file)
      onChange([result.url, ...images.filter((u) => u !== result.url)])
    } catch (e: any) {
      setError(e.message ?? "Error al subir imagen")
    } finally {
      setUploading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ""
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  const removeImage = (url: string) => {
    onChange(images.filter((u) => u !== url))
  }

  const previewUrl = images[0] ?? null

  return (
    <div>
      <label className="text-sm text-muted-foreground block mb-2 font-medium">Imagen del producto</label>
      <div
        className="relative glass rounded-xl border-2 border-dashed border-border/50 overflow-hidden cursor-pointer hover:border-primary/50 transition-colors"
        style={{ minHeight: 140 }}
        onClick={() => !uploading && inputRef.current?.click()}
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
      >
        {previewUrl ? (
          <div className="relative w-full h-36">
            <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); removeImage(previewUrl) }}
              className="absolute top-2 right-2 p-1 bg-black/60 rounded-full text-white hover:bg-black/80 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="absolute bottom-2 left-2">
              <span className="text-xs bg-black/60 text-white px-2 py-1 rounded-full">
                Click para cambiar
              </span>
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-36 gap-2 text-muted-foreground">
            {uploading ? (
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            ) : (
              <>
                <Upload className="w-8 h-8" />
                <span className="text-sm">Arrastra o haz click para subir</span>
                <span className="text-xs">JPEG, PNG, WebP o GIF · máx. 5 MB</span>
              </>
            )}
          </div>
        )}
        {uploading && previewUrl && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-white" />
          </div>
        )}
      </div>
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={handleInputChange} />
    </div>
  )
}

interface ModifiersEditorProps {
  modifiers: ItemModifier[]
  onChange: (modifiers: ItemModifier[]) => void
}

function ModifiersEditor({ modifiers, onChange }: ModifiersEditorProps) {
  const [expanded, setExpanded] = useState<Set<number>>(new Set())

  const toggleExpanded = (i: number) => {
    const next = new Set(expanded)
    next.has(i) ? next.delete(i) : next.add(i)
    setExpanded(next)
  }

  const addGroup = () => {
    const next = [...modifiers, { name: "", required: false, options: [] }]
    onChange(next)
    setExpanded((prev) => new Set([...prev, next.length - 1]))
  }

  const removeGroup = (i: number) => {
    const next = modifiers.filter((_, idx) => idx !== i)
    onChange(next)
    const nextExpanded = new Set(expanded)
    nextExpanded.delete(i)
    setExpanded(nextExpanded)
  }

  const updateGroup = (i: number, partial: Partial<ItemModifier>) => {
    const next = modifiers.map((m, idx) => (idx === i ? { ...m, ...partial } : m))
    onChange(next)
  }

  const addOption = (i: number) => {
    const options: ItemModifierOption[] = [...modifiers[i].options, { name: "", extraPrice: 0 }]
    updateGroup(i, { options })
  }

  const removeOption = (i: number, j: number) => {
    const options = modifiers[i].options.filter((_, idx) => idx !== j)
    updateGroup(i, { options })
  }

  const updateOption = (i: number, j: number, partial: Partial<ItemModifierOption>) => {
    const options = modifiers[i].options.map((opt, idx) => (idx === j ? { ...opt, ...partial } : opt))
    updateGroup(i, { options })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <label className="text-sm text-muted-foreground font-medium">
          Modificadores <span className="text-xs">({modifiers.length})</span>
        </label>
        <button
          type="button"
          onClick={addGroup}
          className="flex items-center gap-1 text-xs px-3 py-1.5 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          Agregar grupo
        </button>
      </div>

      {modifiers.length === 0 && (
        <div className="glass rounded-xl px-4 py-6 text-center text-sm text-muted-foreground">
          Sin modificadores. Agrega grupos como "Tamaño", "Extras", "Temperatura"…
        </div>
      )}

      <div className="space-y-3">
        {modifiers.map((group, i) => (
          <div key={i} className="glass rounded-xl overflow-hidden">
            {/* Group header */}
            <div className="flex items-center gap-3 px-4 py-3">
              <button
                type="button"
                onClick={() => toggleExpanded(i)}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {expanded.has(i) ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
              <input
                type="text"
                value={group.name}
                onChange={(e) => updateGroup(i, { name: e.target.value })}
                placeholder="Nombre del grupo (ej: Tamaño)"
                className="flex-1 bg-transparent text-foreground placeholder:text-muted-foreground focus:outline-none text-sm font-medium"
              />
              <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={group.required}
                  onChange={(e) => updateGroup(i, { required: e.target.checked })}
                  className="rounded accent-primary"
                />
                Obligatorio
              </label>
              <span className="text-xs text-muted-foreground bg-muted/50 px-2 py-0.5 rounded-full">
                {group.options.length} opciones
              </span>
              <button
                type="button"
                onClick={() => removeGroup(i)}
                className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Options */}
            {expanded.has(i) && (
              <div className="px-4 pb-4 border-t border-border/30 pt-3 space-y-2">
                {group.options.length === 0 && (
                  <p className="text-xs text-muted-foreground py-1">Sin opciones aún.</p>
                )}
                {group.options.map((opt, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <input
                      type="text"
                      value={opt.name}
                      onChange={(e) => updateOption(i, j, { name: e.target.value })}
                      placeholder="Nombre de la opción (ej: Grande)"
                      className="flex-1 glass rounded-lg px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">+$</span>
                      <input
                        type="number"
                        value={opt.extraPrice}
                        onChange={(e) => updateOption(i, j, { extraPrice: parseFloat(e.target.value) || 0 })}
                        min="0"
                        step="0.50"
                        className="w-24 glass rounded-lg pl-7 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => removeOption(i, j)}
                      className="p-1.5 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addOption(i)}
                  className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Agregar opción
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}


interface ItemFormProps {
  initialData?: ItemFormData
  onSubmit: (data: ItemFormData) => void
  onCancel: () => void
  isSubmitting?: boolean
}

export default function ItemForm({ initialData, onSubmit, onCancel, isSubmitting }: Readonly<ItemFormProps>) {
  const [name, setName] = useState(initialData?.name ?? "")
  const [code, setCode] = useState(initialData?.code ?? "")
  const [price, setPrice] = useState(initialData?.price ?? 0)
  const [cost, setCost] = useState<number | "">(initialData?.cost ?? "")
  const [categoryId, setCategoryId] = useState(initialData?.categoryId ?? "")
  const [description, setDescription] = useState(initialData?.description ?? "")
  const [taxIncluded, setTaxIncluded] = useState(initialData?.taxIncluded ?? false)
  const [active, setActive] = useState(initialData?.active ?? true)
  const [images, setImages] = useState<string[]>(initialData?.images ?? [])
  const [modifiers, setModifiers] = useState<ItemModifier[]>(initialData?.modifiers ?? [])

  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({
      name,
      code,
      price,
      cost: cost === "" ? undefined : Number(cost),
      categoryId,
      description: description || undefined,
      taxIncluded,
      active,
      images,
      modifiers,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">Nombre *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Café Americano"
            required
            className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">Código / SKU *</label>
          <input
            type="text"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Ej: AMERICANO-12"
            required
            className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">Precio *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              className="w-full glass rounded-xl pl-8 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">Costo</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              value={cost}
              onChange={(e) => setCost(e.target.value === "" ? "" : parseFloat(e.target.value))}
              step="0.01"
              min="0"
              placeholder="0.00"
              className="w-full glass rounded-xl pl-8 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">Categoría *</label>
          <Select
            value={categoryId}
            onChange={setCategoryId}
            required
            disabled={isLoadingCategories}
            placeholder={isLoadingCategories ? "Cargando…" : "Seleccionar"}
            options={categories.map((cat) => ({ value: cat._id, label: cat.name }))}
          />
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2 font-medium">Descripción</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          placeholder="Ej: 12oz, Café negro filtrado…"
          className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      {/* Image upload */}
      <ImageUpload images={images} onChange={setImages} />

      {/* Modifiers */}
      <ModifiersEditor modifiers={modifiers} onChange={setModifiers} />

      {/* Settings row */}
      <div className="flex items-center gap-6">
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={taxIncluded}
            onChange={(e) => setTaxIncluded(e.target.checked)}
            className="rounded accent-primary w-4 h-4"
          />
          <span className="text-sm text-muted-foreground">Impuesto incluido</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={active}
            onChange={(e) => setActive(e.target.checked)}
            className="rounded accent-primary w-4 h-4"
          />
          <span className="text-sm text-muted-foreground">Activo</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex gap-4 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 glass rounded-xl text-foreground hover:shadow-lg transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-medium shadow-lg shadow-primary/30 disabled:opacity-60 disabled:scale-100 flex items-center justify-center gap-2"
        >
          {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
          {initialData ? "Actualizar" : "Crear"} Item
        </button>
      </div>
    </form>
  )
}
