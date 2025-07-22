// src/contexts/ExamContext.tsx

"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useAuth } from "./AuthContext";
import { supabase } from "@/lib/supabase";
import {
  Test,
  TestCategory,
  TestQuestion,
  QuestionOption,
  ExamSession,
  ExamResults,
} from "@/types/exam";

interface ExamContextType {
  // State
  categories: TestCategory[];
  tests: Test[];
  currentTest: Test | null;
  currentSession: ExamSession | null;
  loading: boolean;
  error: string | null;

  // Actions
  fetchCategories: () => Promise<void>;
  fetchTests: (categoryId?: string) => Promise<void>;
  fetchTestById: (testId: string) => Promise<Test | null>;
  createCategory: (data: Partial<TestCategory>) => Promise<TestCategory | null>;
  updateCategory: (id: string, data: Partial<TestCategory>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  createTest: (data: Partial<Test>) => Promise<Test | null>;
  updateTest: (id: string, data: Partial<Test>) => Promise<void>;
  deleteTest: (id: string) => Promise<void>;
  publishTest: (id: string) => Promise<void>;
  unpublishTest: (id: string) => Promise<void>;
  clearError: () => void;
}

const ExamContext = createContext<ExamContextType | undefined>(undefined);

export function ExamProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [currentTest, setCurrentTest] = useState<Test | null>(null);
  const [currentSession, setCurrentSession] = useState<ExamSession | null>(
    null
  );
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Refs for subscriptions
  const categoriesSubscription = useRef<any>(null);
  const testsSubscription = useRef<any>(null);

