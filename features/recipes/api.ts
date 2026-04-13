import api from "@/lib/api"

export interface RecipeIngredient {
  stockItemId: string
  quantity: number
  unit: string
}

export interface Recipe {
  _id: string
  itemId: string
  branchId: string
  name: string
  ingredients: RecipeIngredient[]
  yield: number
  prepTime?: number
  instructions?: string
  isActive: boolean
  createdAt?: string
  updatedAt?: string
}

export interface RecipeInput {
  itemId: string
  branchId: string
  name: string
  ingredients: RecipeIngredient[]
  yield?: number
  prepTime?: number
  instructions?: string
  isActive?: boolean
}

export async function getRecipes(branchId?: string): Promise<Recipe[]> {
  try {
    const qs = branchId ? `?branchId=${branchId}` : ""
    const res = await api.get<Recipe[]>(`/recipes${qs}`)
    return Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export async function getRecipeById(id: string): Promise<Recipe | null> {
  try {
    return await api.get<Recipe>(`/recipes/${id}`)
  } catch {
    return null
  }
}

export async function getRecipeByItemId(itemId: string): Promise<Recipe | null> {
  try {
    return await api.get<Recipe>(`/recipes/by-item/${itemId}`)
  } catch {
    return null
  }
}

export async function createRecipe(data: RecipeInput): Promise<Recipe> {
  return api.post<Recipe>("/recipes", data)
}

export async function updateRecipe(id: string, data: Partial<RecipeInput>): Promise<Recipe> {
  return api.patch<Recipe>(`/recipes/${id}`, data)
}

export async function deleteRecipe(id: string): Promise<void> {
  await api.del(`/recipes/${id}`)
}

export interface LowStockRecipe {
  recipe: Recipe
  ingredients: { name: string; needed: number; available: number }[]
}

export async function getRecipesWithLowStock(branchId: string): Promise<LowStockRecipe[]> {
  try {
    const res = await api.get<LowStockRecipe[]>(`/recipes/low-stock?branchId=${branchId}`)
    return Array.isArray(res) ? res : []
  } catch {
    return []
  }
}

export interface InventoryCheckItem {
  itemId: string
  quantity: number
}

export interface InventoryCheckResult {
  available: boolean
  details: {
    itemId: string
    name: string
    status: "ok" | "low" | "out"
    ingredients: { name: string; needed: number; available: number }[]
  }[]
}

export async function checkInventory(
  items: InventoryCheckItem[],
  branchId: string
): Promise<InventoryCheckResult> {
  try {
    const qs = new URLSearchParams()
    qs.set("branchId", branchId)
    return await api.post<InventoryCheckResult>("/recipes/check", { items, branchId })
  } catch {
    return { available: true, details: [] }
  }
}