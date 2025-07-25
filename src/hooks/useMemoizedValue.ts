// src/hooks/useMemoizedValue.ts
import { useMemo, DependencyList, useRef } from "react";

export function useMemoizedValue<T>(
  factory: () => T,
  deps: DependencyList,
  equalityFn?: (prev: T, next: T) => boolean
): T {
  const value = useMemo(factory, deps);
  
  const prevValueRef = useRef<T>(value);
  
  if (equalityFn && equalityFn(prevValueRef.current, value)) {
    return prevValueRef.current;
  }
  
  prevValueRef.current = value;
  return value;
}