// src/hooks/useOptimizedQuery.ts - FIXED VERSION WITH MEMORY LEAK PREVENTION
import { useState, useEffect, useCallback, useRef } from "react";

interface UseOptimizedQueryOptions {
  enabled?: boolean;
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

  const enabled = options?.enabled ?? true;

  // Track mount status
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  const fetchData = useCallback(async () => {
    if (!enabled || !isMountedRef.current) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Direct query call without caching
      const result = await queryFn();

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
  }, [queryFn, enabled, options]);

  // Initial fetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Refetch interval with proper cleanup
  useEffect(() => {
    if (options?.refetchInterval && enabled) {
      intervalRef.current = setInterval(() => {
        if (isMountedRef.current) {
          fetchData();
        }
      }, options.refetchInterval);

      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      };
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [options?.refetchInterval, enabled, fetchData]);

  return {
    data,
    loading,
    error,
    refetch: () => fetchData(),
  };
}
