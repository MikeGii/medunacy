// src/hooks/useExamResults.ts

"use client";

import { useState, useEffect, useCallback } from "react";
import { ExamResults, ExamSession } from "@/types/exam";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UseExamResultsProps {
  sessionId?: string;
  userId?: string;
  testId?: string;
}

interface UseExamResultsReturn {
  results: ExamResults | null;
  sessions: ExamSession[];
  loading: boolean;
  error: string | null;
  fetchResults: (sessionId: string) => Promise<void>;
  fetchUserSessions: () => Promise<void>;
  deleteSession: (sessionId: string) => Promise<boolean>;
  exportResults: (sessionId: string, format: "pdf" | "csv") => Promise<void>;
}

export function useExamResults({
  sessionId,
  userId,
  testId,
}: UseExamResultsProps = {}): UseExamResultsReturn {
  const { user } = useAuth();
  const [results, setResults] = useState<ExamResults | null>(null);
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch specific session results
  const fetchResults = useCallback(async (sessionId: string) => {
    setLoading(true);
    setError(null);

    try {
      // First try to get from sessionStorage (for immediate viewing after exam)
      const cachedResults = sessionStorage.getItem("examResults");
      if (cachedResults) {
        const parsed = JSON.parse(cachedResults);
        if (parsed.sessionId === sessionId) {
          setResults(parsed);
          sessionStorage.removeItem("examResults");
          setLoading(false);
          return;
        }
      }

      // Otherwise fetch from database
      const { data: session, error: sessionError } = await supabase
        .from("exam_sessions")
        .select(
          `
          *,
          test:tests(
            *,
            category:test_categories(*)
          ),
          answers:exam_answers(
            *,
            question:test_questions(
              *,
              options:question_options(*)
            )
          )
        `
        )
        .eq("id", sessionId)
        .single();

      if (sessionError) throw sessionError;
      if (!session) throw new Error("Session not found");

      // Transform to ExamResults format
      const questionResults = session.answers.map((answer: any) => {
        const question = answer.question;
        const selectedOptions = question.options.filter((opt: any) =>
          answer.selected_option_ids.includes(opt.id)
        );
        const correctOptions = question.options.filter(
          (opt: any) => opt.is_correct
        );

        return {
          question,
          selectedOptions,
          correctOptions,
          isCorrect: answer.is_correct,
          pointsEarned: answer.points_earned,
        };
      });

      const examResults: ExamResults = {
        sessionId: session.id,
        test: session.test,
        totalQuestions: session.total_questions || 0,
        correctAnswers: session.correct_answers || 0,
        incorrectAnswers:
          (session.total_questions || 0) - (session.correct_answers || 0),
        scorePercentage: session.score_percentage || 0,
        timeSpent: session.time_spent || 0,
        passed: session.passed || false,
        questionResults,
      };

      setResults(examResults);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch results");
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch user's exam sessions
  const fetchUserSessions = useCallback(async () => {
    const targetUserId = userId || user?.id;
    if (!targetUserId) return;

    setLoading(true);
    setError(null);

    try {
      let query = supabase
        .from("exam_sessions")
        .select(
          `
        *,
        test:tests!exam_sessions_test_id_fkey(
          id,
          title,
          category:test_categories!tests_category_id_fkey(
            id,
            name
          )
        )
      `
        )
        .eq("user_id", targetUserId)
        .not("completed_at", "is", null) // Only show completed sessions
        .order("completed_at", { ascending: false });

      if (testId) {
        query = query.eq("test_id", testId);
      }

      const { data, error: fetchError } = await query;

      if (fetchError) throw fetchError;
      setSessions(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch sessions");
    } finally {
      setLoading(false);
    }
  }, [userId, user, testId]);

  // Delete a session
  const deleteSession = useCallback(
    async (sessionId: string): Promise<boolean> => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) {
        setError("Unauthorized");
        return false;
      }

      try {
        const { error: deleteError } = await supabase
          .from("exam_sessions")
          .delete()
          .eq("id", sessionId)
          .eq("user_id", targetUserId);

        if (deleteError) throw deleteError;

        setSessions((prev) => prev.filter((s) => s.id !== sessionId));
        return true;
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to delete session"
        );
        return false;
      }
    },
    [userId, user]
  );

  // Export results (placeholder - implement based on your needs)
  const exportResults = useCallback(
    async (sessionId: string, format: "pdf" | "csv") => {
      // This would typically call an API endpoint to generate the export
      console.log(`Exporting session ${sessionId} as ${format}`);

      // For now, just export as JSON
      if (results && results.sessionId === sessionId) {
        const dataStr = JSON.stringify(results, null, 2);
        const dataBlob = new Blob([dataStr], { type: "application/json" });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `exam-results-${sessionId}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }
    },
    [results]
  );

  // Auto-fetch results if sessionId provided
  useEffect(() => {
    if (sessionId) {
      fetchResults(sessionId);
    }
  }, [sessionId, fetchResults]);

  // Auto-fetch sessions if needed
  useEffect(() => {
    if ((userId || user) && !sessionId) {
      fetchUserSessions();
    }
  }, [userId, user, sessionId, fetchUserSessions]);

  return {
    results,
    sessions,
    loading,
    error,
    fetchResults,
    fetchUserSessions,
    deleteSession,
    exportResults,
  };
}
