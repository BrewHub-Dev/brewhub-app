export type UserRole = "ADMIN" | "SHOP_ADMIN" | "BRANCH_ADMIN" | "CLIENT";

export interface User {
  _id: string;
  name: string;
  lastName: string;
  username: string;
  emailAddress: string;
  phone: string;
  role: UserRole;
  ShopId?: string;
  BranchId?: string;
  active: boolean;
  shop?: {
    _id: string;
    name?: string;
  };
  branch?: {
    _id: string;
    name?: string;
  };
  address?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthTokenPayload {
  sub: string; // userId
  role: UserRole;
  shopId?: string;
  branchId?: string;
  defaultBranchId?: string;
  iat: number;
  exp: number;
}

export interface LoginRequest {
  emailAddress: string;
  password: string;
}

export interface LoginResponse {
  ok: boolean;
  user: User;
  token: string;
}

export interface SessionData {
  _id: string;
  user: string;
  token: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
}
