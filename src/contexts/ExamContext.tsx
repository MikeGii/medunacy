// src/contexts/ExamContext.tsx - FIXED VERSION with memory leak prevention

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { supabase } from "@/lib/supabase";
import { Test, TestCategory, TestCreate, TestUpdate } from "@/types/exam";
import { RealtimeChannel } from "@supabase/realtime-js";
import { useAuth } from "@/contexts/AuthContext";

// Cache configuration
const MAX_CACHE_SIZE = 50;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

interface CachedTest {
  data: Test;
  timestamp: number;
}

interface ExamContextType {
  // State
  categories: TestCategory[];
  tests: Test[];
  currentTest: Test | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchTests: (categoryId?: string) => Promise<void>;
  fetchTestById: (testId: string) => Promise<Test | null>;
  createCategory: (
    data: Omit<TestCategory, "id" | "created_at" | "updated_at" | "is_active">
  ) => Promise<TestCategory | null>;
  updateCategory: (id: string, data: Partial<TestCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createTest: (data: TestCreate) => Promise<Test | null>;
  updateTest: (id: string, data: TestUpdate) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  publishTest: (id: string) => Promise<void>;
  unpublishTest: (id: string) => Promise<void>;
  clearError: () => void;
  clearCache: () => void;

  // Collaborative features
  subscribeToTestUpdates: (testId: string) => () => void;
  notifyTestEdit: (testId: string, userId: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Improved cache with TTL and size limit
  const testCache = useRef<Map<string, CachedTest>>(new Map());
  const cacheCleanupTimer = useRef<NodeJS.Timeout | null>(null);

  const categoriesSubscription = useRef<RealtimeChannel | null>(null);
  const testsSubscription = useRef<RealtimeChannel | null>(null);
  const testUpdateSubscriptions = useRef<Map<string, RealtimeChannel>>(
    new Map()
  );

  // Cache management functions
  const addToCache = useCallback((test: Test) => {
    const cache = testCache.current;

    // Remove expired entries first
    const now = Date.now();
    for (const [key, value] of cache.entries()) {
      if (now - value.timestamp > CACHE_TTL) {
        cache.delete(key);
      }
    }

    // Implement LRU: Remove oldest if at capacity
    if (cache.size >= MAX_CACHE_SIZE) {
      let oldestKey = "";
      let oldestTime = Infinity;

      for (const [key, value] of cache.entries()) {
        if (value.timestamp < oldestTime) {
          oldestTime = value.timestamp;
          oldestKey = key;
        }
      }

      if (oldestKey) {
        cache.delete(oldestKey);
      }
    }

    // Add new entry
    cache.set(test.id, {
      data: test,
      timestamp: Date.now(),
    });
  }, []);

  const getFromCache = useCallback((testId: string): Test | null => {
    const cached = testCache.current.get(testId);

    if (!cached) return null;

    // Check if expired
    if (Date.now() - cached.timestamp > CACHE_TTL) {
      testCache.current.delete(testId);
      return null;
    }

    return cached.data;
  }, []);

  const clearCache = useCallback(() => {
    testCache.current.clear();
  }, []);

  // Periodic cache cleanup
  useEffect(() => {
    cacheCleanupTimer.current = setInterval(() => {
      const now = Date.now();
      const cache = testCache.current;

      for (const [key, value] of cache.entries()) {
        if (now - value.timestamp > CACHE_TTL) {
          cache.delete(key);
        }
      }
    }, 60000); // Run every minute

    return () => {
      if (cacheCleanupTimer.current) {
        clearInterval(cacheCleanupTimer.current);
      }
    };
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("test_categories")
        .select("*")
        .order("name");

      if (fetchError) throw fetchError;

      setCategories(data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tests with optional category filter
  const fetchTests = useCallback(
    async (categoryId?: string) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase
          .from("tests")
          .select(
            `
          *,
          category:test_categories(*),
          questions:test_questions(id)
        `
          )
          .order("created_at", { ascending: false });

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data, error: fetchError } = await query;

        if (fetchError) throw fetchError;

        // Transform the data to include question_count as a number
        const enrichedTests = (data || []).map((test) => ({
          ...test,
          question_count: test.questions?.length || 0,
          questions: undefined, // Remove the questions array from the final object
        }));

        setTests(enrichedTests);

        // Update cache with new tests
        enrichedTests.forEach((test) => {
          addToCache(test);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tests");
      } finally {
        setLoading(false);
      }
    },
    [addToCache]
  );

  // Fetch single test by ID with caching
  const fetchTestById = useCallback(
    async (testId: string): Promise<Test | null> => {
      try {
        // Check cache first
        const cached = getFromCache(testId);
        if (cached) {
          setCurrentTest(cached);
          return cached;
        }

        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("tests")
          .select(
            `
        *,
        category:test_categories(*),
        test_questions(
          *,
          question_options(*)
        )
      `
          )
          .eq("id", testId)
          .single();

        if (fetchError) throw fetchError;

        const enrichedTest = {
          ...data,
          question_count: data.test_questions?.length || 0,
          questions: data.test_questions || [],
        };

        setCurrentTest(enrichedTest);
        addToCache(enrichedTest);

        return enrichedTest;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch test");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [getFromCache, addToCache]
  );

  // Create category
  const createCategory = useCallback(
    async (
      data: Omit<TestCategory, "id" | "created_at" | "updated_at" | "is_active">
    ): Promise<TestCategory | null> => {
      try {
        setLoading(true);
        setError(null);

        const { data: newCategory, error: createError } = await supabase
          .from("test_categories")
          .insert([data])
          .select()
          .single();

        if (createError) throw createError;

        // Optimistic update
        setCategories((prev) => [...prev, newCategory]);

        return newCategory;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create category"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Update category
  const updateCategory = useCallback(
    async (id: string, data: Partial<TestCategory>) => {
      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("test_categories")
          .update(data)
          .eq("id", id);

        if (updateError) throw updateError;

        // Optimistic update
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
        );
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update category"
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Delete category
  const deleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const { error: deleteError } = await supabase
        .from("test_categories")
        .delete()
        .eq("id", id);

      if (deleteError) throw deleteError;

      // Optimistic update
      setCategories((prev) => prev.filter((cat) => cat.id !== id));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Create test
  const createTest = useCallback(
    async (data: TestCreate): Promise<Test | null> => {
      try {
        setLoading(true);
        setError(null);

        const { data: newTest, error: createError } = await supabase
          .from("tests")
          .insert([
            {
              ...data,
              created_by: user?.id,
            },
          ])
          .select(
            `
            *,
            category:test_categories(*)
          `
          )
          .single();

        if (createError) throw createError;

        const enrichedTest = {
          ...newTest,
          question_count: 0,
        };

        // Optimistic update
        setTests((prev) => [enrichedTest, ...prev]);
        addToCache(enrichedTest);

        return enrichedTest;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create test");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, addToCache]
  );

  // Update test with cache invalidation
  const updateTest = useCallback(
    async (id: string, data: TestUpdate) => {
      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("tests")
          .update(data)
          .eq("id", id);

        if (updateError) throw updateError;

        // Optimistic update
        setTests((prev) =>
          prev.map((test) => (test.id === id ? { ...test, ...data } : test))
        );

        // Invalidate cache for this test
        testCache.current.delete(id);

        // If it's the current test, update it
        if (currentTest?.id === id) {
          setCurrentTest((prev) => (prev ? { ...prev, ...data } : null));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update test");
      } finally {
        setLoading(false);
      }
    },
    [currentTest]
  );

  // Delete test with cache cleanup
  const deleteTest = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("tests")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        // Optimistic update
        setTests((prev) => prev.filter((test) => test.id !== id));

        // Remove from cache
        testCache.current.delete(id);

        // Clear current test if it's the deleted one
        if (currentTest?.id === id) {
          setCurrentTest(null);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete test");
      } finally {
        setLoading(false);
      }
    },
    [currentTest]
  );

  // Publish test
  const publishTest = useCallback(
    async (id: string) => {
      await updateTest(id, { is_published: true });
    },
    [updateTest]
  );

  // Unpublish test
  const unpublishTest = useCallback(
    async (id: string) => {
      await updateTest(id, { is_published: false });
    },
    [updateTest]
  );

  // Subscribe to test updates for collaborative editing
  const subscribeToTestUpdates = useCallback(
    (testId: string) => {
      const channel = supabase
        .channel(`test-updates-${testId}`)
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "tests",
            filter: `id=eq.${testId}`,
          },
          (payload) => {
            if (payload.eventType === "UPDATE") {
              const updatedTest = payload.new as Test;
              setTests((prev) =>
                prev.map((test) =>
                  test.id === testId ? { ...test, ...updatedTest } : test
                )
              );

              // Invalidate cache
              testCache.current.delete(testId);

              if (currentTest?.id === testId) {
                setCurrentTest((prev) =>
                  prev ? { ...prev, ...updatedTest } : null
                );
              }
            }
          }
        )
        .subscribe();

      testUpdateSubscriptions.current.set(testId, channel);

      return () => {
        channel.unsubscribe();
        testUpdateSubscriptions.current.delete(testId);
      };
    },
    [currentTest]
  );

  // Notify when editing a test
  const notifyTestEdit = useCallback(async (testId: string, userId: string) => {
    const channel = supabase.channel(`test-editors-${testId}`);

    await channel.send({
      type: "broadcast",
      event: "user_editing",
      payload: { userId, timestamp: new Date().toISOString() },
    });
  }, []);

  // Set up real-time subscriptions with stable callback
  const setupSubscriptions = useCallback(() => {
    // Subscribe to categories changes
    categoriesSubscription.current = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_categories" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setCategories((prev) => [...prev, payload.new as TestCategory]);
          } else if (payload.eventType === "UPDATE") {
            setCategories((prev) =>
              prev.map((cat) =>
                cat.id === payload.old.id
                  ? { ...cat, ...(payload.new as TestCategory) }
                  : cat
              )
            );
          } else if (payload.eventType === "DELETE") {
            setCategories((prev) =>
              prev.filter((cat) => cat.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Subscribe to tests changes
    testsSubscription.current = supabase
      .channel("tests-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tests" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            // Invalidate cache for new test
            testCache.current.delete(payload.new.id);
          } else if (payload.eventType === "UPDATE") {
            setTests((prev) =>
              prev.map((test) =>
                test.id === payload.old.id
                  ? { ...test, ...(payload.new as Test) }
                  : test
              )
            );
            // Invalidate cache
            testCache.current.delete(payload.old.id);
          } else if (payload.eventType === "DELETE") {
            setTests((prev) =>
              prev.filter((test) => test.id !== payload.old.id)
            );
            // Remove from cache
            testCache.current.delete(payload.old.id);
          }
        }
      )
      .subscribe();
  }, []);

  // Set up subscriptions once
  useEffect(() => {
    setupSubscriptions();

    return () => {
      if (categoriesSubscription.current) {
        supabase.removeChannel(categoriesSubscription.current);
      }
      if (testsSubscription.current) {
        supabase.removeChannel(testsSubscription.current);
      }
    };
  }, [setupSubscriptions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear all subscriptions
      testUpdateSubscriptions.current.forEach((channel) => {
        channel.unsubscribe();
      });
      testUpdateSubscriptions.current.clear();

      // Clear cache
      testCache.current.clear();

      // Clear timer
      if (cacheCleanupTimer.current) {
        clearInterval(cacheCleanupTimer.current);
      }
    };
  }, []);

  const value: ExamContextType = {
    categories,
    tests,
    currentTest,
    loading,
    error,
    fetchCategories,
    fetchTests,
    fetchTestById,
    createCategory,
    updateCategory,
    deleteCategory,
    createTest,
    updateTest,
    deleteTest,
    publishTest,
    unpublishTest,
    clearError,
    clearCache,
    subscribeToTestUpdates,
    notifyTestEdit,
  };

  return <ExamContext.Provider value={value}>{children}</ExamContext.Provider>;
}

// Custom hook to use the exam context
export function useExam() {
  const context = useContext(ExamContext);
  if (context === undefined) {
    throw new Error("useExam must be used within an ExamProvider");
  }
  return context;
}
