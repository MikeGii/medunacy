// src/components/common/GlobalErrorBoundary.tsx
"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { useTranslations } from "next-intl";

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Error fallback component with translations
function ErrorFallback({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("errors");

  const getErrorMessage = () => {
    // Check if errors are nested under 'generic'
    // Try both paths to be safe
    const tryGetError = (key: string) => {
      try {
        // First try errors.generic.key
        const genericError = t(`generic.${key}`);
        if (genericError && !genericError.includes("errors.generic.")) {
          return genericError;
        }
      } catch (e) {
        // If that fails, try errors.key
        try {
          const directError = t(key);
          if (directError && !directError.includes("errors.")) {
            return directError;
          }
        } catch (e2) {
          // Both failed
        }
      }
      return null;
    };

    // User-friendly error messages for common issues
    if (
      error.message.includes("Failed to fetch") ||
      error.message.includes("NetworkError")
    ) {
      return tryGetError("network_error") || t("generic.network_error");
    }
    if (
      error.message.includes("supabase") ||
      error.message.includes("database")
    ) {
      return tryGetError("database_error") || t("generic.server_error");
    }
    if (error.message.includes("permission") || error.message.includes("403")) {
      return tryGetError("permission_error") || t("generic.forbidden");
    }
    if (error.message.includes("404") || error.message.includes("not found")) {
      return tryGetError("not_found_error") || t("generic.not_found");
    }

    // Generic friendly message for other errors
    return tryGetError("generic_error") || t("generic.unknown");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.667-2.308-1.667-3.08 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Error Title */}
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {t("error_title") || t("generic.something_went_wrong")}
          </h1>

          {/* Error Message */}
          <p className="text-gray-600 mb-6">{getErrorMessage()}</p>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={reset}
              className="w-full px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] 
                       text-white rounded-xl font-semibold hover:from-[#0A6B3B] 
                       hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
            >
              {t("generic.try_again")}
            </button>

            <button
              onClick={() => (window.location.href = "/")}
              className="w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-xl 
                       font-semibold hover:bg-gray-200 transition-all duration-300"
            >
              {t("go_home") || t("generic.go_home")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // In a training app, we can just log to console
    console.error("Global error boundary caught:", error, errorInfo);
  }

  reset = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      return <ErrorFallback error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}
