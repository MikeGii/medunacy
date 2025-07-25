// src/hooks/useExamSession.ts - FIXED ORDER WITH MEMORY LEAK PREVENTION
"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TestQuestion, ExamSession, ExamSessionState } from "@/types/exam";
import { supabase } from "@/lib/supabase";
import { useLocale } from "next-intl";
import { useSubmissionGuard } from "@/hooks/useSubmissionGuard";
import { useCleanup } from "@/hooks/useCleanup";

interface UseExamSessionProps {
  mode: "training" | "exam";
  testId: string;
  userId: string;
}

export function useExamSession({ mode, testId, userId }: UseExamSessionProps) {
  const router = useRouter();
  const locale = useLocale();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sessionState, setSessionState] = useState<ExamSessionState | null>(
    null
  );
  const [timeElapsed, setTimeElapsed] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sessionRef = useRef<ExamSession | null>(null);

  // Add new refs to prevent circular dependencies
  const sessionStateRef = useRef<ExamSessionState | null>(null);
  const timeElapsedRef = useRef<number>(0);
  const isSubmittingRef = useRef<boolean>(false);

  const { addCleanup, isMounted } = useCleanup();

  const { guardedSubmit, isSubmitting } = useSubmissionGuard({
    cooldownMs: 2000, // 2 second cooldown for exam submission
  });

  // Keep refs synchronized with state
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  const submitExam = useCallback(async () => {
    // Check if component is still mounted
    if (!isMounted()) {
      console.warn("Component unmounted, cancelling submission");
      return;
    }

    // Prevent double submission
    if (
      isSubmittingRef.current ||
      !sessionStateRef.current ||
      !sessionRef.current
    ) {
      console.warn("Cannot submit: already submitting or missing session data");
      return;
    }

    // Set submitting flag immediately
    isSubmittingRef.current = true;

    // Capture current state to avoid race conditions
    const currentSessionState = sessionStateRef.current;
    const currentSession = sessionRef.current;
    const currentTimeElapsed = timeElapsedRef.current;

    try {
      setLoading(true);
      setError(null);

      // Clear timer immediately to prevent further updates
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Calculate results
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      const answersToSave = [];
      const questionResults = [];

      // Process all questions
      for (const question of currentSessionState.questions) {
        const selectedOptionIds =
          currentSessionState.answers[question.id] || [];
        const correctOptionIds = question.options
          .filter((option) => option.is_correct)
          .map((option) => option.id);

        // Check if answer is correct
        const isCorrect =
          selectedOptionIds.length > 0 &&
          selectedOptionIds.length === correctOptionIds.length &&
          selectedOptionIds.every((id) => correctOptionIds.includes(id)) &&
          correctOptionIds.every((id) => selectedOptionIds.includes(id));

        if (isCorrect) {
          correctAnswers++;
          earnedPoints += question.points;
        }

        totalPoints += question.points;

        // Prepare answer for batch insert
        answersToSave.push({
          session_id: currentSession.id,
          question_id: question.id,
          selected_option_ids: selectedOptionIds,
          is_correct: isCorrect,
          points_earned: isCorrect ? question.points : 0,
        });

        // Prepare result for display
        questionResults.push({
          question,
          selectedOptions: question.options.filter((opt) =>
            selectedOptionIds.includes(opt.id)
          ),
          correctOptions: question.options.filter((opt) => opt.is_correct),
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        });
      }

      // Calculate final scores
      const scorePercentage =
        totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed =
        scorePercentage >= (currentSessionState.test.passing_score || 70);

      // Check if still mounted before API calls
      if (!isMounted()) {
        console.warn("Component unmounted before submission");
        return;
      }

      // Save all answers in one batch (more efficient)
      if (answersToSave.length > 0) {
        const { error: answersError } = await supabase
          .from("exam_answers")
          .insert(answersToSave);

        if (answersError) {
          throw new Error(`Failed to save answers: ${answersError.message}`);
        }
      }

      // Check if still mounted
      if (!isMounted()) {
        console.warn("Component unmounted during submission");
        return;
      }

      // Update session with results
      const { error: updateError } = await supabase
        .from("exam_sessions")
        .update({
          completed_at: new Date().toISOString(),
          score_percentage: scorePercentage,
          correct_answers: correctAnswers,
          total_questions: currentSessionState.questions.length,
          time_spent: currentTimeElapsed,
          passed,
        })
        .eq("id", currentSession.id);

      if (updateError) {
        throw new Error(`Failed to update session: ${updateError.message}`);
      }

      // Check if still mounted before navigation
      if (!isMounted()) {
        console.warn("Component unmounted after submission");
        return;
      }

      // Prepare results data for viewing
      const resultsData = {
        sessionId: currentSession.id,
        test: currentSessionState.test,
        totalQuestions: currentSessionState.questions.length,
        correctAnswers,
        incorrectAnswers: currentSessionState.questions.length - correctAnswers,
        scorePercentage,
        timeSpent: currentTimeElapsed,
        passed,
        questionResults,
      };

      // Store results temporarily for immediate viewing
      sessionStorage.setItem("examResults", JSON.stringify(resultsData));

      // Navigate to results page
      router.push(`/${locale}/exam-tests/results/${currentSession.id}`);
    } catch (err) {
      console.error("Error submitting exam:", err);

      // Only update state if still mounted
      if (isMounted()) {
        setError(err instanceof Error ? err.message : "Failed to submit exam");

        // Reset submission flag on error to allow retry
        isSubmittingRef.current = false;

        // Restart timer if submission failed and still mounted
        if (mode === "exam" && !timerRef.current && isMounted()) {
          timerRef.current = setInterval(() => {
            if (isMounted()) {
              timeElapsedRef.current += 1;
              setTimeElapsed((prev) => prev + 1);
            }
          }, 1000);

          // Add cleanup for the restarted timer
          addCleanup(() => {
            if (timerRef.current) {
              clearInterval(timerRef.current);
            }
          });
        }
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [router, locale, mode, isMounted, addCleanup]);

  // Initialize session
  const initializeSession = useCallback(async () => {
    if (!isMounted()) return;

    try {
      setLoading(true);

      // Fetch test with questions and options using Supabase
      const { data: test, error: testError } = await supabase
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
        .eq("is_published", true)
        .single();

      if (!isMounted()) return;

      if (testError) throw testError;
      if (!test) throw new Error("Test not found");

      const questions: TestQuestion[] = test.questions || [];

      if (questions.length === 0) {
        throw new Error("No questions found for this test");
      }

      // Sort questions and options by order
      const sortedQuestions = questions
        .sort((a, b) => a.question_order - b.question_order)
        .map((question) => ({
          ...question,
          options: question.options.sort(
            (a, b) => a.option_order - b.option_order
          ),
        }));

      // Check if still mounted before creating session
      if (!isMounted()) return;

      // Create session in database using Supabase
      const { data: session, error: sessionError } = await supabase
        .from("exam_sessions")
        .insert({
          user_id: userId,
          test_id: testId,
          mode: mode,
          total_questions: questions.length,
        })
        .select()
        .single();

      if (!isMounted()) return;

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Failed to create session");

      sessionRef.current = session;

      // Initialize session state
      const newSessionState: ExamSessionState = {
        session,
        test,
        questions: sortedQuestions,
        currentQuestionIndex: 0,
        answers: {},
        markedForReview: new Set<string>(),
      };

      if (isMounted()) {
        setSessionState(newSessionState);
      }
    } catch (err) {
      console.error("Error initializing session:", err);
      if (isMounted()) {
        setError(
          err instanceof Error ? err.message : "Failed to initialize session"
        );
      }
    } finally {
      if (isMounted()) {
        setLoading(false);
      }
    }
  }, [mode, testId, userId, isMounted]);

  // Initialize on mount
  useEffect(() => {
    if (userId) {
      initializeSession();
    }
  }, [initializeSession, userId]);

  // Timer management with cleanup
  useEffect(() => {
    if (mode === "exam" && sessionState && !sessionState.session.completed_at) {
      const timer = setInterval(() => {
        if (isMounted()) {
          setTimeElapsed((prev) => prev + 1);
        }
      }, 1000);

      timerRef.current = timer;

      // Add cleanup function
      addCleanup(() => {
        clearInterval(timer);
      });

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [mode, sessionState, isMounted, addCleanup]);

  // Auto-submit when time limit is reached
  useEffect(() => {
    if (mode === "exam" && sessionState?.test.time_limit) {
      const timeLimit = sessionState.test.time_limit * 60; // convert minutes to seconds
      if (timeElapsed >= timeLimit && isMounted()) {
        submitExam();
      }
    }
  }, [mode, timeElapsed, sessionState, submitExam, isMounted]);

  // Select answer(s) - supports multiple selections
  const selectAnswer = useCallback(
    (optionId: string) => {
      if (!sessionState || !isMounted()) return;

      const currentQuestion =
        sessionState.questions[sessionState.currentQuestionIndex];
      if (!currentQuestion) return;

      // Check if question allows multiple correct answers
      const correctOptions = currentQuestion.options.filter(
        (opt) => opt.is_correct
      );
      const allowMultiple = correctOptions.length > 1;

      setSessionState((prev) => {
        if (!prev) return null;

        const questionId = currentQuestion.id;
        const currentAnswers = prev.answers[questionId] || [];
        let newAnswers: string[];

        if (allowMultiple) {
          // Toggle selection for multiple choice
          if (currentAnswers.includes(optionId)) {
            newAnswers = currentAnswers.filter((id) => id !== optionId);
          } else {
            newAnswers = [...currentAnswers, optionId];
          }
        } else {
          // Single selection
          newAnswers = [optionId];
        }

        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: newAnswers,
          },
        };
      });
    },
    [sessionState, isMounted]
  );

  // Navigate between questions
  const goToQuestion = useCallback(
    (index: number) => {
      if (!sessionState || !isMounted()) return;

      if (index >= 0 && index < sessionState.questions.length) {
        setSessionState((prev) => {
          if (!prev) return null;
          return {
            ...prev,
            currentQuestionIndex: index,
          };
        });
      }
    },
    [sessionState, isMounted]
  );

  const goToNext = useCallback(() => {
    if (!sessionState || !isMounted()) return;
    goToQuestion(sessionState.currentQuestionIndex + 1);
  }, [sessionState, goToQuestion, isMounted]);

  const goToPrevious = useCallback(() => {
    if (!sessionState || !isMounted()) return;
    goToQuestion(sessionState.currentQuestionIndex - 1);
  }, [sessionState, goToQuestion, isMounted]);

  // Mark for review
  const toggleMarkForReview = useCallback(() => {
    if (!sessionState || !isMounted()) return;

    const currentQuestion =
      sessionState.questions[sessionState.currentQuestionIndex];
    if (!currentQuestion) return;

    setSessionState((prev) => {
      if (!prev) return null;

      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(currentQuestion.id)) {
        newMarked.delete(currentQuestion.id);
      } else {
        newMarked.add(currentQuestion.id);
      }

      return {
        ...prev,
        markedForReview: newMarked,
      };
    });
  }, [sessionState, isMounted]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Clear timer if exists
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  // Helper computed values
  const currentQuestion =
    sessionState?.questions[sessionState.currentQuestionIndex] || null;

  const selectedAnswer = currentQuestion
    ? sessionState?.answers[currentQuestion.id] || []
    : [];

  const isMarkedForReview = currentQuestion
    ? sessionState?.markedForReview.has(currentQuestion.id) || false
    : false;

  // Calculate progress with overlapping marked & answered questions
  const progress = sessionState
    ? (() => {
        const answeredQuestions = Object.keys(sessionState.answers);
        const markedQuestions = Array.from(sessionState.markedForReview);

        // Count questions that are both answered AND marked
        const markedAndAnswered = markedQuestions.filter((questionId) =>
          answeredQuestions.includes(questionId)
        ).length;

        return {
          current: sessionState.currentQuestionIndex,
          total: sessionState.questions.length,
          answered: answeredQuestions.length,
          markedForReview: markedQuestions.length,
          markedAndAnswered: markedAndAnswered,
        };
      })()
    : {
        current: 0,
        total: 0,
        answered: 0,
        markedForReview: 0,
        markedAndAnswered: 0,
      };

  return {
    loading,
    error,
    sessionState,
    currentQuestion,
    selectedAnswer,
    isMarkedForReview,
    progress,
    timeElapsed,
    selectAnswer,
    goToNext,
    goToPrevious,
    goToQuestion,
    toggleMarkForReview,
    submitExam: guardedSubmit(submitExam),
    isSubmitting,
  };
}
