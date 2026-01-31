import api from "@/lib/api";

type LoginPayload = { emailAddress: string; password: string };

export async function loginRequest(payload: LoginPayload) {
  // backend expects { emailAddress, password }
  const data = await api.post<any>("/login", payload);
  return data;
}
