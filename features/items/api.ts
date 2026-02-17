import { Item, ItemFormData } from "./types"
import api from "@/lib/api";

export async function getItems(): Promise<Item[]> {
  try {
    const response = await api.get("/items");
    console.log("Items obtenidos desde backend:", response);

    if (!response) {
      console.warn("No hay datos en la respuesta");
      return [];
    }

    const data = Array.isArray(response) ? response : [];

    if (data.length === 0) {
      console.log("No se encontraron items");
      return [];
    }

    // Normalizar datos del backend
    const items = data.map((item: any) => ({
      ...item,
      id: item._id,
      code: item.sku || item.barcode,
      image: item.images?.[0],
      stock: item.stock || 0,
    }));

    console.log(`${items.length} items normalizados:`, items);
    return items;
  } catch (err) {
    console.error("Error al obtener items:", err);
    return [];
  }
}



export async function createItem(data: ItemFormData): Promise<Item> {
  try {
    console.log("Creando item:", data)

    const itemData = {
      name: data.name,
      description: data.description,
      sku: data.code,
      barcode: data.code,
      price: data.price,
      stock: data.stock || 0,
      categoryId: data.categoryId,
      active: true,
      taxIncluded: false,
      images: [],
      modifiers: [],
    }

    const response = await api.post("/items", itemData)
    console.log("Item creado:", response)

    // Normalizar respuesta
    return {
      ...response,
      id: response._id,
      code: response.sku || response.barcode,
      image: response.images?.[0],
      stock: response.stock || 0,
    }
  } catch (err) {
    console.error("Error al crear item:", err)
    throw err
  }
}

export async function updateItem(id: string, data: Partial<ItemFormData>): Promise<Item> {
  try {
    console.log("Actualizando item:", id, data)

    const itemData = {
      name: data.name,
      description: data.description,
      sku: data.code,
      barcode: data.code,
      price: data.price,
      stock: data.stock,
      categoryId: data.categoryId,
    }

    const response = await api.patch(`/items/${id}`, itemData)
    console.log("Item actualizado:", response)

    return {
      ...response,
      id: response._id,
      code: response.sku || response.barcode,
      image: response.images?.[0],
      stock: response.stock || 0,
    }
  } catch (err) {
    console.error("Error al actualizar item:", err)
    throw err
  }
}

export async function deleteItem(id: string): Promise<void> {
  try {
    console.log("Eliminando item:", id)
    await api.del(`/items/${id}`)
    console.log("Item eliminado exitosamente")
  } catch (err) {
    console.error("Error al eliminar item:", err)
    throw err
  }
}

// Categorías
export interface Category {
  _id: string
  id?: string
  name: string
  description?: string
  isActive: boolean
  ShopId: string
}

export async function getCategories(): Promise<Category[]> {
  try {
    // Intentar obtener categorías del endpoint si existe
    const response = await api.get("/categories")
    console.log("Categorías obtenidas:", response)

    if (!response) return []

    const data = Array.isArray(response) ? response : []

    return data.map((cat: any) => ({
      ...cat,
      id: cat._id,
    }))
  } catch (err) {
    console.error("Error al obtener categorías:", err)

    // Fallback: extraer categorías únicas de los items
    try {
      const items = await api.get("/items")
      if (Array.isArray(items)) {
        const uniqueCategories = new Map<string, Category>()

        items.forEach((item: any) => {
          if (item.category && typeof item.category === 'object') {
            uniqueCategories.set(item.category._id, {
              _id: item.category._id,
              id: item.category._id,
              name: item.category.name,
              description: item.category.description,
              isActive: item.category.isActive,
              ShopId: item.category.ShopId,
            })
          }
        })

        return Array.from(uniqueCategories.values())
      }
    } catch (fallbackErr) {
      console.error("Error en fallback de categorías:", fallbackErr)
    }

    return []
  }
}
