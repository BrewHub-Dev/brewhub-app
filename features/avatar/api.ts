import api from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export type Shop = {
  _id: string;
  name?: string;
  image?: string;
  [key: string]: any;
};

export type UserData = {
  _id: string;
  name?: string;
  lastName?: string;
  username?: string;
  emailAddress?: string;
  ShopId?: string;
  BranchId?: string;
  branch?: {
    _id: string;
    name?: string;
    [key: string]: any;
  };
  shop?: Shop;
  [key: string]: any;
};

async function fetchShopById(id: string): Promise<Shop> {
  try {
    const data = await api.get<Shop | { error?: string; message?: string }>(`/shops/${id}`);
    return data as Shop;
  } catch (error: any) {
    if (error?.response?.status === 403) {
      return { _id: id, name: "Sin acceso" } as Shop;
    }
    throw error;
  }
}

export function useShop(shopId?: string | null, hasPermission: boolean = true) {
  return useQuery<Shop | undefined>({
    queryKey: ["shop", shopId],
    queryFn: () => fetchShopById(shopId as string),
    enabled: !!shopId && hasPermission,
    retry: false,
  });
}

async function fetchUserData(userId: string): Promise<UserData> {
  try {
    const data = await api.get<UserData | { error?: string; message?: string }>(`/users/${userId}`);
    return data as UserData;
  } catch (error: any) {
    if (error?.response?.status === 403) {
      return { _id: userId, name: "Sin acceso" } as UserData;
    }
    throw error;
  }
}

export function useUserData(userId?: string | null, hasPermission: boolean = true) {
  return useQuery<UserData | undefined>({
    queryKey: ["userData", userId],
    queryFn: () => fetchUserData(userId as string),
    enabled: !!userId && hasPermission,
    retry: false,
  });
}
