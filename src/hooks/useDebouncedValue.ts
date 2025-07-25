// src/hooks/useDebouncedValue.ts

"use client";

import { useState, useEffect } from "react";

export function useDebouncedValue<T>(value: T, delay: number = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Usage example in search:
// const debouncedSearchQuery = useDebouncedValue(searchQuery, 300);
