// src/hooks/useExamSession.ts - FIXED ORDER

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { TestQuestion, ExamSession, ExamSessionState } from "@/types/exam";
import { supabase } from "@/lib/supabase";
import { useLocale } from "next-intl";

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

  // Keep refs synchronized with state
  useEffect(() => {
    sessionStateRef.current = sessionState;
  }, [sessionState]);

  useEffect(() => {
    timeElapsedRef.current = timeElapsed;
  }, [timeElapsed]);

  // DECLARE submitExam FIRST using useCallback
  const submitExam = useCallback(async () => {
    // Prevent double submission
    if (
      isSubmittingRef.current ||
      !sessionStateRef.current ||
      !sessionRef.current
    )
      return;

    isSubmittingRef.current = true;
    const currentSessionState = sessionStateRef.current;
    const currentTimeElapsed = timeElapsedRef.current;

    try {
      setLoading(true);

      // Calculate results
      let correctAnswers = 0;
      let totalPoints = 0;
      let earnedPoints = 0;
      const questionResults = [];

      // Save all answers and calculate results
      for (const question of currentSessionState.questions) {
        const selectedOptionIds =
          currentSessionState.answers[question.id] || [];
        const correctOptionIds = question.options
          .filter((option) => option.is_correct)
          .map((option) => option.id);

        // Check if answer is correct (all correct options selected, no incorrect ones)
        const isCorrect =
          selectedOptionIds.length === correctOptionIds.length &&
          selectedOptionIds.every((id) => correctOptionIds.includes(id));

        if (isCorrect) {
          correctAnswers++;
          earnedPoints += question.points;
        }

        totalPoints += question.points;

        questionResults.push({
          question,
          selectedOptions: question.options.filter((opt) =>
            selectedOptionIds.includes(opt.id)
          ),
          correctOptions: question.options.filter((opt) => opt.is_correct),
          isCorrect,
          pointsEarned: isCorrect ? question.points : 0,
        });

        // Save individual answer to database using Supabase
        if (selectedOptionIds.length > 0) {
          await supabase.from("exam_answers").upsert({
            session_id: sessionRef.current.id,
            question_id: question.id,
            selected_option_ids: selectedOptionIds,
            is_correct: isCorrect,
            points_earned: isCorrect ? question.points : 0,
          });
        }
      }

      const scorePercentage =
        totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;
      const passed =
        scorePercentage >= (currentSessionState.test.passing_score || 70);

      // Update session in database using Supabase
      await supabase
        .from("exam_sessions")
        .update({
          completed_at: new Date().toISOString(),
          score_percentage: scorePercentage,
          correct_answers: correctAnswers,
          total_questions: currentSessionState.questions.length,
          time_spent: currentTimeElapsed,
          passed,
        })
        .eq("id", sessionRef.current.id);

      // Clear timer before navigation
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }

      // Navigate to results
      const resultsData = {
        sessionId: currentSessionState.session.id,
        test: currentSessionState.test,
        totalQuestions: currentSessionState.questions.length,
        correctAnswers,
        incorrectAnswers: currentSessionState.questions.length - correctAnswers,
        scorePercentage,
        timeSpent: currentTimeElapsed,
        passed,
        questionResults,
      };

      // Store results in sessionStorage for viewing
      sessionStorage.setItem("examResults", JSON.stringify(resultsData));

      // Navigate to results page
      router.push(
        `/${locale}/exam-tests/results/${currentSessionState.session.id}`
      );
    } catch (err) {
      console.error("Error submitting exam:", err);
      setError(err instanceof Error ? err.message : "Failed to submit exam");
      isSubmittingRef.current = false; // Reset flag on error
    } finally {
      setLoading(false);
    }
  }, [router, locale]); // Remove sessionState and timeElapsed from dependencies

  // Initialize session
  const initializeSession = useCallback(async () => {
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

      setSessionState(newSessionState);
    } catch (err) {
      console.error("Error initializing session:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize session"
      );
    } finally {
      setLoading(false);
    }
  }, [mode, testId, userId]);

  // Initialize on mount
  useEffect(() => {
    if (userId) {
      initializeSession();
    }
  }, [initializeSession, userId]);

  // Timer management
  useEffect(() => {
    if (mode === "exam" && sessionState && !sessionState.session.completed_at) {
      timerRef.current = setInterval(() => {
        setTimeElapsed((prev) => prev + 1);
      }, 1000);

      return () => {
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
      };
    }
  }, [mode, sessionState]);

  // Auto-submit when time limit is reached - NOW submitExam is available
  useEffect(() => {
    if (mode === "exam" && sessionState?.test.time_limit) {
      const timeLimit = sessionState.test.time_limit * 60; // convert minutes to seconds
      if (timeElapsed >= timeLimit) {
        submitExam();
      }
    }
  }, [mode, timeElapsed, sessionState, submitExam]);

  // Select answer(s) - supports multiple selections
  const selectAnswer = useCallback(
    (optionId: string) => {
      if (!sessionState) return;

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
    [sessionState]
  );

  // Navigate between questions
  const goToQuestion = useCallback(
    (index: number) => {
      if (!sessionState) return;

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
    [sessionState]
  );

  const goToNext = useCallback(() => {
    if (!sessionState) return;
    goToQuestion(sessionState.currentQuestionIndex + 1);
  }, [sessionState, goToQuestion]);

  const goToPrevious = useCallback(() => {
    if (!sessionState) return;
    goToQuestion(sessionState.currentQuestionIndex - 1);
  }, [sessionState, goToQuestion]);

  // Mark for review
  const toggleMarkForReview = useCallback(() => {
    if (!sessionState) return;

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
  }, [sessionState]);

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
    selectedAnswer, // Array of option IDs
    isMarkedForReview,
    progress,
    timeElapsed,
    selectAnswer,
    goToNext,
    goToPrevious,
    goToQuestion,
    toggleMarkForReview,
    submitExam,
  };
}