  // Fetch all categories
  const fetchCategories = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from("test_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (fetchError) throw fetchError;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to fetch categories"
      );
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch tests (optionally by category)
  const fetchTests = useCallback(
    async (categoryId?: string) => {
      try {
        setLoading(true);
        setError(null);

        let query = supabase.from("tests").select(
          `
          *,
          category:test_categories(*),
          questions:test_questions(count)
        `
        );

        // If user is not admin/doctor, only show published tests
        if (!user || !["admin", "doctor"].includes(user.role || "")) {
          query = query.eq("is_published", true);
        }

        if (categoryId) {
          query = query.eq("category_id", categoryId);
        }

        const { data, error: fetchError } = await query.order("created_at", {
          ascending: false,
        });

        if (fetchError) throw fetchError;

        // Transform the data to include question count
        const transformedTests =
          data?.map((test) => ({
            ...test,
            question_count: test.questions?.[0]?.count || 0,
          })) || [];

        setTests(transformedTests);
      } catch (err) {
        console.error("Error fetching tests:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch tests");
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Fetch single test by ID
  const fetchTestById = useCallback(
    async (testId: string): Promise<Test | null> => {
      try {
        setLoading(true);
        setError(null);

        const { data, error: fetchError } = await supabase
          .from("tests")
          .select(
            `
          *,
          category:test_categories(*),
          questions:test_questions(
            *,
            options:question_options(*)
          )
        `
          )
          .eq("id", testId)
          .single();

        if (fetchError) throw fetchError;

        if (data) {
          // Sort questions and options by order
          const sortedQuestions = (data.questions || [])
            .sort(
              (a: TestQuestion, b: TestQuestion) =>
                a.question_order - b.question_order
            )
            .map((question: TestQuestion) => ({
              ...question,
              options: question.options.sort(
                (a: QuestionOption, b: QuestionOption) =>
                  a.option_order - b.option_order
              ),
            }));

          const testWithSortedQuestions = {
            ...data,
            questions: sortedQuestions,
          };

          setCurrentTest(testWithSortedQuestions);
          return testWithSortedQuestions;
        }

        return null;
      } catch (err) {
        console.error("Error fetching test:", err);
        setError(err instanceof Error ? err.message : "Failed to fetch test");
        return null;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Create category
  const createCategory = useCallback(
    async (data: Partial<TestCategory>): Promise<TestCategory | null> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to create categories");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: newCategory, error: createError } = await supabase
          .from("test_categories")
          .insert({
            ...data,
            created_by: user.id,
            is_active: true,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Update local state
        setCategories((prev) => [...prev, newCategory]);

        return newCategory;
      } catch (err) {
        console.error("Error creating category:", err);
        setError(
          err instanceof Error ? err.message : "Failed to create category"
        );
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Update category
  const updateCategory = useCallback(
    async (id: string, data: Partial<TestCategory>) => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to update categories");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("test_categories")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Update local state
        setCategories((prev) =>
          prev.map((cat) => (cat.id === id ? { ...cat, ...data } : cat))
        );
      } catch (err) {
        console.error("Error updating category:", err);
        setError(
          err instanceof Error ? err.message : "Failed to update category"
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Delete category
  const deleteCategory = useCallback(
    async (id: string) => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to delete categories");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        // Soft delete by setting is_active to false
        const { error: deleteError } = await supabase
          .from("test_categories")
          .update({ is_active: false })
          .eq("id", id);

        if (deleteError) throw deleteError;

        // Update local state
        setCategories((prev) => prev.filter((cat) => cat.id !== id));
      } catch (err) {
        console.error("Error deleting category:", err);
        setError(
          err instanceof Error ? err.message : "Failed to delete category"
        );
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Create test
  const createTest = useCallback(
    async (data: Partial<Test>): Promise<Test | null> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to create tests");
        return null;
      }

      try {
        setLoading(true);
        setError(null);

        const { data: newTest, error: createError } = await supabase
          .from("tests")
          .insert({
            ...data,
            created_by: user.id,
            is_published: false,
          })
          .select(
            `
            *,
            category:test_categories(*)
          `
          )
          .single();

        if (createError) throw createError;

        // Update local state
        setTests((prev) => [newTest, ...prev]);

        return newTest;
      } catch (err) {
        console.error("Error creating test:", err);
        setError(err instanceof Error ? err.message : "Failed to create test");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [user]
  );

  // Update test
  const updateTest = useCallback(
    async (id: string, data: Partial<Test>) => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to update tests");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { error: updateError } = await supabase
          .from("tests")
          .update({
            ...data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Update local state
        setTests((prev) =>
          prev.map((test) => (test.id === id ? { ...test, ...data } : test))
        );

        // Update current test if it's the one being edited
        if (currentTest?.id === id) {
          setCurrentTest((prev) => (prev ? { ...prev, ...data } : null));
        }
      } catch (err) {
        console.error("Error updating test:", err);
        setError(err instanceof Error ? err.message : "Failed to update test");
      } finally {
        setLoading(false);
      }
    },
    [user, currentTest]
  );

  // Delete test
  const deleteTest = useCallback(
    async (id: string) => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to delete tests");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const { error: deleteError } = await supabase
          .from("tests")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        // Update local state
        setTests((prev) => prev.filter((test) => test.id !== id));
      } catch (err) {
        console.error("Error deleting test:", err);
        setError(err instanceof Error ? err.message : "Failed to delete test");
      } finally {
        setLoading(false);
      }
    },
    [user]
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

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Set up real-time subscriptions
  useEffect(() => {
    // Subscribe to category changes
    categoriesSubscription.current = supabase
      .channel("test_categories_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "test_categories" },
        (payload) => {
          console.log("Category change:", payload);

          if (payload.eventType === "INSERT") {
            setCategories((prev) => [...prev, payload.new as TestCategory]);
          } else if (payload.eventType === "UPDATE") {
            setCategories((prev) =>
              prev.map((cat) =>
                cat.id === payload.new.id ? (payload.new as TestCategory) : cat
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

    // Subscribe to test changes
    testsSubscription.current = supabase
      .channel("tests_changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tests" },
        (payload) => {
          console.log("Test change:", payload);

          if (payload.eventType === "INSERT") {
            // Fetch the complete test with relations
            fetchTestById(payload.new.id);
          } else if (payload.eventType === "UPDATE") {
            setTests((prev) =>
              prev.map((test) =>
                test.id === payload.new.id
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
    };
  }, [fetchTestById]);

  const value: ExamContextType = {
    categories,
    tests,
    currentTest,
    currentSession,
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
