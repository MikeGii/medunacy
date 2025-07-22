// src/hooks/useExamSession.ts

"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ExamQuestion,
  ExamSession,
  ExamAnswer,
  ExamSessionState,
} from "@/types/exam";
import { supabase } from "@/lib/supabase";
import { useLocale } from "next-intl";

interface UseExamSessionProps {
  mode: "training" | "exam";
  year: number;
  userId: string;
}

export function useExamSession({ mode, year, userId }: UseExamSessionProps) {
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

  // Initialize session
  const initializeSession = useCallback(async () => {
    try {
      setLoading(true);

      // Fetch questions for the selected year
      const { data: questions, error: questionsError } = await supabase
        .from("exam_questions")
        .select("*")
        .eq("year", year);

      if (questionsError) throw questionsError;
      if (!questions || questions.length === 0) {
        throw new Error("No questions found for this year");
      }

      // Shuffle questions for randomization
      const shuffledQuestions = [...questions].sort(() => Math.random() - 0.5);

      // Create session in database (only for exam mode)
      let sessionId = `temp-${Date.now()}`;

      if (mode === "exam") {
        const { data: session, error: sessionError } = await supabase
          .from("exam_sessions")
          .insert({
            user_id: userId,
            exam_year: year,
            mode: mode,
            total_questions: shuffledQuestions.length,
          })
          .select()
          .single();

        if (sessionError) throw sessionError;
        sessionId = session.id;
        sessionRef.current = session;
      }

      // Initialize session state
      setSessionState({
        session: {
          id: sessionId,
          userId,
          mode,
          examYear: year,
          startedAt: new Date(),
          totalQuestions: shuffledQuestions.length,
        },
        questions: shuffledQuestions,
        currentQuestionIndex: 0,
        answers: {},
        markedForReview: new Set(),
      });
    } catch (err) {
      console.error("Error initializing session:", err);
      setError(
        err instanceof Error ? err.message : "Failed to initialize session"
      );
    } finally {
      setLoading(false);
    }
  }, [mode, year, userId]);

  // Timer management for exam mode
  useEffect(() => {
    if (mode === "exam" && sessionState && !sessionState.session.completedAt) {
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

  // Auto-submit after 90 minutes for exam mode
  useEffect(() => {
    if (mode === "exam" && timeElapsed >= 5400) {
      // 90 minutes = 5400 seconds
      submitExam();
    }
  }, [mode, timeElapsed]);

  // Select answer
  const selectAnswer = useCallback(
    async (questionId: string, optionIndex: number) => {
      if (!sessionState) return;

      setSessionState((prev) => {
        if (!prev) return null;

        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionId]: optionIndex,
          },
        };
      });

      // In training mode, check answer immediately
      if (mode === "training") {
        const question = sessionState.questions.find(
          (q) => q.id === questionId
        );
        if (question) {
          const isCorrect = question.options[optionIndex].isCorrect;
          return { isCorrect };
        }
      }

      return null;
    },
    [sessionState, mode]
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
  const toggleMarkForReview = useCallback((questionId: string) => {
    setSessionState((prev) => {
      if (!prev) return null;

      const newMarked = new Set(prev.markedForReview);
      if (newMarked.has(questionId)) {
        newMarked.delete(questionId);
      } else {
        newMarked.add(questionId);
      }

      return {
        ...prev,
        markedForReview: newMarked,
      };
    });
  }, []);

  // Submit exam
  const submitExam = useCallback(async () => {
    if (!sessionState) return;

    try {
      setLoading(true);

      // Calculate results
      let correctAnswers = 0;
      const questionResults = [];

      for (const question of sessionState.questions) {
        const selectedOption = sessionState.answers[question.id];
        const isCorrect =
          selectedOption !== undefined &&
          question.options[selectedOption]?.isCorrect === true;

        if (isCorrect) correctAnswers++;

        questionResults.push({
          question,
          selectedOption: selectedOption ?? -1,
          isCorrect,
        });

        // Save individual answer to database (for exam mode)
        if (mode === "exam" && sessionRef.current) {
          await supabase.from("exam_answers").insert({
            session_id: sessionRef.current.id,
            question_id: question.id,
            selected_option: selectedOption ?? -1,
            is_correct: isCorrect,
          });
        }
      }

      // Update session in database (for exam mode)
      if (mode === "exam" && sessionRef.current) {
        const { error: updateError } = await supabase
          .from("exam_sessions")
          .update({
            completed_at: new Date().toISOString(),
            correct_answers: correctAnswers,
            time_spent: timeElapsed,
          })
          .eq("id", sessionRef.current.id);

        if (updateError) throw updateError;
      }

      // Navigate to results
      const resultsData = {
        sessionId: sessionState.session.id,
        totalQuestions: sessionState.questions.length,
        correctAnswers,
        incorrectAnswers: sessionState.questions.length - correctAnswers,
        scorePercentage: (correctAnswers / sessionState.questions.length) * 100,
        timeSpent: timeElapsed,
        questionResults,
      };

      // Store results in sessionStorage for viewing
      sessionStorage.setItem("examResults", JSON.stringify(resultsData));

      // Navigate to results page
      router.push(`/${locale}/exam-tests/results/${sessionState.session.id}`);
    } catch (err) {
      console.error("Error submitting exam:", err);
      setError(err instanceof Error ? err.message : "Failed to submit exam");
    } finally {
      setLoading(false);
    }
  }, [sessionState, mode, timeElapsed, router, locale]);

  // Get current question
  const currentQuestion =
    sessionState?.questions[sessionState.currentQuestionIndex];
  const selectedAnswer = currentQuestion
    ? sessionState.answers[currentQuestion.id]
    : undefined;
  const isMarkedForReview = currentQuestion
    ? sessionState.markedForReview.has(currentQuestion.id)
    : false;

  // Calculate progress
  const answeredCount = Object.keys(sessionState?.answers || {}).length;
  const progress = {
    current: sessionState?.currentQuestionIndex ?? 0,
    total: sessionState?.questions.length ?? 0,
    answered: answeredCount,
    markedForReview: sessionState?.markedForReview.size ?? 0,
  };

  // Initialize session on mount
  useEffect(() => {
    initializeSession();

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [initializeSession]);

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
    submitExam,
  };
}
