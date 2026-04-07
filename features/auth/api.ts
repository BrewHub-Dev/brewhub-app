import api, { BASE } from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-store'
import { useToast } from '@/components/ui/toast/ToastProvider'
import { isTokenExpired } from '@/lib/auth-service'
import { useRouter } from 'next/navigation'

type LoginPayload = { emailAddress: string; password: string };

type LoginResponse = {
  token: string;
  accessToken?: string;
  user: {
    id: string;
    emailAddress: string;
  };
};

export async function loginRequest(payload: LoginPayload) {
  try {
    const data = await api.post<LoginResponse>("/login", payload);
    return data;
  } catch (err) {
    if (err instanceof Error && err.message === "User already has an active session") {
      return { token: "", user: { id: "", emailAddress: "" } } as LoginResponse;
    }
    throw err;
  }
}

export function useLogin() {
  const { setAuth } = useAuth();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: ({ emailAddress, password }: { emailAddress: string; password: string }) =>
      loginRequest({ emailAddress, password }),
    onSuccess(data) {
      const token = data?.token ?? data?.accessToken;
      const user = data?.user ?? data;
      
      if (!token && (!user?.id)) {
        showToast("info", "Ya tienes una sesión activa");
        return;
      }
      
      setAuth(token, user);
      queryClient.setQueryData(['session'], { id: token, user });
      showToast("success", "Inicio de sesión exitoso");
      router.push('/dashboard');

    },
    onError(err: Error) {
      const message = err?.message || (typeof err === "string" ? err : "Error en login");
      showToast("error", message);
    },
  });
}

export type Session = {
  id: string;
  user: {
    id: string;
    emailAddress: string;
    [key: string]: any;
  };
  [key: string]: any;
} | null;

async function fetchSessionRequest(): Promise<Session> {
  try {
    if (typeof window === "undefined") return null;

    const token = localStorage.getItem("bh_token");
    if (!token || isTokenExpired(token)) return null;

    const rawUser = localStorage.getItem("bh_user");
    const storedUser = rawUser ? JSON.parse(rawUser) : null;
    const tenantId = storedUser?.ShopId ?? storedUser?.tenantId ?? null;

    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (tenantId) headers["X-Tenant-Id"] = tenantId;

    const url = `${BASE.replace(/\/+$/, "")}/users/me`;
    const res = await fetch(url, { credentials: "include", headers });

    if (!res.ok) return null;

    const user = await res.json();
    if (user?._id) {
      return {
        id: "session",
        user: { id: user._id, emailAddress: user.emailAddress, ...user },
      };
    }
    return null;
  } catch {
    return null;
  }
}

export function useSession() {
  const query = useQuery<Session>({
    queryKey: ["session"],
    queryFn: fetchSessionRequest,
    retry: false,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true,
  });

  const isAuthenticated = !!query.data?.user;

  return {
    ...query,
    isAuthenticated,
  };
}


async function logoutRequest(): Promise<void> {
  await api.del("/sessions");
}

export function useLogout() {
  const queryClient = useQueryClient();
  const { setAuth, logout } = useAuth();
  const { showToast } = useToast();

  return useMutation({
    mutationFn: logoutRequest,
    onSuccess() {
      setAuth(null, null);
      logout();
      queryClient.setQueryData(["session"], null);
      showToast("success", "Sesión cerrada correctamente");
    },
    onError(err: Error) {
      const message = err?.message || (typeof err === "string" ? err : "Error cerrando sesión");
      showToast("error", message);
    },
  });
}



