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

export async function post<T = any>(path: string, body: any) {
  const url = buildUrl(path);

  let res: Response;
  try {
    res = await fetch(url, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
      headers: { "Content-Type": "application/json" },
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
