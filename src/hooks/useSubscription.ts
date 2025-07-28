// src/hooks/useSubscription.ts - SIMPLIFIED VERSION
"use client";

import { useMemo, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { Test } from "@/types/exam";

interface UseSubscriptionReturn {
  // Status
  isPremium: boolean;
  subscriptionStatus: "free" | "premium" | "trial";
  isLoading: boolean;

  // Feature access
  canAccessTest: (test: Test) => boolean;

  // Actions
  checkTestAccess: (testId: string) => Promise<boolean>;
}

export function useSubscription(): UseSubscriptionReturn {
  const { user, loading: authLoading } = useAuth();

  // Computed subscription status
  const subscriptionStatus = useMemo(() => {
    // If auth is still loading or no user, default to 'free'
    if (authLoading || !user) return "free";

    return user.subscription_status || "free";
  }, [user?.subscription_status, authLoading, user]);

  const isPremium = useMemo(() => {
    // Don't grant premium access while loading
    if (authLoading) return false;

    return subscriptionStatus === "premium" || subscriptionStatus === "trial";
  }, [subscriptionStatus, authLoading]);

  // Check if user can access a specific test
  const canAccessTest = useCallback(
    (test: Test): boolean => {
      // If auth is still loading, only allow access to non-premium tests
      if (authLoading) return !test.is_premium;

      // If test is not premium, everyone can access
      if (!test.is_premium) return true;

      // If user is not logged in, they can't access premium
      if (!user) return false;

      // Check if user has premium or trial subscription
      return isPremium;
    },
    [user, isPremium, authLoading]
  );

  // Check test access by ID (with database query)
  const checkTestAccess = useCallback(
    async (testId: string): Promise<boolean> => {
      // If auth is still loading or no user, prevent access
      if (authLoading || !user) return false;

      try {
        const { data: test, error } = await supabase
          .from("tests")
          .select("is_premium")
          .eq("id", testId)
          .single();

        if (error || !test) return false;

        // If test is not premium, everyone can access
        if (!test.is_premium) return true;

        // Otherwise check if user has premium subscription
        return isPremium;
      } catch (error) {
        console.error("Error checking test access:", error);
        return false;
      }
    },
    [user, isPremium, authLoading]
  );

  return {
    // Status
    isPremium,
    subscriptionStatus,
    isLoading: authLoading, // ADD THIS to the return interface

    // Feature access
    canAccessTest,

    // Actions
    checkTestAccess,
  };
}
