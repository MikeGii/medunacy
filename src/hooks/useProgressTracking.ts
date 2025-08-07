// src/hooks/useProgressTracking.ts
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { startOfWeek, endOfWeek, subWeeks, format } from "date-fns";

interface WeeklyStats {
  week_start: string;
  week_end: string;
  training_sessions_count: number;
  training_avg_score: number;
  training_total_questions: number;
  training_correct_answers: number;
  exam_sessions_count: number;
  exam_avg_score: number;
  exam_total_questions: number;
  exam_correct_answers: number;
  overall_avg_score: number;
  improvement_percentage: number;
}

export function useProgressTracking() {
  const { user } = useAuth();
  const [currentWeekStats, setCurrentWeekStats] = useState<WeeklyStats | null>(
    null
  );
  const [lastWeekStats, setLastWeekStats] = useState<WeeklyStats | null>(null);
  const [progressHistory, setProgressHistory] = useState<WeeklyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calculateWeeklyStats = useCallback(
    async (weekStart: Date, weekEnd: Date) => {
      if (!user) return null;

      try {
        const { data: sessions, error } = await supabase
          .from("exam_sessions")
          .select("*")
          .eq("user_id", user.id)
          .gte("completed_at", weekStart.toISOString())
          .lte("completed_at", weekEnd.toISOString())
          .not("completed_at", "is", null);

        if (error) {
          console.error("Error fetching sessions:", error);
          throw error;
        }

        // Calculate stats
        const trainingStats = sessions
          .filter((s) => s.mode === "training")
          .reduce(
            (acc, session) => ({
              count: acc.count + 1,
              totalScore: acc.totalScore + (session.score_percentage || 0),
              totalQuestions:
                acc.totalQuestions + (session.total_questions || 0),
              correctAnswers:
                acc.correctAnswers + (session.correct_answers || 0),
            }),
            { count: 0, totalScore: 0, totalQuestions: 0, correctAnswers: 0 }
          );

        const examStats = sessions
          .filter((s) => s.mode === "exam")
          .reduce(
            (acc, session) => ({
              count: acc.count + 1,
              totalScore: acc.totalScore + (session.score_percentage || 0),
              totalQuestions:
                acc.totalQuestions + (session.total_questions || 0),
              correctAnswers:
                acc.correctAnswers + (session.correct_answers || 0),
            }),
            { count: 0, totalScore: 0, totalQuestions: 0, correctAnswers: 0 }
          );

        const totalSessions = trainingStats.count + examStats.count;
        const overallAvg =
          totalSessions > 0
            ? (trainingStats.totalScore + examStats.totalScore) / totalSessions
            : 0;

        return {
          week_start: format(weekStart, "yyyy-MM-dd"),
          week_end: format(weekEnd, "yyyy-MM-dd"),
          training_sessions_count: trainingStats.count,
          training_avg_score:
            trainingStats.count > 0
              ? Math.round(
                  (trainingStats.totalScore / trainingStats.count) * 10
                ) / 10
              : 0,
          training_total_questions: trainingStats.totalQuestions,
          training_correct_answers: trainingStats.correctAnswers,
          exam_sessions_count: examStats.count,
          exam_avg_score:
            examStats.count > 0
              ? Math.round((examStats.totalScore / examStats.count) * 10) / 10
              : 0,
          exam_total_questions: examStats.totalQuestions,
          exam_correct_answers: examStats.correctAnswers,
          overall_avg_score: Math.round(overallAvg * 10) / 10,
          improvement_percentage: 0, // Will be calculated separately
        };
      } catch (error) {
        console.error("Error calculating weekly stats:", error);
        return null;
      }
    },
    [user]
  );

  const refreshProgress = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const now = new Date();
      const currentWeekStart = startOfWeek(now, { weekStartsOn: 1 });
      const currentWeekEnd = endOfWeek(now, { weekStartsOn: 1 });
      const lastWeekStart = startOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });
      const lastWeekEnd = endOfWeek(subWeeks(now, 1), { weekStartsOn: 1 });

      // Calculate current and last week stats
      const [current, last] = await Promise.all([
        calculateWeeklyStats(currentWeekStart, currentWeekEnd),
        calculateWeeklyStats(lastWeekStart, lastWeekEnd),
      ]);

      // Calculate improvement
      if (current && last && last.overall_avg_score > 0) {
        current.improvement_percentage =
          Math.round(
            (current.overall_avg_score - last.overall_avg_score) * 10
          ) / 10;
      }

      setCurrentWeekStats(current);
      setLastWeekStats(last);

      // Save to database for historical tracking (with error handling)
      if (current) {
        try {
          const { error: upsertError } = await supabase
            .from("user_progress_snapshots")
            .upsert(
              {
                user_id: user.id,
                ...current,
              },
              {
                onConflict: "user_id,week_start",
              }
            );

          if (upsertError) {
            console.error("Error saving progress snapshot:", upsertError);
            // Don't throw - this is not critical for the user experience
          }
        } catch (err) {
          console.error("Failed to save progress snapshot:", err);
          // Continue without saving - the calculated stats are still valid
        }
      }

      // Fetch historical data (last 12 weeks) with error handling
      try {
        const { data: history, error: historyError } = await supabase
          .from("user_progress_snapshots")
          .select("*")
          .eq("user_id", user.id)
          .gte("week_start", format(subWeeks(now, 12), "yyyy-MM-dd"))
          .order("week_start", { ascending: true });

        if (historyError) {
          console.error("Error fetching progress history:", historyError);
          // Use empty array if fetch fails
          setProgressHistory([]);
        } else {
          setProgressHistory(history || []);
        }
      } catch (err) {
        console.error("Failed to fetch progress history:", err);
        setProgressHistory([]);
      }
    } catch (err) {
      console.error("Error refreshing progress:", err);
      setError(err instanceof Error ? err.message : "Failed to load progress");
    } finally {
      setLoading(false);
    }
  }, [user, calculateWeeklyStats]);

  useEffect(() => {
    refreshProgress();
  }, [refreshProgress]);

  return {
    currentWeekStats,
    lastWeekStats,
    progressHistory,
    loading,
    error,
    refreshProgress,
  };
}
