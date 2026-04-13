"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import {
  getRecipes,
  createRecipe,
  updateRecipe,
  deleteRecipe,
  type Recipe,
  type RecipeInput,
} from "../api"
import type { Item } from "@/features/items/types"
import { getItems } from "@/features/items/api"
import { getStockItems, type StockItem } from "@/features/stock/api"
import { getBranches, type Branch } from "@/features/branches/api"
import {
  ChefHat,
  Plus,
  Edit2,
  Trash2,
  X,
  Save,
  Loader2,
  Search,
  AlertTriangle,
  Package,
  Coffee,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

const PAGE_SIZES = [20, 30, 40] as const
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function RecipeForm({
  initial,
  branches,
  items,
  stockItems,
  defaultBranchId,
  onSave,
  onClose,
  loading,
}: {
  initial?: Recipe | null
  branches: Branch[]
  items: Item[]
  stockItems: StockItem[]
  defaultBranchId: string
  onSave: (data: RecipeInput) => void
  onClose: () => void
  loading: boolean
}) {
  const [form, setForm] = useState<{
    branchId: string
    itemId: string
    name: string
    ingredients: { stockItemId: string; quantity: number; unit: string }[]
    yield: number
    instructions: string
    isActive: boolean
  }>(
    initial
      ? {
          branchId: initial.branchId,
          itemId: initial.itemId,
          name: initial.name,
          ingredients: initial.ingredients,
          yield: initial.yield,
          instructions: initial.instructions ?? "",
          isActive: initial.isActive,
        }
      : {
          branchId: defaultBranchId,
          itemId: "",
          name: "",
          ingredients: [],
          yield: 1,
          instructions: "",
          isActive: true,
        }
  )

  const [addingIngredient, setAddingIngredient] = useState(false)
  const [newIngredient, setNewIngredient] = useState({ stockItemId: "", quantity: 1, unit: "" })

  const selectedItem = items.find((i) => i._id === form.itemId)

  function set(field: string, value: unknown) {
    setForm((f) => ({ ...f, [field]: value }))
  }

  function addIngredient() {
    if (!newIngredient.stockItemId || !newIngredient.quantity) return
    setForm((f) => ({
      ...f,
      ingredients: [...f.ingredients, { ...newIngredient }],
    }))
    setAddingIngredient(false)
    setNewIngredient({ stockItemId: "", quantity: 1, unit: "" })
  }

  function removeIngredient(index: number) {
    setForm((f) => ({
      ...f,
      ingredients: f.ingredients.filter((_, i) => i !== index),
    }))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.itemId || !form.name || form.ingredients.length === 0) return

    const data: RecipeInput = {
      itemId: form.itemId,
      branchId: form.branchId,
      name: form.name,
      ingredients: form.ingredients,
      yield: form.yield,
      instructions: form.instructions || undefined,
      isActive: form.isActive,
    }

    onSave(data)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-border/40">
          <h2 className="text-lg font-bold text-foreground">
            {initial ? "Editar receta" : "Nueva receta"}
          </h2>
          <button onClick={onClose} className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/40">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Sucursal <span className="text-red-500">*</span>
            </label>
            <select
              value={form.branchId}
              onChange={(e) => set("branchId", e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Seleccionar sucursal</option>
              {branches.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Producto <span className="text-red-500">*</span>
            </label>
            <select
              value={form.itemId}
              onChange={(e) => {
                const item = items.find((i) => i._id === e.target.value)
                set("itemId", e.target.value)
                if (item && !form.name) {
                  set("name", `Receta de ${item.name}`)
                }
              }}
              className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              required
            >
              <option value="">Seleccionar producto</option>
              {items.map((item) => (
                <option key={item._id} value={item._id}>
                  {item.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-1">
              Nombre de la receta
            </label>
            <Input
              value={form.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder="Ej: Receta de Café Latte"
              required
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-foreground">
                Ingredientes <span className="text-red-500">*</span>
              </label>
              <button
                type="button"
                onClick={() => setAddingIngredient(true)}
                className="text-xs text-primary hover:underline"
              >
                + Agregar
              </button>
            </div>

            {form.ingredients.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
                Agrega los ingredientes necesarios
              </p>
            ) : (
              <div className="space-y-2">
                {form.ingredients.map((ing, idx) => {
                  const stock = stockItems.find((s) => s._id === ing.stockItemId)
                  return (
                    <div
                      key={idx}
                      className="flex items-center gap-2 p-2 rounded-lg bg-muted/20"
                    >
                      <Package className="w-4 h-4 text-muted-foreground" />
                      <span className="flex-1 text-sm">{stock?.name || ing.stockItemId}</span>
                      <span className="text-sm font-medium">
                        {ing.quantity} {ing.unit}
                      </span>
                      <button
                        type="button"
                        onClick={() => removeIngredient(idx)}
                        className="p-1 text-muted-foreground hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {addingIngredient && (
            <div className="p-3 rounded-lg bg-muted/20 space-y-2">
              <select
                value={newIngredient.stockItemId}
                onChange={(e) => {
                  const stock = stockItems.find((s) => s._id === e.target.value)
                  setNewIngredient((n) => ({
                    ...n,
                    stockItemId: e.target.value,
                    unit: stock?.unit || "",
                  }))
                }}
                className="w-full h-10 px-3 rounded-lg border border-input bg-background text-sm"
              >
                <option value="">Seleccionar insumo</option>
                {stockItems.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name} ({s.unit})
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={newIngredient.quantity}
                  onChange={(e) =>
                    setNewIngredient((n) => ({
                      ...n,
                      quantity: Number(e.target.value) || 0,
                    }))
                  }
                  placeholder="Cantidad"
                  className="flex-1"
                />
                <span className="text-sm text-muted-foreground self-center">
                  {newIngredient.unit}
                </span>
                <Button type="button" size="sm" onClick={addIngredient}>
                  Agregar
                </Button>
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">Porciones</label>
              <Input
                type="number"
                min="1"
                value={form.yield}
                onChange={(e) => set("yield", Number(e.target.value) || 1)}
              />
            </div>
            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isActive"
                checked={form.isActive}
                onChange={(e) => set("isActive", e.target.checked)}
                className="rounded border-input"
              />
              <label htmlFor="isActive" className="text-sm text-foreground">
                Receta activa
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1 gap-2">
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {initial ? "Guardar" : "Crear receta"}
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
        <h3 className="font-bold text-foreground mb-1">Eliminar receta</h3>
        <p className="text-sm text-muted-foreground mb-6">
          ¿Eliminar la receta <strong>{name}</strong>? Esta acción no se puede deshacer.
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

function RecipeRow({
  recipe,
  items,
  onEdit,
  onDelete,
}: {
  recipe: Recipe
  items: Item[]
  onEdit: (recipe: Recipe) => void
  onDelete: (recipe: Recipe) => void
}) {
  const item = items.find((i) => i._id === recipe.itemId)

  return (
    <div className="flex items-center gap-3 p-4 rounded-xl border border-border/40 bg-card/30 hover:shadow-md transition-all">
      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <ChefHat className="w-5 h-5 text-primary" />
      </div>

      <div className="flex-1 min-w-0">
        <p className="font-semibold text-foreground text-sm">{recipe.name}</p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-xs text-muted-foreground">
            {item?.name || recipe.itemId}
          </span>
          <span className="text-xs text-muted-foreground/60">·</span>
          <span className="text-xs text-muted-foreground">
            {recipe.ingredients.length} ingrediente(s)
          </span>
        </div>
      </div>

      {!recipe.isActive && (
        <span className="text-xs text-muted-foreground">Inactiva</span>
      )}

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={() => onEdit(recipe)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted/30 hover:text-foreground transition-all"
          title="Editar"
        >
          <Edit2 className="w-4 h-4" />
        </button>
        <button
          onClick={() => onDelete(recipe)}
          className="p-1.5 rounded-lg text-muted-foreground hover:bg-red-100 hover:text-red-600 transition-all"
          title="Eliminar"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  )
}

export default function RecipesList() {
  const [pageSize, setPageSize] = useState(20);
  const queryClient = useQueryClient()
  const [page, setPage] = useState(1)
  const [showForm, setShowForm] = useState(false)
  const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null)
  const [deletingRecipe, setDeletingRecipe] = useState<Recipe | null>(null)
  const [search, setSearch] = useState("")

  const { data: branches = [] } = useQuery({
    queryKey: ["branches"],
    queryFn: getBranches,
  })

  const defaultBranchId = branches[0]?._id || ""

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["items"],
    queryFn: () => getItems({ limit: 200 }),
    select: (data) => data.data,
  })

  const { data: stockItems = [], isLoading: loadingStock } = useQuery({
    queryKey: ["stock-items", defaultBranchId],
    queryFn: () => getStockItems({ limit: 200, branchId: defaultBranchId }),
    select: (data) => data.data,
    enabled: !!defaultBranchId,
  })

  const { data: recipes = [], isLoading } = useQuery({
    queryKey: ["recipes", defaultBranchId],
    queryFn: () => getRecipes(defaultBranchId),
    enabled: !!defaultBranchId,
  })

  const filtered = recipes.filter((r) =>
    search ? r.name.toLowerCase().includes(search.toLowerCase()) : true
  )

  const paginatedRecipes = filtered.slice((page - 1) * pageSize, page * pageSize)
  const totalPages = Math.ceil(filtered.length / pageSize)

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
    mutationFn: (data: RecipeInput) => createRecipe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
      setShowForm(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<RecipeInput> }) =>
      updateRecipe(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
      setEditingRecipe(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteRecipe(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipes"] })
      setDeletingRecipe(null)
    },
  })

  const activeCount = recipes.filter((r) => r.isActive).length

  if (!defaultBranchId) {
    return (
      <div className="p-6 md:p-8 text-center">
        <BookOpen className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-30" />
        <p className="text-muted-foreground">Crea una sucursal primero para gestionar recetas</p>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Recetas</h1>
            <p className="text-muted-foreground mt-1">
              Gestiona recetas e inventario real
            </p>
          </div>

          <Button onClick={() => setShowForm(true)} className="gap-2">
            <Plus className="w-4 h-4" />
            Nueva receta
          </Button>
        </div>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="rounded-2xl p-4 border border-border/40 bg-card/30">
            <p className="text-2xl font-bold text-foreground">{recipes.length}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Total recetas
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-green-500/30 bg-green-50/20">
            <p className="text-2xl font-bold text-green-600">{activeCount}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Activas
            </p>
          </div>
          <div className="rounded-2xl p-4 border border-yellow-500/30 bg-yellow-50/20">
            <p className="text-2xl font-bold text-yellow-600">{stockItems.filter((s) => s.quantity <= s.minQuantity).length}</p>
            <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wide">
              Stock bajo
            </p>
          </div>
        </div>

        <div className="flex gap-3 mb-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar receta..."
              className="pl-9 bg-muted/20 border"
            />
          </div>
        </div>

        {isLoading || loadingItems || loadingStock ? (
          <div className="flex items-center justify-center h-40">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : recipes.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <ChefHat className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p className="mb-4">No hay recetas todavía</p>
            <Button onClick={() => setShowForm(true)} className="gap-2">
              <Plus className="w-4 h-4" />
              Crear primera receta
            </Button>
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16 text-muted-foreground">
            <Search className="w-10 h-10 mx-auto mb-3 opacity-30" />
            <p>No hay recetas que coincidan</p>
          </div>
        ) : (
          <div className="space-y-2">
            {paginatedRecipes.map((recipe) => (
              <RecipeRow
                key={recipe._id}
                recipe={recipe}
                items={items}
                onEdit={(r) => setEditingRecipe(r)}
                onDelete={(r) => setDeletingRecipe(r)}
              />
            ))}

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
                    Página {page} de {totalPages} ({filtered.length} total)
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
          </div>
        )}
      </div>

      {showForm && (
        <RecipeForm
          initial={null}
          branches={branches}
          items={items}
          stockItems={stockItems}
          defaultBranchId={defaultBranchId}
          onSave={(data) => createMutation.mutate(data)}
          onClose={() => setShowForm(false)}
          loading={createMutation.isPending}
        />
      )}

      {editingRecipe && (
        <RecipeForm
          initial={editingRecipe}
          branches={branches}
          items={items}
          stockItems={stockItems}
          defaultBranchId={editingRecipe.branchId}
          onSave={(data) => updateMutation.mutate({ id: editingRecipe._id, data })}
          onClose={() => setEditingRecipe(null)}
          loading={updateMutation.isPending}
        />
      )}

      {deletingRecipe && (
        <DeleteConfirm
          name={deletingRecipe.name}
          onConfirm={() => deleteMutation.mutate(deletingRecipe._id)}
          onClose={() => setDeletingRecipe(null)}
          loading={deleteMutation.isPending}
        />
      )}
    </div>
  )
}
