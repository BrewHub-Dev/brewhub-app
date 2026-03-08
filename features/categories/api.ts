import api from "@/lib/api"

export interface Category {
    _id: string
    id?: string
    name: string
    description?: string
    active: boolean
    order?: number
    ShopId: string
    createdAt?: string
}

export interface CategoryFormData {
    name: string
    description?: string
    order?: number
    active: boolean
}

export async function getCategories(): Promise<Category[]> {
    try {
        const response = await api.get("/categories")
        if (!response) return []
        const data = Array.isArray(response) ? response : []
        return data.map((c: any) => ({ ...c, id: c._id }))
    } catch (err) {
        console.error("Error al obtener categorías:", err)
        return []
    }
}

export async function createCategory(data: CategoryFormData): Promise<Category> {
    const response = await api.post("/categories", {
        name: data.name,
        description: data.description,
        order: data.order ?? 0,
        active: data.active,
    })
    return { ...response, id: response._id }
}

export async function updateCategory(id: string, data: Partial<CategoryFormData>): Promise<Category> {
    const response = await api.put(`/categories/${id}`, data)
    return { ...response, id: response._id }
}

export async function deleteCategory(id: string): Promise<void> {
    await api.del(`/categories/${id}`)
}
