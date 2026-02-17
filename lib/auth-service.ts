import { LoginRequest, LoginResponse, User } from "./types";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3001";

export async function login(credentials: LoginRequest): Promise<LoginResponse> {
  const res = await fetch(`${BASE_URL}/login`, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(credentials),
  });

  if (!res.ok) {
    const error = await res.json().catch(() => ({}));
    throw new Error(error.error || "Login failed");
  }

  const data: LoginResponse = await res.json();

  localStorage.setItem("bh_user", JSON.stringify(data.user));

  return data;
}

export async function logout(): Promise<void> {
  try {
    await fetch(`${BASE_URL}/sessions`, {
      method: "DELETE",
      credentials: "include",
    });
  } catch (err) {
    console.error("Logout request failed:", err);
  } finally {
    localStorage.removeItem("bh_user");
    localStorage.removeItem("bh_token");
    localStorage.removeItem("selectedBranchId");
  }
}

export async function validateSession(): Promise<User | null> {
  try {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: "GET",
      credentials: "include",
    });

    if (!res.ok) {
      return null;
    }

    // La sesión es válida, retorna el usuario del localStorage si está disponible
    const raw = localStorage.getItem("bh_user");
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    return null;
  }
}

export function decodeToken(token: string): any {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload));
    return decoded;
  } catch {
    return null;
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const decoded = decodeToken(token);
    if (!decoded?.exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now;
  } catch {
    return true;
  }
}
