// src/hooks/useOptimizedQuery.ts - FIXED VERSION WITH MEMORY LEAK PREVENTION
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
  const isMountedRef = useRef(true);

  const cacheKey = Array.isArray(queryKey) ? queryKey.join(":") : queryKey;
  const enabled = options?.enabled ?? true;

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(
    async (forceRefresh = false) => {
      if (!enabled || !isMountedRef.current) {
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

        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          setData(result);
          options?.onSuccess?.(result);
        }
      } catch (err) {
        // Check if component is still mounted before updating state
        if (isMountedRef.current) {
          const error = err instanceof Error ? err : new Error(String(err));
          setError(error);
          options?.onError?.(error);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    },
    [cacheKey, queryFn, enabled, options]
  );

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval with proper cleanup
  useEffect(() => {
    if (options?.refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        // Only fetch if component is still mounted
        if (isMountedRef.current) {
          fetchData(true);
        }
      }, options.refetchInterval);

      // CLEANUP FUNCTION - MEMORY LEAK FIX
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    // CLEANUP even when refetchInterval is not set or enabled is false
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [options?.refetchInterval, enabled, fetchData]);

  // Additional cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear any pending intervals
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(true),
    invalidate: () => dataFetcher.clearCache(cacheKey),
  };
}
