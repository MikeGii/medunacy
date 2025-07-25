import { useCallback, useRef, useState } from "react";

interface UseSubmissionGuardOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
  cooldownMs?: number;
}

export function useSubmissionGuard(options?: UseSubmissionGuardOptions) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmitTime, setLastSubmitTime] = useState<number>(0);
  const submitTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cooldownMs = options?.cooldownMs || 1000; // 1 second default cooldown

  const guardedSubmit = useCallback(
    async <T,>(submitFn: () => Promise<T>): Promise<T | null> => {
      // Check if already submitting
      if (isSubmitting) {
        console.warn("Submission already in progress");
        return null;
      }

      // Check cooldown
      const now = Date.now();
      const timeSinceLastSubmit = now - lastSubmitTime;
      if (timeSinceLastSubmit < cooldownMs) {
        console.warn(
          `Please wait ${Math.ceil(
            (cooldownMs - timeSinceLastSubmit) / 1000
          )} seconds before submitting again`
        );
        return null;
      }

      try {
        setIsSubmitting(true);
        setLastSubmitTime(now);

        // Clear any existing timeout
        if (submitTimeoutRef.current) {
          clearTimeout(submitTimeoutRef.current);
        }

        const result = await submitFn();
        options?.onSuccess?.();
        return result;
      } catch (error) {
        options?.onError?.(error as Error);
        throw error;
      } finally {
        // Keep submitting true for a short time to prevent double-clicks
        submitTimeoutRef.current = setTimeout(() => {
          setIsSubmitting(false);
        }, 300);
      }
    },
    [isSubmitting, lastSubmitTime, cooldownMs, options]
  );

  // Cleanup
  const cleanup = useCallback(() => {
    if (submitTimeoutRef.current) {
      clearTimeout(submitTimeoutRef.current);
    }
    setIsSubmitting(false);
  }, []);

  return {
    guardedSubmit,
    isSubmitting,
    canSubmit: !isSubmitting && Date.now() - lastSubmitTime >= cooldownMs,
    cleanup,
  };
}