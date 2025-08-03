// src/hooks/useTestAttempts.ts
import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/hooks/useSubscription';

interface TestAttemptLimits {
  trainingLimit: number;
  examLimit: number;
  trainingUsed: number;
  examUsed: number;
  canStartTraining: boolean;
  canStartExam: boolean;
}

export function useTestAttempts() {
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [limits, setLimits] = useState<TestAttemptLimits>({
    trainingLimit: 3,
    examLimit: 1,
    trainingUsed: 0,
    examUsed: 0,
    canStartTraining: true,
    canStartExam: true,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch today's test attempts
  const fetchTodayAttempts = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Premium users have unlimited attempts
      if (isPremium) {
        setLimits({
          trainingLimit: Infinity,
          examLimit: Infinity,
          trainingUsed: 0,
          examUsed: 0,
          canStartTraining: true,
          canStartExam: true,
        });
        return;
      }

      // Get today's date in the user's timezone
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's attempts
      const { data, error: fetchError } = await supabase
        .from('test_attempts')
        .select('mode')
        .eq('user_id', user.id)
        .eq('attempt_date', today);

      if (fetchError) throw fetchError;

      // Count attempts by mode
      const trainingUsed = data?.filter(a => a.mode === 'training').length || 0;
      const examUsed = data?.filter(a => a.mode === 'exam').length || 0;

      setLimits({
        trainingLimit: 3,
        examLimit: 1,
        trainingUsed,
        examUsed,
        canStartTraining: trainingUsed < 3,
        canStartExam: examUsed < 1,
      });
    } catch (err) {
      console.error('Error fetching test attempts:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch test attempts');
    } finally {
      setLoading(false);
    }
  }, [user, isPremium]);

  // Record a new test attempt
  const recordAttempt = useCallback(async (testId: string, mode: 'training' | 'exam'): Promise<boolean> => {
    if (!user) {
      setError('User not authenticated');
      return false;
    }

    // Premium users don't need to record attempts
    if (isPremium) {
      return true;
    }

    try {
      // Check current limits
      if (mode === 'training' && !limits.canStartTraining) {
        setError('Daily training test limit reached');
        return false;
      }
      if (mode === 'exam' && !limits.canStartExam) {
        setError('Daily exam test limit reached');
        return false;
      }

      // Record the attempt
      const { error: insertError } = await supabase
        .from('test_attempts')
        .insert({
          user_id: user.id,
          test_id: testId,
          mode: mode,
        });

      if (insertError) throw insertError;

      // Update local state
      setLimits(prev => ({
        ...prev,
        trainingUsed: mode === 'training' ? prev.trainingUsed + 1 : prev.trainingUsed,
        examUsed: mode === 'exam' ? prev.examUsed + 1 : prev.examUsed,
        canStartTraining: mode === 'training' ? prev.trainingUsed + 1 < prev.trainingLimit : prev.canStartTraining,
        canStartExam: mode === 'exam' ? prev.examUsed + 1 < prev.examLimit : prev.canStartExam,
      }));

      return true;
    } catch (err) {
      console.error('Error recording test attempt:', err);
      setError(err instanceof Error ? err.message : 'Failed to record test attempt');
      return false;
    }
  }, [user, isPremium, limits]);

  // Fetch attempts on mount and when user changes
  useEffect(() => {
    fetchTodayAttempts();
  }, [fetchTodayAttempts]);

  return {
    limits,
    loading,
    error,
    recordAttempt,
    refreshLimits: fetchTodayAttempts,
  };
}