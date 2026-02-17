import { useCallback } from "react";
import { useAuth } from "./auth-store";
import { get, post, put, patch, del } from "./api";

export function useAPI() {
  const { logout } = useAuth();

  const handleError = useCallback(
    async (error: Error) => {
      if (error.message.includes("401")) {
        await logout();
        throw new Error("Session expired, please login again");
      }
      throw error;
    },
    [logout]
  );

  return {
    get: async <T,>(path: string) => {
      try {
        return await get<T>(path);
      } catch (error) {
        return handleError(error as Error);
      }
    },
    post: async <T,>(path: string, body: any) => {
      try {
        return await post<T>(path, body);
      } catch (error) {
        return handleError(error as Error);
      }
    },
    put: async <T,>(path: string, body: any) => {
      try {
        return await put<T>(path, body);
      } catch (error) {
        return handleError(error as Error);
      }
    },
    patch: async <T,>(path: string, body: any) => {
      try {
        return await patch<T>(path, body);
      } catch (error) {
        return handleError(error as Error);
      }
    },
    delete: async <T,>(path: string) => {
      try {
        return await del<T>(path);
      } catch (error) {
        return handleError(error as Error);
      }
    },
  };
}
