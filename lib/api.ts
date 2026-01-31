const BASE = process.env.NEXT_PUBLIC_API_URL ?? process.env.API_URL ?? "http://localhost:3001/";

export async function post<T = any>(path: string, body: any) {
  const url = path.startsWith("http") ? path : `${BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  const text = await res.text();
  try {
    const data = text ? JSON.parse(text) : null;
    if (!res.ok) throw data || new Error(res.statusText);
    return data as T;
  } catch (err) {
    throw err;
  }
}

export async function get<T = any>(path: string) {
  const url = path.startsWith("http") ? path : `${BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!res.ok) throw data;
  return data as T;
}

export default { post, get };
