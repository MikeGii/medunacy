import { useCallback, useRef, useState } from "react";

interface LoadingState {
  [key: string]: boolean;
}

export function useLoadingState(initialKeys: string[] = []) {
  const [loadingStates, setLoadingStates] = useState<LoadingState>(() => {
    const initial: LoadingState = {};
    initialKeys.forEach((key) => {
      initial[key] = false;
    });
    return initial;
  });

  const abortControllersRef = useRef<Map<string, AbortController>>(new Map());

  const startLoading = useCallback((key: string) => {
    // Cancel any existing operation for this key
    const existingController = abortControllersRef.current.get(key);
    if (existingController) {
      existingController.abort();
    }

    // Create new abort controller
    const newController = new AbortController();
    abortControllersRef.current.set(key, newController);

    setLoadingStates((prev) => ({ ...prev, [key]: true }));
    return newController.signal;
  }, []);

  const stopLoading = useCallback((key: string) => {
    setLoadingStates((prev) => ({ ...prev, [key]: false }));
    abortControllersRef.current.delete(key);
  }, []);

  const isLoading = useCallback(
    (key?: string) => {
      if (key) {
        return loadingStates[key] || false;
      }
      // Check if any operation is loading
      return Object.values(loadingStates).some((loading) => loading);
    },
    [loadingStates]
  );

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    // Abort all ongoing operations
    abortControllersRef.current.forEach((controller) => {
      controller.abort();
    });
    abortControllersRef.current.clear();
  }, []);

  return {
    startLoading,
    stopLoading,
    isLoading,
    cleanup,
    loadingStates,
  };
}