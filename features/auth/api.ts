import api from "@/lib/api";
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/lib/auth-store'
import { useToast } from '@/components/ui/toast/ToastProvider'

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
    // Intentar obtener el usuario actual (requiere cookie de sesión válida)
    const user = await api.get<any>("/users/me");
    if (user?._id) {
      return {
        id: "session",
        user: {
          id: user._id,
          emailAddress: user.emailAddress,
          ...user
        }
      };
    }
    return null;
  } catch (error) {
    // Si falla (401, etc), no hay sesión válida
    return null;
  }
}

export function useSession() {
  const query = useQuery<Session>({
    queryKey: ["session"],
    queryFn: fetchSessionRequest,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
    refetchOnWindowFocus: false,
    // En recarga no existe cache de React Query; revalidamos la cookie en el backend.
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
      
      // El AuthGuard detectará automáticamente el cambio y redirigirá a "/"
    },
    onError(err: Error) {
      const message = err?.message || (typeof err === "string" ? err : "Error cerrando sesión");
      showToast("error", message);
    },
  });
}



