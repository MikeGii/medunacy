// src/hooks/useQuestionEditor.ts

"use client";

import { useState, useCallback } from "react";
import { TestQuestion, QuestionFormData } from "@/types/exam";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UseQuestionEditorProps {
  testId: string;
  onQuestionSaved?: () => void;
}

interface UseQuestionEditorReturn {
  // State
  questions: TestQuestion[];
  loading: boolean;
  saving: boolean;
  error: string | null;

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
  clearError: () => void;
}

export function useQuestionEditor({
  testId,
  onQuestionSaved,
}: UseQuestionEditorProps): UseQuestionEditorReturn {
  const { user } = useAuth();
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to fetch questions"
      );
    } finally {
      setLoading(false);
    }
  }, [testId]);

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
        const maxOrder = Math.max(0, ...questions.map((q) => q.question_order));

        // Create question
        const { data: newQuestion, error: questionError } = await supabase
          .from("test_questions")
          .insert({
            test_id: testId,
            question_text: data.question_text,
            explanation: data.explanation,
            points: data.points,
            question_order: maxOrder + 1,
          })
          .select()
          .single();

        if (questionError) throw questionError;

        // Create options
        const optionsToInsert = data.options.map((option, index) => ({
          question_id: newQuestion.id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          option_order: index,
        }));

        const { data: newOptions, error: optionsError } = await supabase
          .from("question_options")
          .insert(optionsToInsert)
          .select();

        if (optionsError) throw optionsError;

        const completeQuestion = {
          ...newQuestion,
          options: newOptions || [],
        };

        setQuestions((prev) => [...prev, completeQuestion]);
        onQuestionSaved?.();

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

  // Update existing question
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
        // Update question
        const { data: updatedQuestion, error: questionError } = await supabase
          .from("test_questions")
          .update({
            question_text: data.question_text,
            explanation: data.explanation,
            points: data.points,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .single();

        if (questionError) throw questionError;

        // Delete existing options
        const { error: deleteError } = await supabase
          .from("question_options")
          .delete()
          .eq("question_id", id);

        if (deleteError) throw deleteError;

        // Create new options
        const optionsToInsert = data.options.map((option, index) => ({
          question_id: id,
          option_text: option.option_text,
          is_correct: option.is_correct,
          option_order: index,
        }));

        const { data: newOptions, error: optionsError } = await supabase
          .from("question_options")
          .insert(optionsToInsert)
          .select();

        if (optionsError) throw optionsError;

        const completeQuestion = {
          ...updatedQuestion,
          options: newOptions || [],
        };

        setQuestions((prev) =>
          prev.map((q) => (q.id === id ? completeQuestion : q))
        );
        onQuestionSaved?.();

        return completeQuestion;
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

        setQuestions((prev) => prev.filter((q) => q.id !== id));
        onQuestionSaved?.();

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

  // Reorder questions
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

        const oldOrder = currentQuestion.question_order;
        const questionsToUpdate = [];

        // Determine which questions need their order updated
        if (newOrder > oldOrder) {
          // Moving down
          questionsToUpdate.push(
            ...questions.filter(
              (q) => q.question_order > oldOrder && q.question_order <= newOrder
            )
          );
          questionsToUpdate.forEach((q) => {
            q.question_order--;
          });
        } else {
          // Moving up
          questionsToUpdate.push(
            ...questions.filter(
              (q) => q.question_order >= newOrder && q.question_order < oldOrder
            )
          );
          questionsToUpdate.forEach((q) => {
            q.question_order++;
          });
        }

        // Update the moved question
        currentQuestion.question_order = newOrder;
        questionsToUpdate.push(currentQuestion);

        // Batch update in database
        const updates = questionsToUpdate.map((q) =>
          supabase
            .from("test_questions")
            .update({ question_order: q.question_order })
            .eq("id", q.id)
        );

        await Promise.all(updates);

        // Update local state
        setQuestions((prev) =>
          [...prev].sort((a, b) => a.question_order - b.question_order)
        );

        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to reorder questions"
        );
        return false;
      } finally {
        setSaving(false);
      }
    },
    [user, questions]
  );

  // Duplicate a question
  const duplicateQuestion = useCallback(
    async (questionId: string): Promise<TestQuestion | null> => {
      const originalQuestion = questions.find((q) => q.id === questionId);
      if (!originalQuestion) {
        setError("Question not found");
        return null;
      }

      const formData: QuestionFormData = {
        question_text: `${originalQuestion.question_text} (Copy)`,
        explanation: originalQuestion.explanation,
        points: originalQuestion.points,
        options: originalQuestion.options.map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      };

      return createQuestion(formData);
    },
    [questions, createQuestion]
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

        setQuestions((prev) => prev.filter((q) => !questionIds.includes(q.id)));
        onQuestionSaved?.();

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

  // Import multiple questions
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

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    questions,
    loading,
    saving,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    reorderQuestions,
    duplicateQuestion,
    bulkDeleteQuestions,
    importQuestions,
    clearError,
  };
}
