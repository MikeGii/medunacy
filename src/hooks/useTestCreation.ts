// src/hooks/useTestCreation.ts - ENHANCED VERSION (without toast)

"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { useExam } from "@/contexts/ExamContext";
import { useAuth } from "@/contexts/AuthContext";
import {
  Test,
  TestCreate,
  TestUpdate,
  TestQuestion,
  QuestionOption,
} from "@/types/exam";
import { supabase } from "@/lib/supabase";

interface UseTestCreationReturn {
  // State
  isCreating: boolean;
  isSaving: boolean;
  isDeleting: boolean;
  error: string | null;
  isDirty: boolean;
  lastSaved: Date | null;

  // Actions
  createTest: (data: TestCreate) => Promise<Test | null>;
  updateTest: (id: string, data: TestUpdate) => Promise<boolean>;
  deleteTest: (id: string) => Promise<boolean>;
  duplicateTest: (testId: string) => Promise<Test | null>;
  validateTest: (testId: string) => Promise<ValidationResult>;
  publishTest: (testId: string) => Promise<boolean>;
  unpublishTest: (testId: string) => Promise<boolean>;
  clearError: () => void;

  // Auto-save
  enableAutoSave: (testId: string, data: TestUpdate) => void;
  disableAutoSave: () => void;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function useTestCreation(): UseTestCreationReturn {
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const {
    createTest: createTestInContext,
    updateTest: updateTestInContext,
    deleteTest: deleteTestInContext,
    publishTest: publishTestInContext,
    unpublishTest: unpublishTestInContext,
    subscribeToTestUpdates,
    notifyTestEdit,
  } = useExam();

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
  const autoSaveDataRef = useRef<{ testId: string; data: TestUpdate } | null>(
    null
  );

  // Auto-save functionality
  const enableAutoSave = useCallback(
    (testId: string, data: TestUpdate) => {
      autoSaveDataRef.current = { testId, data };
      setIsDirty(true);

      // Clear existing timer
      if (autoSaveTimerRef.current) {
        clearTimeout(autoSaveTimerRef.current);
      }

      // Set new timer for auto-save (2 seconds delay)
      autoSaveTimerRef.current = setTimeout(async () => {
        if (autoSaveDataRef.current) {
          const { testId, data } = autoSaveDataRef.current;
          try {
            await updateTestInContext(testId, data);
            setLastSaved(new Date());
            setIsDirty(false);
          } catch (err) {
            console.error("Auto-save failed:", err);
          }
        }
      }, 2000);
    },
    [updateTestInContext]
  );

  const disableAutoSave = useCallback(() => {
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
      autoSaveTimerRef.current = null;
    }
    autoSaveDataRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      disableAutoSave();
    };
  }, [disableAutoSave]);

  // Create a new test
  const createTest = useCallback(
    async (data: TestCreate): Promise<Test | null> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to create tests");
        return null;
      }

      setIsCreating(true);
      setError(null);

      try {
        const newTest = await createTestInContext(data);
        if (newTest) {
          // Navigate to question management after creation
          router.push(`/${locale}/exam-tests/create/${newTest.id}/questions`);
        }
        return newTest;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to create test";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user, createTestInContext, router, locale]
  );

  // Update existing test
  const updateTest = useCallback(
    async (id: string, data: TestUpdate): Promise<boolean> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to update tests");
        return false;
      }

      setIsSaving(true);
      setError(null);

      try {
        await updateTestInContext(id, data);
        setLastSaved(new Date());
        setIsDirty(false);

        // Notify other users about the edit
        notifyTestEdit(id, user.id);

        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to update test";
        setError(errorMessage);
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, updateTestInContext, notifyTestEdit]
  );

  // Delete test
  const deleteTest = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to delete tests");
        return false;
      }

      setIsDeleting(true);
      setError(null);

      try {
        await deleteTestInContext(id);
        return true;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to delete test";
        setError(errorMessage);
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [user, deleteTestInContext]
  );

  // Duplicate test with questions
  const duplicateTest = useCallback(
    async (testId: string): Promise<Test | null> => {
      if (!user || !["admin", "doctor"].includes(user.role || "")) {
        setError("Unauthorized to duplicate tests");
        return null;
      }

      setIsCreating(true);
      setError(null);

      try {
        // Fetch the original test with questions
        const { data: originalTest, error: fetchError } = await supabase
          .from("tests")
          .select(
            `
            *,
            questions:test_questions(
              *,
              options:question_options(*)
            )
          `
          )
          .eq("id", testId)
          .single();

        if (fetchError) throw fetchError;

        // Create the duplicate test
        const duplicateData: TestCreate = {
          title: `${originalTest.title} (Copy)`,
          description: originalTest.description,
          category_id: originalTest.category_id,
          time_limit: originalTest.time_limit,
          passing_score: originalTest.passing_score,
          allow_multiple_attempts: originalTest.allow_multiple_attempts,
          show_correct_answers_in_training:
            originalTest.show_correct_answers_in_training,
        };

        const newTest = await createTestInContext(duplicateData);
        if (!newTest) throw new Error("Failed to create duplicate test");

        // Duplicate questions
        for (const question of originalTest.questions) {
          const { data: newQuestion, error: questionError } = await supabase
            .from("test_questions")
            .insert([
              {
                test_id: newTest.id,
                question_text: question.question_text,
                explanation: question.explanation,
                points: question.points,
                question_order: question.question_order,
              },
            ])
            .select()
            .single();

          if (questionError) throw questionError;

          // Duplicate options
          const optionsToInsert = question.options.map(
            (option: QuestionOption) => ({
              question_id: newQuestion.id,
              option_text: option.option_text,
              is_correct: option.is_correct,
              option_order: option.option_order,
            })
          );

          const { error: optionsError } = await supabase
            .from("question_options")
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        return newTest;
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to duplicate test";
        setError(errorMessage);
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user, createTestInContext]
  );

  // Validate test before publishing
  const validateTest = useCallback(
    async (testId: string): Promise<ValidationResult> => {
      const errors: string[] = [];
      const warnings: string[] = [];

      try {
        // Fetch test with questions
        const { data: test, error: fetchError } = await supabase
          .from("tests")
          .select(
            `
            *,
            questions:test_questions(
              *,
              options:question_options(*)
            )
          `
          )
          .eq("id", testId)
          .single();

        if (fetchError) throw fetchError;

        // Validation rules
        if (!test.title || test.title.trim().length === 0) {
          errors.push("Test must have a title");
        }

        if (!test.category_id) {
          errors.push("Test must be assigned to a category");
        }

        if (!test.questions || test.questions.length === 0) {
          errors.push("Test must have at least one question");
        } else {
          // Validate each question
          test.questions.forEach((question: TestQuestion, index: number) => {
            if (
              !question.question_text ||
              question.question_text.trim().length === 0
            ) {
              errors.push(`Question ${index + 1} is missing text`);
            }

            if (!question.options || question.options.length < 2) {
              errors.push(`Question ${index + 1} must have at least 2 options`);
            }

            const correctOptions = question.options.filter(
              (opt: QuestionOption) => opt.is_correct
            );
            if (correctOptions.length === 0) {
              errors.push(
                `Question ${index + 1} must have at least one correct answer`
              );
            }

            if (question.points <= 0) {
              warnings.push(`Question ${index + 1} has no points assigned`);
            }
          });
        }

        if (
          !test.passing_score ||
          test.passing_score < 0 ||
          test.passing_score > 100
        ) {
          errors.push("Passing score must be between 0 and 100");
        }

        if (test.time_limit && test.time_limit < 1) {
          warnings.push("Time limit is very short");
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      } catch (err) {
        return {
          isValid: false,
          errors: ["Failed to validate test"],
          warnings: [],
        };
      }
    },
    []
  );

  // Publish test
  const publishTest = useCallback(
    async (id: string): Promise<boolean> => {
      // Validate before publishing
      const validation = await validateTest(id);
      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return false;
      }

      return updateTest(id, { is_published: true });
    },
    [validateTest, updateTest]
  );

  // Unpublish test
  const unpublishTest = useCallback(
    async (id: string): Promise<boolean> => {
      return updateTest(id, { is_published: false });
    },
    [updateTest]
  );

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isCreating,
    isSaving,
    isDeleting,
    error,
    isDirty,
    lastSaved,
    createTest,
    updateTest,
    deleteTest,
    duplicateTest,
    validateTest,
    publishTest,
    unpublishTest,
    clearError,
    enableAutoSave,
    disableAutoSave,
  };
}
