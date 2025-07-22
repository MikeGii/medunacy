// src/components/exam-tests/common/ErrorDisplay.tsx

"use client";

import { useTranslations } from "next-intl";

interface ErrorDisplayProps {
  error: string | null;
  onDismiss?: () => void;
  type?: "error" | "warning" | "info";
  className?: string;
}

export default function ErrorDisplay({
  error,
  onDismiss,
  type = "error",
  className = "",
}: ErrorDisplayProps) {
  const t = useTranslations("exam_tests.errors");

  if (!error) return null;

  const colors = {
    error: {
      bg: "bg-red-50",
      border: "border-red-200",
      text: "text-red-800",
      icon: "text-red-600",
    },
    warning: {
      bg: "bg-yellow-50",
      border: "border-yellow-200",
      text: "text-yellow-800",
      icon: "text-yellow-600",
    },
    info: {
      bg: "bg-blue-50",
      border: "border-blue-200",
      text: "text-blue-800",
      icon: "text-blue-600",
    },
  };

  const style = colors[type];

  // Translate common error messages
  const getTranslatedError = (error: string): string => {
    const errorMap: Record<string, string> = {
      Unauthorized: t("unauthorized"),
      "Not found": t("not_found"),
      "Network error": t("network_error"),
      "Validation failed": t("validation_failed"),
      "Test not found": t("test_not_found"),
      "Question not found": t("question_not_found"),
      "Session expired": t("session_expired"),
      "No questions in test": t("no_questions_in_test"),
      "Already submitted": t("already_submitted"),
    };

    // Check if we have a translation for this error
    for (const [key, translation] of Object.entries(errorMap)) {
      if (error.includes(key)) {
        return translation;
      }
    }

    // Return original error if no translation found
    return error;
  };

  return (
    <div
      className={`${style.bg} ${style.border} border rounded-xl p-4 ${className}`}
    >
      <div className="flex">
        <div className="flex-shrink-0">
          <svg
            className={`w-5 h-5 ${style.icon}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {type === "error" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
            {type === "warning" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.667-2.308-1.667-3.08 0L3.34 19c-.77 1.333.192 3 1.732 3z"
              />
            )}
            {type === "info" && (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            )}
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <p className={`text-sm ${style.text}`}>{getTranslatedError(error)}</p>
        </div>
        {onDismiss && (
          <div className="ml-auto pl-3">
            <button
              onClick={onDismiss}
              className={`inline-flex rounded-md p-1.5 ${style.text} hover:bg-white hover:bg-opacity-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600`}
            >
              <span className="sr-only">{t("dismiss")}</span>
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
