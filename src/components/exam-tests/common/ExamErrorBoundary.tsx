// src/components/exam-tests/common/ExamErrorBoundary.tsx

"use client";

import React, { Component, ErrorInfo, ReactNode } from "react";
import { useTranslations } from "next-intl";

interface Props {
  children: ReactNode;
  fallback?: (error: Error, reset: () => void) => ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

// Error message translations component
function ErrorMessage({ error, reset }: { error: Error; reset: () => void }) {
  const t = useTranslations("exam_tests.errors");

  return (
    <div className="min-h-[400px] flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-red-50 border border-red-200 rounded-xl p-6">
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.667-2.308-1.667-3.08 0L3.34 19c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              {t("something_went_wrong")}
            </h3>
          </div>
        </div>

        <p className="text-sm text-red-700 mb-4">
          {error.message || t("unknown_error")}
        </p>

        <div className="flex space-x-3">
          <button
            onClick={reset}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {t("try_again")}
          </button>
          <button
            onClick={() => window.location.reload()}
            className="flex-1 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
          >
            {t("reload_page")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default class ExamErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ExamErrorBoundary caught error:", error, errorInfo);
  }

  private reset = () => {
    this.setState({ hasError: false, error: null });
  };

  public render() {
    if (this.state.hasError && this.state.error) {
      if (this.props.fallback) {
        return this.props.fallback(this.state.error, this.reset);
      }
      return <ErrorMessage error={this.state.error} reset={this.reset} />;
    }

    return this.props.children;
  }
}
