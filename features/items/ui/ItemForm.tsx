"use client"
import { useQuery } from "@tanstack/react-query"
import { ItemFormData } from "../types"
import { getCategories } from "../api"

interface ItemFormProps {
  initialData?: ItemFormData
  onSubmit: (data: ItemFormData) => void
  onCancel: () => void
}

export default function ItemForm({ initialData, onSubmit, onCancel }: Readonly<ItemFormProps>) {
  const { data: categories = [], isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
    staleTime: 5 * 60 * 1000,
  })

  const handleSubmit = (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)

    const data: ItemFormData = {
      name: formData.get("name") as string,
      code: formData.get("code") as string,
      price: Number.parseFloat(formData.get("price") as string),
      categoryId: formData.get("categoryId") as string,
      stock: Number.parseInt(formData.get("stock") as string) || 0,
      description: formData.get("description") as string,
    }

    onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">
            Nombre del Producto *
          </label>
          <input
            type="text"
            name="name"
            defaultValue={initialData?.name}
            placeholder="Ej: Café Americano"
            required
            className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">
            Código/SKU *
          </label>
          <input
            type="text"
            name="code"
            defaultValue={initialData?.code}
            placeholder="Ej: AMERICANO-12"
            required
            className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">
            Categoría *
          </label>
          {isLoadingCategories ? (
            <div className="w-full glass rounded-xl px-4 py-3 text-muted-foreground">
              Cargando categorías...
            </div>
          ) : (
            <select
              name="categoryId"
              defaultValue={initialData?.categoryId}
              required
              className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Seleccionar categoría</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          )}
        </div>
        <div>
          <label className="text-sm text-muted-foreground block mb-2 font-medium">
            Precio *
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
            <input
              type="number"
              name="price"
              defaultValue={initialData?.price}
              step="0.01"
              min="0"
              placeholder="0.00"
              required
              className="w-full glass rounded-xl pl-8 pr-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2 font-medium">
          Stock Inicial
        </label>
        <input
          type="number"
          name="stock"
          defaultValue={initialData?.stock || 0}
          min="0"
          placeholder="0"
          className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      <div>
        <label className="text-sm text-muted-foreground block mb-2 font-medium">
          Descripción
        </label>
        <textarea
          name="description"
          defaultValue={initialData?.description}
          rows={3}
          placeholder="Ej: 12oz, Café negro filtrado..."
          className="w-full glass rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
        />
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-6 py-3 glass rounded-xl text-foreground hover:shadow-lg transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="flex-1 px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-2xl hover:scale-105 transition-all font-medium shadow-lg shadow-primary/30"
        >
          {initialData ? "Actualizar" : "Crear"} Item
        </button>
      </div>
    </form>
  )
}
