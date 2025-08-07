// src/contexts/ExamContext.tsx - Cache-free version
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
import { useCleanup } from "@/hooks/useCleanup";

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

  // Collaborative features
  subscribeToTestUpdates: (testId: string) => () => void;
  notifyTestEdit: (testId: string, userId: string) => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const { addCleanup, isMounted } = useCleanup();

  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const categoriesSubscription = useRef<RealtimeChannel | null>(null);
  const testsSubscription = useRef<RealtimeChannel | null>(null);
  const testUpdateSubscriptions = useRef<Map<string, RealtimeChannel>>(
    new Map()
  );

  // Fetch categories with mount check
  const fetchCategories = useCallback(async () => {
    if (!isMounted()) return;

    try {
      setLoading(true);
      setError(null);

      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error in fetchCategories:", sessionError);
        throw new Error("Authentication error");
      }

      if (!session) {
        console.log("No session in fetchCategories - waiting for auth");
        setLoading(false);
        return;
      }

      const { data, error: fetchError } = await supabase
        .from("test_categories")
        .select("*")
        .order("name");

      if (!isMounted()) return;

      if (fetchError) throw fetchError;

      if (isMounted()) {
        setCategories(data || []);
      }
    } catch (err) {
      if (isMounted()) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch categories"
        );
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [isMounted]);

  // Fetch tests with mount check
  const fetchTests = useCallback(
    async (categoryId?: string) => {
      if (!isMounted()) return;

      try {
        setLoading(true);
        setError(null);

        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error in fetchTests:", sessionError);
          throw new Error("Authentication error");
        }

        if (!session) {
          console.log("No session in fetchTests - waiting for auth");
          setLoading(false);
          return;
        }

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

        if (!isMounted()) return;

        if (fetchError) throw fetchError;

        // Transform the data to include question_count
        const enrichedTests = (data || []).map((test) => ({
          ...test,
          question_count: test.questions?.length || 0,
          questions: undefined,
        }));

        if (isMounted()) {
          setTests(enrichedTests);
        }
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch tests"
          );
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [isMounted]
  );

  // Fetch single test with mount check
  const fetchTestById = useCallback(
    async (testId: string): Promise<Test | null> => {
      if (!isMounted()) return null;

      try {
        const { data, error } = await supabase
          .from("tests")
          .select(
            `
            *,
            test_categories (
              id,
              name
            ),
            questions (
              id,
              question_text,
              question_type,
              points,
              order_index,
              explanation,
              options (
                id,
                option_text,
                is_correct,
                order_index
              )
            )
          `
          )
          .eq("id", testId)
          .single();

        if (error) throw error;

        if (isMounted() && data) {
          setCurrentTest(data);
          return data;
        }

        return null;
      } catch (err) {
        if (isMounted()) {
          console.error("Error fetching test:", err);
        }
        return null;
      }
    },
    [isMounted]
  );

  // Create category with mount check
  const createCategory = useCallback(
    async (
      data: Omit<TestCategory, "id" | "created_at" | "updated_at" | "is_active">
    ): Promise<TestCategory | null> => {
      if (!isMounted()) return null;

      try {
        setLoading(true);
        setError(null);

        const { data: newCategory, error: createError } = await supabase
          .from("test_categories")
          .insert([data])
          .select()
          .single();

        if (!isMounted()) return null;

        if (createError) throw createError;

        if (isMounted()) {
          setCategories((prev) => [...prev, newCategory]);
        }

        return newCategory;
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to create category"
          );
        }
        return null;
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [isMounted]
  );

  // Update category with mount check
  const updateCategory = useCallback(
    async (id: string, data: Partial<TestCategory>) => {
      if (!isMounted()) return;

      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("test_categories")
          .update(data)
          .eq("id", id);

        if (!isMounted()) return;

        if (updateError) throw updateError;

        if (isMounted()) {
          setCategories((prev) =>
            prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
          );
        }
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to update category"
          );
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [isMounted]
  );

  // Delete category with mount check
  const deleteCategory = useCallback(
    async (id: string) => {
      if (!isMounted()) return;

      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("test_categories")
          .delete()
          .eq("id", id);

        if (!isMounted()) return;

        if (deleteError) throw deleteError;

        if (isMounted()) {
          setCategories((prev) => prev.filter((cat) => cat.id !== id));
        }
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to delete category"
          );
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [isMounted]
  );

  // Create test with mount check
  const createTest = useCallback(
    async (data: TestCreate): Promise<Test | null> => {
      if (!isMounted()) return null;

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

        if (!isMounted()) return null;

        if (createError) throw createError;

        const enrichedTest = {
          ...newTest,
          question_count: 0,
        };

        if (isMounted()) {
          setTests((prev) => [enrichedTest, ...prev]);
        }

        return enrichedTest;
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to create test"
          );
        }
        return null;
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [user, isMounted]
  );

  // Update test with mount check
  const updateTest = useCallback(
    async (id: string, data: TestUpdate) => {
      if (!isMounted()) return;

      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("tests")
          .update(data)
          .eq("id", id);

        if (!isMounted()) return;

        if (updateError) throw updateError;

        if (isMounted()) {
          setTests((prev) =>
            prev.map((test) => (test.id === id ? { ...test, ...data } : test))
          );

          if (currentTest?.id === id) {
            setCurrentTest((prev) => (prev ? { ...prev, ...data } : null));
          }
        }
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to update test"
          );
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [currentTest, isMounted]
  );

  // Delete test with mount check
  const deleteTest = useCallback(
    async (id: string) => {
      if (!isMounted()) return;

      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("tests")
          .delete()
          .eq("id", id);

        if (!isMounted()) return;

        if (deleteError) throw deleteError;

        if (isMounted()) {
          setTests((prev) => prev.filter((test) => test.id !== id));

          if (currentTest?.id === id) {
            setCurrentTest(null);
          }
        }
      } catch (err) {
        if (isMounted()) {
          setError(
            err instanceof Error ? err.message : "Failed to delete test"
          );
        }
      } finally {
        if (isMounted()) {
          setLoading(false);
        }
      }
    },
    [currentTest, isMounted]
  );

  // Publish/unpublish delegated to updateTest
  const publishTest = useCallback(
    async (id: string) => {
      await updateTest(id, { is_published: true });
    },
    [updateTest]
  );

  const unpublishTest = useCallback(
    async (id: string) => {
      await updateTest(id, { is_published: false });
    },
    [updateTest]
  );

  // Subscribe to test updates with cleanup
  const subscribeToTestUpdates = useCallback(
    (testId: string) => {
      if (!isMounted()) return () => {};

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
            if (!isMounted()) return;

            if (payload.eventType === "UPDATE") {
              const updatedTest = payload.new as Test;
              setTests((prev) =>
                prev.map((test) =>
                  test.id === testId ? { ...test, ...updatedTest } : test
                )
              );

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
    [currentTest, isMounted]
  );

  // Notify when editing a test
  const notifyTestEdit = useCallback(
    async (testId: string, userId: string) => {
      if (!isMounted()) return;

      const channel = supabase.channel(`test-editors-${testId}`);
      await channel.send({
        type: "broadcast",
        event: "user_editing",
        payload: { userId, timestamp: new Date().toISOString() },
      });
    },
    [isMounted]
  );

  // Set up real-time subscriptions with mount check
  const setupSubscriptions = useCallback(() => {
    if (!isMounted()) return;

    // Subscribe to categories changes
    categoriesSubscription.current = supabase
      .channel("categories-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_categories" },
        (payload) => {
          if (!isMounted()) return;

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
          if (!isMounted()) return;

          if (payload.eventType === "INSERT") {
            // Just let normal fetch handle new tests
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

    // Add subscriptions to cleanup
    addCleanup(() => {
      if (categoriesSubscription.current) {
        categoriesSubscription.current.unsubscribe();
        categoriesSubscription.current = null;
      }
      if (testsSubscription.current) {
        testsSubscription.current.unsubscribe();
        testsSubscription.current = null;
      }
    });
  }, [isMounted, addCleanup]);

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

  // Comprehensive cleanup
  const cleanup = useCallback(() => {
    // Clean up all subscriptions
    if (categoriesSubscription.current) {
      categoriesSubscription.current.unsubscribe();
      categoriesSubscription.current = null;
    }

    if (testsSubscription.current) {
      testsSubscription.current.unsubscribe();
      testsSubscription.current = null;
    }

    // Clean up all test update subscriptions
    testUpdateSubscriptions.current.forEach((subscription) => {
      subscription.unsubscribe();
    });
    testUpdateSubscriptions.current.clear();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup();
    };
  }, [cleanup]);

  // Clear error with mount check
  const clearError = useCallback(() => {
    if (isMounted()) {
      setError(null);
    }
  }, [isMounted]);

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
