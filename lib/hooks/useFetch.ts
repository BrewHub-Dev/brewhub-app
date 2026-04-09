import { useRouter } from "next/navigation";
import { useEffect, useCallback, useState } from "react";

interface UseFetchOptions<T> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
  redirectOnError?: string;
}

interface UseFetchReturn<T> {
  isLoading: boolean;
  error: Error | null;
  data: T | null;
  refetch: () => Promise<void>;
}

export function useFetch<T>(
  fetchFn: () => Promise<T>,
  options?: UseFetchOptions<T>
): UseFetchReturn<T> {
  const router = useRouter();
  const [state, setState] = useState<{
    isLoading: boolean;
    error: Error | null;
    data: T | null;
  }>({
    isLoading: true,
    error: null,
    data: null,
  });

  const refetch = useCallback(async () => {
    setState((prev) => ({ ...prev, isLoading: true, error: null }));
    try {
      const result = await fetchFn();
      setState({ isLoading: false, error: null, data: result });
      options?.onSuccess?.(result);
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setState({ isLoading: false, error, data: null });
      options?.onError?.(error);
      if (options?.redirectOnError) {
        router.push(options.redirectOnError);
      }
    }
  }, [fetchFn, options, router]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { ...state, refetch };
}

export function useMutation<TData, TVariables>(
  mutationFn: (variables: TVariables) => Promise<TData>
) {
  const [state, setState] = useState<{
    isLoading: boolean;
    error: Error | null;
    data: TData | null;
  }>({
    isLoading: false,
    error: null,
    data: null,
  });

  const mutate = useCallback(
    async (variables: TVariables) => {
      setState((prev) => ({ ...prev, isLoading: true, error: null }));
      try {
        const result = await mutationFn(variables);
        setState({ isLoading: false, error: null, data: result });
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setState({ isLoading: false, error, data: null });
        throw error;
      }
    },
    [mutationFn]
  );

  return { ...state, mutate };
}