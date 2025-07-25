// src/hooks/useOptimizedQuery.ts
import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { dataFetcher } from "@/utils/dataFetcher";

interface UseOptimizedQueryOptions {
  enabled?: boolean;
  cacheDuration?: number;
  refetchInterval?: number;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export function useOptimizedQuery<T = any>(
  queryKey: string | string[],
  queryFn: () => Promise<T>,
  options?: UseOptimizedQueryOptions
) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const cacheKey = Array.isArray(queryKey) ? queryKey.join(":") : queryKey;
  const enabled = options?.enabled ?? true;

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const result = await dataFetcher.get(cacheKey, queryFn, {
          cacheDuration: options?.cacheDuration,
          forceRefresh,
        });

        setData(result);
        options?.onSuccess?.(result);
      } catch (err) {
        const error = err instanceof Error ? err : new Error(String(err));
        setError(error);
        options?.onError?.(error);
      } finally {
        setLoading(false);
      }
    },
    [cacheKey, queryFn, enabled, options]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval
  useEffect(() => {
    if (options?.refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        fetchData(true);
      }, options.refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      };
    }
  }, [options?.refetchInterval, enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate: () => dataFetcher.clearCache(cacheKey),
  };
}