"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { getCategories, createCategory, deleteCategory } from "../api"
import type { Category, CategoryFormData } from "../api"
import {
    Plus,
    Trash2,
    Loader2,
    Tag,
    ToggleLeft,
    ToggleRight,
    X,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

function CategoryForm({
    onSubmit,
    onCancel,
    isLoading,
}: {
    onSubmit: (data: CategoryFormData) => void
    onCancel: () => void
    isLoading: boolean
}) {
    const [name, setName] = useState("")
    const [description, setDescription] = useState("")
    const [order, setOrder] = useState(0)
    const [active, setActive] = useState(true)

    function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        if (!name.trim()) return
        onSubmit({ name: name.trim(), description: description.trim() || undefined, order, active })
    }

    return (
        <form onSubmit={handleSubmit} className="p-5 rounded-xl border border-border/50 bg-muted/10 glass space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="font-semibold text-foreground">Nueva Categoría</h3>
                <button type="button" onClick={onCancel} className="text-muted-foreground hover:text-foreground">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Nombre *</label>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Bebidas Calientes"
                        required
                        className="bg-muted/20 border"
                    />
                </div>
                <div>
                    <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Orden</label>
                    <Input
                        type="number"
                        value={order}
                        onChange={(e) => setOrder(Number(e.target.value))}
                        placeholder="0"
                        className="bg-muted/20 border"
                    />
                </div>
            </div>
            <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide mb-1 block">Descripción (opcional)</label>
                <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Café, té y bebidas calientes"
                    className="bg-muted/20 border"
                />
            </div>
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={() => setActive(!active)}
                    className="text-muted-foreground hover:text-foreground transition-colors"
                >
                    {active ? (
                        <ToggleRight className="w-6 h-6 text-primary" />
                    ) : (
                        <ToggleLeft className="w-6 h-6" />
                    )}
                </button>
                <span className="text-sm text-foreground">{active ? "Activa" : "Inactiva"}</span>
            </div>
            <div className="flex gap-2 pt-1">
                <Button type="submit" disabled={isLoading || !name.trim()} className="gap-2">
                    {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    Crear categoría
                </Button>
                <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            </div>
        </form>
    )
}

export default function CategoriesView() {
    const [showForm, setShowForm] = useState(false)
    const queryClient = useQueryClient()

    const { data: categories = [], isLoading } = useQuery({
        queryKey: ["categories"],
        queryFn: getCategories,
    })

    const createMutation = useMutation({
        mutationFn: createCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
            setShowForm(false)
        },
    })

    const deleteMutation = useMutation({
        mutationFn: deleteCategory,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["categories"] })
        },
    })

    return (
        <div className="p-8">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">Categorías</h1>
                        <p className="text-muted-foreground mt-1">Organiza tus productos en categorías</p>
                    </div>
                    <Button onClick={() => setShowForm(true)} className="gap-2" disabled={showForm}>
                        <Plus className="w-4 h-4" />
                        Nueva categoría
                    </Button>
                </div>

                {/* Form */}
                {showForm && (
                    <div className="mb-6">
                        <CategoryForm
                            onSubmit={(data) => createMutation.mutate(data)}
                            onCancel={() => setShowForm(false)}
                            isLoading={createMutation.isPending}
                        />
                        {createMutation.isError && (
                            <p className="text-sm text-destructive mt-2">
                                Error: {(createMutation.error as Error)?.message}
                            </p>
                        )}
                    </div>
                )}

                {/* Categories list */}
                {isLoading ? (
                    <div className="flex items-center justify-center h-40">
                        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                    </div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-20 text-muted-foreground">
                        <Tag className="w-12 h-12 mx-auto mb-3 opacity-30" />
                        <p className="text-lg font-medium">Sin categorías</p>
                        <p className="text-sm">Crea categorías para organizar tu menú</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories
                            .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
                            .map((cat) => (
                                <div
                                    key={cat._id}
                                    className="flex items-center gap-4 p-4 rounded-xl border border-border/50 bg-card/30 glass"
                                >
                                    <div className="w-10 h-10 rounded-lg bg-primary/20 border border-primary/30 flex items-center justify-center">
                                        <Tag className="w-5 h-5 text-primary" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-foreground">{cat.name}</p>
                                        {cat.description && (
                                            <p className="text-sm text-muted-foreground truncate">{cat.description}</p>
                                        )}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span
                                            className={`text-xs px-2 py-1 rounded-full border font-medium ${cat.active
                                                    ? "bg-green-500/20 text-green-500 border-green-500/30"
                                                    : "bg-muted text-muted-foreground border-border"
                                                }`}
                                        >
                                            {cat.active ? "Activa" : "Inactiva"}
                                        </span>
                                        {cat.order !== undefined && (
                                            <span className="text-xs text-muted-foreground w-8 text-center">
                                                #{cat.order}
                                            </span>
                                        )}
                                        <button
                                            onClick={() => {
                                                if (confirm(`¿Eliminar categoría "${cat.name}"?`)) {
                                                    deleteMutation.mutate(cat._id)
                                                }
                                            }}
                                            disabled={deleteMutation.isPending}
                                            className="p-2 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </div>
    )
}
