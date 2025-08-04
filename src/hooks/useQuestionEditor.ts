// src/hooks/useQuestionEditor.ts - ENHANCED VERSION

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { TestQuestion, QuestionFormData } from "@/types/exam";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UseQuestionEditorProps {
  testId: string;
  onQuestionSaved?: () => void;
  enableAutoSave?: boolean;
}

interface UseQuestionEditorReturn {
  // State
  questions: TestQuestion[];
  loading: boolean;
  saving: boolean;
  error: string | null;
  selectedQuestions: Set<string>;
  isDirty: boolean;

  // Actions
  fetchQuestions: () => Promise<void>;
  createQuestion: (data: QuestionFormData) => Promise<TestQuestion | null>;
  updateQuestion: (
    id: string,
    data: QuestionFormData
  ) => Promise<TestQuestion | null>;
  deleteQuestion: (id: string) => Promise<boolean>;
  reorderQuestions: (questionId: string, newOrder: number) => Promise<boolean>;
  duplicateQuestion: (questionId: string) => Promise<TestQuestion | null>;
  bulkDeleteQuestions: (questionIds: string[]) => Promise<boolean>;
  importQuestions: (
    questions: QuestionFormData[]
  ) => Promise<{ success: number; failed: number }>;
  generateRandomQuestions: (params: {
    questionCount: number;
    allowMultipleCorrect: boolean;
    sourceTestIds: string[];
  }) => Promise<{ success: number; failed: number }>;
  clearError: () => void;

  // Selection
  toggleQuestionSelection: (questionId: string) => void;
  selectAllQuestions: () => void;
  clearSelection: () => void;

  // Auto-save
  markAsDirty: () => void;
}

