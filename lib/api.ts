const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/";

function buildUrl(path: string) {
  return path.startsWith("http")
    ? path
    : `${BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function extractErrorMessage(data: unknown, fallback: string) {
  if (data && typeof data === "object") {
    const anyData = data as { error?: string; message?: string };
    return anyData.error || anyData.message || fallback;
  }
  if (typeof data === "string") return data || fallback;
  return fallback;
}

/**
 * Obtiene el tenantId activo del usuario guardado en localStorage.
 * Esto es requerido por el backend para todos los endpoints multi-tenant.
 */
function getTenantId(): string | null {
  try {
    if (typeof window === "undefined") return null;
    const rawUser = localStorage.getItem("bh_user");
    if (!rawUser) return null;
    const user = JSON.parse(rawUser);
    // ShopId es el tenantId principal del usuario
    return user?.ShopId ?? user?.tenantId ?? null;
  } catch {
    return null;
  }
}

function buildHeaders(extra: Record<string, string> = {}): Record<string, string> {
  const headers: Record<string, string> = { ...extra };
  const tenantId = getTenantId();
  if (tenantId) {
    headers["X-Tenant-Id"] = tenantId;
  }
  return headers;
}

export async function post<T = any>(path: string, body: any) {
  const url = buildUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(`No se puede conectar al servidor (${BASE}). Verifica que el backend esté corriendo.`);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = extractErrorMessage(data, res.statusText || "Request failed");
    throw new Error(message);
  }

  return data as T;
}

export async function get<T = any>(path: string) {
  const url = buildUrl(path);
  let res: Response;
  try {
    res = await fetch(url, {
      credentials: "include",
      headers: buildHeaders(),
    });
  } catch (error) {
    throw new Error(`No se puede conectar al servidor (${BASE}). Verifica que el backend esté corriendo.`);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = extractErrorMessage(data, res.statusText || "Request failed");
    throw new Error(message);
  }

  return data as T;
}

export async function put<T = any>(path: string, body: any) {
  const url = buildUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PUT",
      credentials: "include",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(`No se puede conectar al servidor (${BASE}). Verifica que el backend esté corriendo.`);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = extractErrorMessage(data, res.statusText || "Request failed");
    throw new Error(message);
  }

  return data as T;
}

export async function patch<T = any>(path: string, body: any) {
  const url = buildUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "PATCH",
      credentials: "include",
      headers: buildHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify(body),
    });
  } catch (error) {
    throw new Error(`No se puede conectar al servidor (${BASE}). Verifica que el backend esté corriendo.`);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = extractErrorMessage(data, res.statusText || "Request failed");
    throw new Error(message);
  }

  return data as T;
}

export async function del<T = any>(path: string) {
  const url = buildUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "DELETE",
      credentials: "include",
      headers: buildHeaders(),
    });
  } catch (error) {
    throw new Error(`No se puede conectar al servidor (${BASE}). Verifica que el backend esté corriendo.`);
  }

  const text = await res.text();
  let data: unknown = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text;
  }

  if (!res.ok) {
    const message = extractErrorMessage(data, res.statusText || "Request failed");
    throw new Error(message);
  }

  return data as T;
}

export default { post, get, put, patch, del };
