// src/utils/dataFetcher.ts
import { supabase } from "@/lib/supabase";

interface QueryBatch {
  id: string;
  query: () => Promise<any>;
  resolve: (value: any) => void;
  reject: (error: any) => void;
}

class DataFetcher {
  private cache = new Map<string, { data: any; timestamp: number }>();
  private pendingBatches = new Map<string, QueryBatch[]>();
  private batchTimeout: NodeJS.Timeout | null = null;
  private cacheDuration = 30000; // 30 seconds

  // Get data with caching
  async get<T>(
    key: string,
    fetcher: () => Promise<T>,
    options?: {
      cacheDuration?: number;
      forceRefresh?: boolean;
    }
  ): Promise<T> {
    const cached = this.cache.get(key);
    const now = Date.now();
    const duration = options?.cacheDuration ?? this.cacheDuration;

    if (
      !options?.forceRefresh &&
      cached &&
      now - cached.timestamp < duration
    ) {
      return cached.data as T;
    }

    const data = await fetcher();
    this.cache.set(key, { data, timestamp: now });
    return data;
  }

  // Batch multiple queries
  async batch<T>(
    batchKey: string,
    queryId: string,
    query: () => Promise<T>
  ): Promise<T> {
    return new Promise((resolve, reject) => {
      const batch = this.pendingBatches.get(batchKey) || [];
      batch.push({ id: queryId, query, resolve, reject });
      this.pendingBatches.set(batchKey, batch);

      // Clear existing timeout
      if (this.batchTimeout) {
        clearTimeout(this.batchTimeout);
      }

      // Execute batch after a short delay
      this.batchTimeout = setTimeout(() => {
        this.executeBatch(batchKey);
      }, 10);
    });
  }

  private async executeBatch(batchKey: string) {
    const batch = this.pendingBatches.get(batchKey);
    if (!batch || batch.length === 0) return;

    this.pendingBatches.delete(batchKey);

    try {
      // Execute all queries in parallel
      const results = await Promise.allSettled(
        batch.map((item) => item.query())
      );

      // Resolve/reject individual promises
      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          batch[index].resolve(result.value);
        } else {
          batch[index].reject(result.reason);
        }
      });
    } catch (error) {
      // Reject all if something goes catastrophically wrong
      batch.forEach((item) => item.reject(error));
    }
  }

  // Clear cache
  clearCache(pattern?: string) {
    if (pattern) {
      for (const key of this.cache.keys()) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
  }

  // Get cache stats
  getCacheStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
    };
  }
}

export const dataFetcher = new DataFetcher();