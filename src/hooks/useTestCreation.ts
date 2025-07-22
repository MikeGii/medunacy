// src/hooks/useTestCreation.ts

"use client";

import { useState, useCallback } from "react";
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

  // Actions
  createTest: (data: TestCreate) => Promise<Test | null>;
  updateTest: (id: string, data: TestUpdate) => Promise<boolean>;
  deleteTest: (id: string) => Promise<boolean>;
  duplicateTest: (testId: string) => Promise<Test | null>;
  validateTest: (testId: string) => Promise<ValidationResult>;
  publishTest: (testId: string) => Promise<boolean>;
  unpublishTest: (testId: string) => Promise<boolean>;
  clearError: () => void;
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
  } = useExam();

  const [isCreating, setIsCreating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
        setError(err instanceof Error ? err.message : "Failed to create test");
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
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to update test");
        return false;
      } finally {
        setIsSaving(false);
      }
    },
    [user, updateTestInContext]
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
        setError(err instanceof Error ? err.message : "Failed to delete test");
        return false;
      } finally {
        setIsDeleting(false);
      }
    },
    [user, deleteTestInContext]
  );

  // Duplicate a test with all questions
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
        if (!originalTest) throw new Error("Test not found");

        // Create the duplicated test
        const { data: newTest, error: createError } = await supabase
          .from("tests")
          .insert({
            title: `${originalTest.title} (Copy)`,
            description: originalTest.description,
            category_id: originalTest.category_id,
            created_by: user.id,
            is_published: false,
            time_limit: originalTest.time_limit,
            passing_score: originalTest.passing_score,
            allow_multiple_attempts: originalTest.allow_multiple_attempts,
            show_correct_answers_in_training:
              originalTest.show_correct_answers_in_training,
          })
          .select()
          .single();

        if (createError) throw createError;

        // Duplicate questions and options
        for (const question of originalTest.questions || []) {
          const { data: newQuestion, error: questionError } = await supabase
            .from("test_questions")
            .insert({
              test_id: newTest.id,
              question_text: question.question_text,
              explanation: question.explanation,
              question_order: question.question_order,
              points: question.points,
            })
            .select()
            .single();

          if (questionError) throw questionError;

          // Duplicate options
          const optionsToInsert = question.options.map((option: any) => ({
            question_id: newQuestion.id,
            option_text: option.option_text,
            is_correct: option.is_correct,
            option_order: option.option_order,
          }));

          const { error: optionsError } = await supabase
            .from("question_options")
            .insert(optionsToInsert);

          if (optionsError) throw optionsError;
        }

        return newTest;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to duplicate test"
        );
        return null;
      } finally {
        setIsCreating(false);
      }
    },
    [user]
  );

  // Validate test before publishing
  const validateTest = useCallback(
    async (testId: string): Promise<ValidationResult> => {
      const errors: string[] = [];
      const warnings: string[] = [];

      try {
        const { data: test, error } = await supabase
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

        if (error) throw error;
        if (!test) {
          errors.push("Test not found");
          return { isValid: false, errors, warnings };
        }

        // Validation rules
        if (!test.questions || test.questions.length === 0) {
          errors.push("Test must have at least one question");
        }

        test.questions?.forEach((question: TestQuestion, index: number) => {
          if (!question.options || question.options.length < 2) {
            errors.push(`Question ${index + 1} must have at least 2 options`);
          }

          const correctOptions = question.options?.filter(
            (opt: QuestionOption) => opt.is_correct
          );
          if (!correctOptions || correctOptions.length === 0) {
            errors.push(
              `Question ${index + 1} must have at least one correct answer`
            );
          }

          if (question.points < 1) {
            warnings.push(`Question ${index + 1} has 0 points`);
          }
        });

        if (test.time_limit && test.time_limit < 5) {
          warnings.push("Time limit is very short (less than 5 minutes)");
        }

        if (test.passing_score < 50) {
          warnings.push("Passing score is below 50%");
        }

        return {
          isValid: errors.length === 0,
          errors,
          warnings,
        };
      } catch (err) {
        errors.push(
          err instanceof Error ? err.message : "Failed to validate test"
        );
        return { isValid: false, errors, warnings };
      }
    },
    []
  );

  // Publish test (with validation)
  const publishTest = useCallback(
    async (testId: string): Promise<boolean> => {
      const validation = await validateTest(testId);

      if (!validation.isValid) {
        setError(validation.errors.join(", "));
        return false;
      }

      if (validation.warnings.length > 0) {
        const proceed = confirm(
          `Warning:\n${validation.warnings.join(
            "\n"
          )}\n\nDo you want to publish anyway?`
        );
        if (!proceed) return false;
      }

      try {
        await publishTestInContext(testId);
        return true;
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to publish test");
        return false;
      }
    },
    [validateTest, publishTestInContext]
  );

  // Unpublish test
  const unpublishTest = useCallback(
    async (testId: string): Promise<boolean> => {
      try {
        await unpublishTestInContext(testId);
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to unpublish test"
        );
        return false;
      }
    },
    [unpublishTestInContext]
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    isCreating,
    isSaving,
    isDeleting,
    error,
    createTest,
    updateTest,
    deleteTest,
    duplicateTest,
    validateTest,
    publishTest,
    unpublishTest,
    clearError,
  };
}
