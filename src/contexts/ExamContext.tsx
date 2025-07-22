// src/contexts/ExamContext.tsx - FIXED VERSION (remove TestSession)

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

interface ExamContextType {
  // State
  categories: TestCategory[];
  tests: Test[];
  currentTest: Test | null;
  loading: boolean;
  error: string | null;
  testCache: Map<string, Test>;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchTests: (categoryId?: string) => Promise<void>;
  fetchTestById: (testId: string) => Promise<Test | null>;
  createCategory: (
    data: Omit<TestCategory, "id" | "created_at">
  ) => Promise<TestCategory | null>;
  updateCategory: (id: string, data: Partial<TestCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createTest: (data: TestCreate) => Promise<Test | null>;
  updateTest: (id: string, data: TestUpdate) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  publishTest: (id: string) => Promise<void>;
  unpublishTest: (id: string) => Promise<void>;
  clearError: () => void;

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
  const [testCache] = useState(new Map<string, Test>());

  const categoriesSubscription = useRef<RealtimeChannel | null>(null);
  const testsSubscription = useRef<RealtimeChannel | null>(null);
  const testUpdateSubscriptions = useRef<Map<string, RealtimeChannel>>(
    new Map()
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Fetch categories with caching
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
          .from("exam_tests")
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

        // Update cache
        enrichedTests.forEach((test) => {
          testCache.set(test.id, test);
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch tests");
      } finally {
        setLoading(false);
      }
    },
    [testCache]
  );

  // Fetch single test by ID with caching
  const fetchTestById = useCallback(
    async (testId: string): Promise<Test | null> => {
      try {
        // Check cache first
        if (testCache.has(testId)) {
          const cached = testCache.get(testId)!;
          setCurrentTest(cached);
          return cached;
        }

        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("exam_tests")
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
        testCache.set(testId, enrichedTest);

        return enrichedTest;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to fetch test");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [testCache]
  );

  // Create category
  const createCategory = useCallback(
    async (
      data: Omit<TestCategory, "id" | "created_at">
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

  // Create test with optimistic update
  const createTest = useCallback(
    async (data: TestCreate): Promise<Test | null> => {
      try {
        setLoading(true);
        setError(null);

        const { data: newTest, error: createError } = await supabase
          .from("exam_tests")
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
        testCache.set(enrichedTest.id, enrichedTest);

        return enrichedTest;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to create test");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user, testCache]
  );

  // Update test with optimistic update
  const updateTest = useCallback(
    async (id: string, data: TestUpdate) => {
      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("exam_tests")
          .update(data)
          .eq("id", id);

        if (updateError) throw updateError;

        // Optimistic update
        setTests((prev) =>
          prev.map((test) => (test.id === id ? { ...test, ...data } : test))
        );

        // Update cache
        const cachedTest = testCache.get(id);
        if (cachedTest) {
          testCache.set(id, { ...cachedTest, ...data });
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update test");
      } finally {
        setLoading(false);
      }
    },
    [testCache]
  );

  // Delete test
  const deleteTest = useCallback(
    async (id: string) => {
      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("exam_tests")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        // Optimistic update
        setTests((prev) => prev.filter((test) => test.id !== id));
        testCache.delete(id);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete test");
      } finally {
        setLoading(false);
      }
    },
    [testCache]
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
            table: "exam_tests",
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

              // Update cache
              const cachedTest = testCache.get(testId);
              if (cachedTest) {
                testCache.set(testId, { ...cachedTest, ...updatedTest });
              }

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
    [currentTest, testCache]
  );

  // Notify when editing a test (for collaborative indicators)
  const notifyTestEdit = useCallback(async (testId: string, userId: string) => {
    const channel = supabase.channel(`test-editors-${testId}`);

    await channel.send({
      type: "broadcast",
      event: "user_editing",
      payload: { userId, timestamp: new Date().toISOString() },
    });
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
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
        { event: "*", schema: "public", table: "exam_tests" },
        async (payload) => {
          if (payload.eventType === "INSERT") {
            // Fetch full test data with relations
            const newTest = await fetchTestById(payload.new.id);
            if (newTest) {
              setTests((prev) => [newTest, ...prev]);
            }
          } else if (payload.eventType === "UPDATE") {
            setTests((prev) =>
              prev.map((test) =>
                test.id === payload.old.id
                  ? { ...test, ...(payload.new as Test) }
                  : test
              )
            );
          } else if (payload.eventType === "DELETE") {
            setTests((prev) =>
              prev.filter((test) => test.id !== payload.old.id)
            );
          }
        }
      )
      .subscribe();

    // Cleanup subscriptions
    return () => {
      if (categoriesSubscription.current) {
        supabase.removeChannel(categoriesSubscription.current);
      }
      if (testsSubscription.current) {
        supabase.removeChannel(testsSubscription.current);
      }
      testUpdateSubscriptions.current.forEach((channel) => {
        channel.unsubscribe();
      });
    };
  }, [fetchTestById]);

  const value: ExamContextType = {
    categories,
    tests,
    currentTest,
    loading,
    error,
    testCache,
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
