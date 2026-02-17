"use client"
import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { Plus, Search } from "lucide-react"
import ItemsStats from "./ItemsStats"
import ItemsTable from "./ItemsTable"
import ItemForm from "./ItemForm"
import { getItems, createItem, updateItem, deleteItem } from "../api"
import type { Item, ItemFormData } from "../types"

export default function ItemsView() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isCreating, setIsCreating] = useState(false)
  const [editingItem, setEditingItem] = useState<Item | null>(null)
  const queryClient = useQueryClient()

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["items"],
    queryFn: getItems,
  })

  const createMutation = useMutation({
    mutationFn: createItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      setIsCreating(false)
    },
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ItemFormData> }) =>
      updateItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
      setEditingItem(null)
    },
  })

  const deleteMutation = useMutation({
    mutationFn: deleteItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["items"] })
    },
  })

  const filteredItems = (items || []).filter(item =>
    item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.code?.includes(searchQuery) ||
    item.sku?.includes(searchQuery) ||
    item.barcode?.includes(searchQuery)
  )

  const stats = {
    totalItems: items?.length || 0,
    averagePrice: items?.length > 0 ? items.reduce((acc, item) => acc + item.price, 0) / items.length : 0,
    totalCategories: new Set((items || []).map(item => item.category?._id || item.categoryId).filter(Boolean)).size,
  }

  const handleCreate = async (data: ItemFormData) => {
    createMutation.mutate(data)
  }

  const handleUpdate = async (data: ItemFormData) => {
    if (!editingItem) return
    const itemId = editingItem.id || editingItem._id
    updateMutation.mutate({ id: itemId, data })
  }

  const handleDelete = async (id: string) => {
    if (confirm("¿Estás seguro de eliminar este item?")) {
      deleteMutation.mutate(id)
    }
  }

  return (
    <div className="p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-foreground">Gestión de Items</h1>
            <p className="text-muted-foreground">Administra los productos de tu sucursal</p>
          </div>
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-xl hover:shadow-2xl hover:scale-105 transition-all flex items-center gap-2 font-medium shadow-lg shadow-primary/30"
          >
            <Plus className="w-5 h-5" />
            Crear Item
          </button>
        </div>

        <ItemsStats {...stats} />

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <input
              type="text"
              placeholder="Buscar por nombre o código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass rounded-xl pl-12 pr-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>

        <ItemsTable
          items={filteredItems}
          onEdit={setEditingItem}
          onDelete={handleDelete}
        />

        {(isCreating || editingItem) && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
            <div className="glass glass-strong rounded-2xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
              <h2 className="text-2xl font-bold mb-6 text-foreground">
                {editingItem ? "Editar Item" : "Crear Nuevo Item"}
              </h2>

              <ItemForm
                initialData={editingItem ? {
                  name: editingItem.name,
                  code: editingItem.code || editingItem.sku || editingItem.barcode || '',
                  price: editingItem.price,
                  categoryId: typeof editingItem.category === 'object' ? editingItem.category._id || '' : editingItem.categoryId || '',
                  stock: editingItem.stock || 0,
                  description: editingItem.description,
                } : undefined}
                onSubmit={editingItem ? handleUpdate : handleCreate}
                onCancel={() => {
                  setIsCreating(false)
                  setEditingItem(null)
                }}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
