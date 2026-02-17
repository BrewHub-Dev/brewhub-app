import api from "@/lib/api";

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

export async function getUsers(): Promise<User[]> {
  const response = await api.get("/users");
  return Array.isArray(response) ? response : [];
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