export function useQuestionEditor({
  testId,
  onQuestionSaved,
  enableAutoSave = false,
}: UseQuestionEditorProps): UseQuestionEditorReturn {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedQuestions, setSelectedQuestions] = useState<Set<string>>(
    new Set()
  );
  const [isDirty, setIsDirty] = useState(false);

  const questionsCache = useRef<Map<string, TestQuestion>>(new Map());
  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch all questions for the test
  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from("test_questions")
        .select(
          `
          *,
          options:question_options(*)
        `
        )
        .eq("test_id", testId)
        .order("question_order");

      if (fetchError) throw fetchError;

      const sortedQuestions = (data || []).map((question) => ({
        ...question,
        options: question.options.sort(
          (a: any, b: any) => a.option_order - b.option_order
        ),
      }));

      setQuestions(sortedQuestions);

      // Update cache
      questionsCache.current.clear();
      sortedQuestions.forEach((q) => questionsCache.current.set(q.id, q));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch questions"
      );
    } finally {
      setLoading(false);
    }
  }, [testId]);

  // Auto-save functionality
  useEffect(() => {
    if (enableAutoSave && isDirty) {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      autoSaveTimerRef.current = setTimeout(() => {
        // Auto-save logic here if needed
        setIsDirty(false);
      }, 2000);
    }

    return () => {
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }
    };
  }, [enableAutoSave, isDirty]);

  // Create a new question
  const createQuestion = useCallback(
    async (data: QuestionFormData): Promise<TestQuestion | null> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to create questions");
        return null;
      }

      setSaving(true);
      setError(null);

      try {
        // Get the next order number
        const maxOrder = Math.max(
          ...questions.map((q) => q.question_order || 0),
          0
        );

        // Create the question
        const { data: newQuestion, error: createError } = await supabase
          .from("test_questions")
          .insert([
            {
              test_id: testId,
              question_text: data.question_text,
              explanation: data.explanation,
              points: data.points,
              question_order: maxOrder + 1,
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        // Create options
        const optionsToInsert = data.options.map((option, index) => ({
          question_id: newQuestion.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          option_order: index,
        }));

        const { data: insertedOptions, error: optionsError } = await supabase
          .from("question_options")
          .insert(optionsToInsert)
          .select();

        if (optionsError) throw optionsError;

        const completeQuestion = {
          ...newQuestion,
          options: insertedOptions || [],
        };

        // Update local state optimistically
        setQuestions((prev) => [...prev, completeQuestion]);
        questionsCache.current.set(completeQuestion.id, completeQuestion);

        if (onQuestionSaved) onQuestionSaved();

        return completeQuestion;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to create question"
        );
        return null;
      } finally {
        setSaving(false);
      }
    },
    [user, testId, questions, onQuestionSaved]
  );

  // Update question
  const updateQuestion = useCallback(
    async (
      id: string,
      data: QuestionFormData
    ): Promise<TestQuestion | null> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to update questions");
        return null;
      }

      setSaving(true);
      setError(null);

      try {
        // Update the question
        const { error: updateError } = await supabase
          .from("test_questions")
          .update({
            question_text: data.question_text,
            explanation: data.explanation,
            points: data.points,
          })
          .eq("id", id);

        if (updateError) throw updateError;

        // Delete existing options
        const { error: deleteError } = await supabase
          .from("question_options")
          .delete()
          .eq("question_id", id);

        if (deleteError) throw deleteError;

        // Insert new options
        const optionsToInsert = data.options.map((option, index) => ({
          question_id: id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          option_order: index,
        }));

        const { data: insertedOptions, error: optionsError } = await supabase
          .from("question_options")
          .insert(optionsToInsert)
          .select();

        if (optionsError) throw optionsError;

        const updatedQuestion = {
          ...questionsCache.current.get(id)!,
          question_text: data.question_text,
          explanation: data.explanation,
          points: data.points,
          options: insertedOptions || [],
        };

        // Update local state optimistically
        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? updatedQuestion : q))
        );
        questionsCache.current.set(id, updatedQuestion);

        if (onQuestionSaved) onQuestionSaved();

        return updatedQuestion;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to update question"
        );
        return null;
      } finally {
        setSaving(false);
      }
    },
    [user, onQuestionSaved]
  );

  // Delete question
  const deleteQuestion = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to delete questions");
        return false;
      }

      setSaving(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("test_questions")
          .delete()
          .eq("id", id);

        if (deleteError) throw deleteError;

        // Update local state optimistically
        setQuestions((prev) => prev.filter((q) => q.id !== id));
        questionsCache.current.delete(id);
        setSelectedQuestions((prev) => {
          const newSet = new Set(prev);
          newSet.delete(id);
          return newSet;
        });

        if (onQuestionSaved) onQuestionSaved();

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete question"
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, onQuestionSaved]
  );

  const reorderQuestions = useCallback(
    async (questionId: string, newOrder: number): Promise<boolean> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to reorder questions");
        return false;
      }

      setSaving(true);
      setError(null);

      try {
        const currentQuestion = questions.find((q) => q.id === questionId);
        if (!currentQuestion) throw new Error("Question not found");

        const oldOrder = currentQuestion.question_order || 0;

        // Prepare batch updates
        const batchUpdates: Array<{ id: string; question_order: number }> = [];

        if (newOrder > oldOrder) {
          // Moving down - decrease order of questions in between
          questions.forEach((q) => {
            const order = q.question_order || 0;
            if (order > oldOrder && order <= newOrder && q.id !== questionId) {
              batchUpdates.push({ id: q.id, question_order: order - 1 });
            }
          });
        } else if (newOrder < oldOrder) {
          // Moving up - increase order of questions in between
          questions.forEach((q) => {
            const order = q.question_order || 0;
            if (order >= newOrder && order < oldOrder && q.id !== questionId) {
              batchUpdates.push({ id: q.id, question_order: order + 1 });
            }
          });
        }

        // Add the moved question
        batchUpdates.push({ id: questionId, question_order: newOrder });

        // Execute all updates
        for (const update of batchUpdates) {
          const { error: updateError } = await supabase
            .from("test_questions")
            .update({ question_order: update.question_order })
            .eq("id", update.id);

          if (updateError) throw updateError;
        }

        // Update local state optimistically
        const updatedQuestions = questions.map((q) => {
          const update = batchUpdates.find((u) => u.id === q.id);
          if (update) {
            return { ...q, question_order: update.question_order };
          }
          return q;
        });

        // Sort by order
        updatedQuestions.sort(
          (a, b) => (a.question_order || 0) - (b.question_order || 0)
        );
        setQuestions(updatedQuestions);

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reorder questions"
        );
        // Refetch on error to restore correct state
        await fetchQuestions();
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, questions, fetchQuestions]
  );

  [
    {
      resource:
        "/c:/Users/EmGii/Desktop/Gii Development/Medunacy/src/hooks/useQuestionEditor.ts",
      owner: "typescript",
      code: "2345",
      severity: 8,
      message:
        "Argument of type 'PostgrestFilterBuilder<any, any, null, \"test_questions\", unknown>' is not assignable to parameter of type 'Promise<any>'.\n  Type 'PostgrestFilterBuilder<any, any, null, \"test_questions\", unknown>' is missing the following properties from type 'Promise<any>': catch, finally, [Symbol.toStringTag]",
      source: "ts",
      startLineNumber: 355,
      startColumn: 28,
      endLineNumber: 355,
      endColumn: 41,
      origin: "extHost1",
    },
    {
      resource:
        "/c:/Users/EmGii/Desktop/Gii Development/Medunacy/src/hooks/useQuestionEditor.ts",
      owner: "typescript",
      code: "2345",
      severity: 8,
      message:
        "Argument of type 'PostgrestFilterBuilder<any, any, null, \"test_questions\", unknown>' is not assignable to parameter of type 'Promise<any>'.\n  Type 'PostgrestFilterBuilder<any, any, null, \"test_questions\", unknown>' is missing the following properties from type 'Promise<any>': catch, finally, [Symbol.toStringTag]",
      source: "ts",
      startLineNumber: 369,
      startColumn: 28,
      endLineNumber: 369,
      endColumn: 41,
      origin: "extHost1",
    },
    {
      resource:
        "/c:/Users/EmGii/Desktop/Gii Development/Medunacy/src/hooks/useQuestionEditor.ts",
      owner: "typescript",
      code: "2345",
      severity: 8,
      message:
        "Argument of type 'PostgrestFilterBuilder<any, any, null, \"test_questions\", unknown>' is not assignable to parameter of type 'Promise<any>'.\n  Type 'PostgrestFilterBuilder<any, any, null, \"test_questions\", unknown>' is missing the following properties from type 'Promise<any>': catch, finally, [Symbol.toStringTag]",
      source: "ts",
      startLineNumber: 380,
      startColumn: 22,
      endLineNumber: 380,
      endColumn: 41,
      origin: "extHost1",
    },
  ];

  // Duplicate question
  const duplicateQuestion = useCallback(
    async (questionId: string): Promise<TestQuestion | null> => {
      const originalQuestion = questionsCache.current.get(questionId);
      if (!originalQuestion) {
        setError("Question not found");
        return null;
      }

      const duplicateData: QuestionFormData = {
        question_text: `${originalQuestion.question_text} (Copy)`,
        explanation: originalQuestion.explanation,
        points: originalQuestion.points,
        options: originalQuestion.options.map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      };

      return createQuestion(duplicateData);
    },
    [createQuestion]
  );

  // Bulk delete questions
  const bulkDeleteQuestions = useCallback(
    async (questionIds: string[]): Promise<boolean> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to delete questions");
        return false;
      }

      setSaving(true);
      setError(null);

      try {
        const { error: deleteError } = await supabase
          .from("test_questions")
          .delete()
          .in("id", questionIds);

        if (deleteError) throw deleteError;

        // Update local state optimistically
        setQuestions((prev) => prev.filter((q) => !questionIds.includes(q.id)));
        questionIds.forEach((id) => questionsCache.current.delete(id));
        setSelectedQuestions(new Set());

        if (onQuestionSaved) onQuestionSaved();

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete questions"
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, onQuestionSaved]
  );

  // Import questions
  const importQuestions = useCallback(
    async (
      questionsData: QuestionFormData[]
    ): Promise<{ success: number; failed: number }> => {
      let success = 0;
      let failed = 0;

      for (const questionData of questionsData) {
        const result = await createQuestion(questionData);
        if (result) {
          success++;
        } else {
          failed++;
        }
      }

      return { success, failed };
    },
    [createQuestion]
  );

  const generateRandomQuestions = useCallback(
    async (params: {
      questionCount: number;
      allowMultipleCorrect: boolean;
      sourceTestIds: string[];
    }): Promise<{ success: number; failed: number }> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to generate questions");
        return { success: 0, failed: 0 };
      }

      setLoading(true);
      setError(null);

      try {
        // Step 1: Fetch all questions from source tests
        const { data: sourceQuestions, error: fetchError } = await supabase
          .from("test_questions")
          .select(
            `
          id,
          question_text,
          explanation,
          points,
          question_order,
          options:question_options!inner (
            id,
            option_text,
            is_correct,
            option_order
          )
        `
          )
          .in("test_id", params.sourceTestIds)
          .order("question_order");

        if (fetchError) throw fetchError;

        if (!sourceQuestions || sourceQuestions.length === 0) {
          setError("No questions found in selected tests");
          return { success: 0, failed: 0 };
        }

        // Step 2: Filter questions if needed (client-side)
        let eligibleQuestions = sourceQuestions;

        if (!params.allowMultipleCorrect) {
          eligibleQuestions = sourceQuestions.filter((q) => {
            const correctCount = q.options.filter(
              (opt: any) => opt.is_correct
            ).length;
            return correctCount === 1;
          });
        }

        if (eligibleQuestions.length === 0) {
          setError("No questions match the criteria");
          return { success: 0, failed: 0 };
        }

        // Step 3: Randomly select questions
        const shuffled = [...eligibleQuestions].sort(() => Math.random() - 0.5);
        const selectedQuestions = shuffled.slice(
          0,
          Math.min(params.questionCount, eligibleQuestions.length)
        );

        // Step 4: Import selected questions as new questions
        const questionsToImport: QuestionFormData[] = selectedQuestions.map(
          (q) => ({
            question_text: q.question_text,
            explanation: q.explanation || "",
            points: q.points,
            options: q.options
              .sort((a: any, b: any) => a.option_order - b.option_order)
              .map((opt: any) => ({
                option_text: opt.option_text,
                is_correct: opt.is_correct,
              })),
          })
        );

        // Use the existing importQuestions function
        const result = await importQuestions(questionsToImport);

        return result;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to generate random test"
        );
        return { success: 0, failed: 0 };
      } finally {
        setLoading(false);
      }
    },
    [user, importQuestions]
  );

  // Selection handlers
  const toggleQuestionSelection = useCallback((questionId: string) => {
    setSelectedQuestions((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(questionId)) {
        newSet.delete(questionId);
      } else {
        newSet.add(questionId);
      }
      return newSet;
    });
  }, []);

  const selectAllQuestions = useCallback(() => {
    setSelectedQuestions(new Set(questions.map((q) => q.id)));
  }, [questions]);

  const clearSelection = useCallback(() => {
    setSelectedQuestions(new Set());
  }, []);

  const markAsDirty = useCallback(() => {
    setIsDirty(true);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    questions,
    loading,
    saving,
    error,
    selectedQuestions,
    isDirty,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    duplicateQuestion,
    bulkDeleteQuestions,
    importQuestions,
    generateRandomQuestions,
    clearError,
    toggleQuestionSelection,
    selectAllQuestions,
    clearSelection,
    markAsDirty,
  };
}
