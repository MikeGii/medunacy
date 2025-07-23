// src/components/exam-tests/ExamResultsPage.tsx - Updated compact version

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useExamResults } from "@/hooks/useExamResults";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "./common/ErrorDisplay";
import ExamErrorBoundary from "./common/ExamErrorBoundary";
import ExamResultsSummary from "./results/ExamResultsSummary";
import QuestionGrid from "./results/QuestionGrid";

interface ExamResultsPageProps {
  sessionId: string;
}

export default function ExamResultsPage({ sessionId }: ExamResultsPageProps) {
  const t = useTranslations("exam_tests.results");
  const router = useRouter();
  const locale = useLocale();

  const { results, loading, error, fetchResults } = useExamResults({
    sessionId,
  });

  useEffect(() => {
    fetchResults(sessionId);
  }, [sessionId, fetchResults]);

  if (loading) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
            <span className="ml-3 text-gray-600">{t("loading_results")}</span>
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  if (error || !results) {
    return (
      <AuthModalProvider>
        <ExamErrorBoundary>
          <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
            <Header />
            <div className="max-w-4xl mx-auto px-4 py-12">
              <ErrorDisplay
                error={error || t("no_results_found")}
                type="error"
              />
              <p className="text-gray-600 mt-4 text-center">
                {t("no_results_description")}
              </p>
              <div className="text-center mt-8">
                <button
                  onClick={() => router.push(`/${locale}/exam-tests`)}
                  className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300"
                >
                  {t("back_to_tests")}
                </button>
              </div>
            </div>
          </div>
        </ExamErrorBoundary>
      </AuthModalProvider>
    );
  }

  return (
    <AuthModalProvider>
      <ExamErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <main className="max-w-5xl mx-auto px-4 py-6">
            {/* Page Title - Compact */}
            <div className="text-center mb-6">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                {results.test.title}
              </h1>
              <p className="text-sm text-gray-600">{t("title")}</p>
            </div>

            <div className="space-y-6">
              {/* Summary Section */}
              <ExamResultsSummary results={results} />

              {/* Question Grid Section - Compact */}
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-4">
                  {t("question_review")}
                </h2>
                <p className="text-sm text-gray-600 mb-4">
                  {t("click_to_see_details")}
                </p>
                <QuestionGrid questionResults={results.questionResults} />
              </div>

              {/* Actions - Compact */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => router.push(`/${locale}/exam-tests`)}
                  className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
                >
                  {t("back_to_tests")}
                </button>
                <button
                  onClick={() =>
                    router.push(`/${locale}/exam-tests/${results.test.id}`)
                  }
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-lg font-semibold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105"
                >
                  {t("retake_test")}
                </button>
              </div>
            </div>
          </main>
        </div>
      </ExamErrorBoundary>
    </AuthModalProvider>
  );
}
