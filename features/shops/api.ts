import api from "@/lib/api";

export interface Shop {
  _id: string;
  name: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  logo?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export async function getShops(): Promise<Shop[]> {
  const response = await api.get("/shops");
  return Array.isArray(response) ? response : [];
}

export async function getShopById(id: string): Promise<Shop> {
  return api.get(`/shops/${id}`);
}

export async function createShop(shop: Partial<Shop>): Promise<Shop> {
  return api.post("/shops", shop);
}

export async function updateShop(id: string, shop: Partial<Shop>): Promise<Shop> {
  return api.patch(`/shops/${id}`, shop);
}

export async function deleteShop(id: string): Promise<void> {
  await api.del(`/shops/${id}`);
}
