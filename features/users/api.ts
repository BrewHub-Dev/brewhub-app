import api from "@/lib/api";
import type { PaginationMeta } from "@/components/ui/Pagination"

export interface User {
  _id: string;
  emailAddress: string;
  name: string;
  lastName: string;
  username?: string;
  phone?: string;
  role: "ADMIN" | "SHOP_ADMIN" | "BRANCH_ADMIN" | "CLIENT";
  ShopId?: string;
  BranchId?: string;
  active?: boolean;
  shop?: {
    _id: string;
    name?: string;
  };
  branch?: {
    _id: string;
    name?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface PaginatedUsers {
  data: User[];
  pagination: PaginationMeta;
}

const EMPTY_PAGINATION: PaginatedUsers = {
  data: [],
  pagination: { total: 0, page: 1, limit: 20, pages: 0, hasNext: false, hasPrev: false },
}

export async function getUsers(params?: { page?: number; limit?: number }): Promise<PaginatedUsers> {
  try {
    let path = "/users"
    const query: string[] = []
    if (params?.page) query.push(`page=${params.page}`)
    if (params?.limit) query.push(`limit=${params.limit}`)
    if (query.length > 0) path += `?${query.join("&")}`

    const response = await api.get(path);
    if (!response || !response.data) return EMPTY_PAGINATION
    return response as PaginatedUsers
  } catch (err) {
    console.error("Error al obtener usuarios:", err)
    return EMPTY_PAGINATION
  }
}

export async function getUserById(id: string): Promise<User> {
  return api.get(`/users/${id}`);
}

export async function getCurrentUser(): Promise<User> {
  return api.get("/users/me");
}

export async function updateUser(id: string, user: Partial<User>): Promise<User> {
  return api.patch(`/users/${id}`, user);
}

export async function updateCurrentUserPassword(newPassword: string): Promise<{ ok: boolean; message: string }> {
  return api.patch("/users/me/password", { newPassword });
}

export async function deleteUser(id: string): Promise<void> {
  await api.del(`/users/${id}`);
}
