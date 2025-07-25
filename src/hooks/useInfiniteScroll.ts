import { useCallback, useEffect, useRef, useState } from "react";

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  hasMore: boolean;
  loading: boolean;
  onLoadMore: () => void | Promise<void>;
}

export function useInfiniteScroll({
  threshold = 0.1,
  rootMargin = "100px",
  hasMore,
  loading,
  onLoadMore,
}: UseInfiniteScrollOptions) {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);

  // Setup intersection observer
  useEffect(() => {
    if (!loadMoreRef.current) return;

    const options = {
      root: null,
      rootMargin,
      threshold,
    };

    observerRef.current = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting);
    }, options);

    observerRef.current.observe(loadMoreRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [threshold, rootMargin]);

  // Trigger load more when intersecting
  useEffect(() => {
    if (isIntersecting && hasMore && !loading) {
      onLoadMore();
    }
  }, [isIntersecting, hasMore, loading, onLoadMore]);

  const setTarget = useCallback((node: HTMLDivElement | null) => {
    if (loadMoreRef.current && observerRef.current) {
      observerRef.current.unobserve(loadMoreRef.current);
    }

    loadMoreRef.current = node;

    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }
  }, []);

  return {
    setTarget,
    isIntersecting,
  };
}