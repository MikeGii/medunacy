// src/hooks/useCleanup.ts
import { useEffect, useRef, useCallback } from "react";

export function useCleanup() {
  const cleanupFns = useRef<(() => void)[]>([]);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      cleanupFns.current.forEach(fn => fn());
      cleanupFns.current = [];
    };
  }, []);

  const addCleanup = useCallback((fn: () => void) => {
    cleanupFns.current.push(fn);
  }, []);

  const isMounted = useCallback(() => isMountedRef.current, []);

  return { addCleanup, isMounted };
}