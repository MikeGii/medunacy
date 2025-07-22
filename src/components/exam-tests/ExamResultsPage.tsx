// src/components/exam-tests/ExamResultsPage.tsx

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

  const scoreColor = results.passed
    ? "from-green-500 to-green-600"
    : "from-red-500 to-red-600";

  const formatTime = (seconds: number): string => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <AuthModalProvider>
      <ExamErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />

          <main className="py-12">
            <div className="max-w-4xl mx-auto px-4">
              {/* Results Header */}
              <div className="text-center mb-12">
                <h1 className="text-4xl font-bold text-gray-900 mb-4">
                  {t("title")}
                </h1>
                <p className="text-xl text-gray-600">{results.test.title}</p>
              </div>

              {/* Score Card */}
              <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">
                <div className="text-center">
                  {/* Pass/Fail Badge */}
                  <div className="mb-6">
                    {results.passed ? (
                      <div className="inline-flex items-center space-x-2 bg-green-100 text-green-800 px-6 py-3 rounded-full">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-lg font-semibold">
                          {t("passed")}
                        </span>
                      </div>
                    ) : (
                      <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-6 py-3 rounded-full">
                        <svg
                          className="w-6 h-6"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                            clipRule="evenodd"
                          />
                        </svg>
                        <span className="text-lg font-semibold">
                          {t("failed")}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Score Circle */}
                  <div className="relative w-48 h-48 mx-auto mb-6">
                    <svg className="w-48 h-48 transform -rotate-90">
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="#e5e7eb"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="96"
                        cy="96"
                        r="88"
                        stroke="url(#scoreGradient)"
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 88}`}
                        strokeDashoffset={`${
                          2 * Math.PI * 88 * (1 - results.scorePercentage / 100)
                        }`}
                        className="transition-all duration-1000"
                      />
                      <defs>
                        <linearGradient id="scoreGradient">
                          <stop
                            offset="0%"
                            className={
                              results.passed ? "text-green-500" : "text-red-500"
                            }
                          />
                          <stop
                            offset="100%"
                            className={
                              results.passed ? "text-green-600" : "text-red-600"
                            }
                          />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <div
                        className={`text-5xl font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}
                      >
                        {Math.round(results.scorePercentage)}%
                      </div>
                      <div className="text-gray-600 mt-1">{t("score")}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-6 mt-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {results.correctAnswers}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t("correct")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">
                        {results.incorrectAnswers}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t("incorrect")}
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-700">
                        {formatTime(results.timeSpent)}
                      </div>
                      <div className="text-sm text-gray-600 mt-1">
                        {t("time_spent")}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Question Review */}
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  {t("question_review")}
                </h2>

                <div className="space-y-6">
                  {results.questionResults.map((result, index) => (
                    <div
                      key={index}
                      className={`border-2 rounded-xl p-6 ${
                        result.isCorrect
                          ? "border-green-200 bg-green-50"
                          : "border-red-200 bg-red-50"
                      }`}
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {t("question")} {index + 1}
                          </h3>
                          <p className="text-gray-700 mt-1">
                            {result.question.question_text}
                          </p>
                        </div>
                        <div
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            result.isCorrect
                              ? "bg-green-200 text-green-800"
                              : "bg-red-200 text-red-800"
                          }`}
                        >
                          {result.pointsEarned}/{result.question.points}{" "}
                          {t("points")}
                        </div>
                      </div>

                      {/* Your Answer */}
                      {result.selectedOptions.length > 0 && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-gray-600">
                            {t("your_answer")}:
                          </span>
                          <div className="mt-1">
                            {result.selectedOptions.map((option, idx) => (
                              <div
                                key={idx}
                                className={`inline-block px-3 py-1 rounded-lg text-sm mr-2 ${
                                  option.is_correct
                                    ? "bg-green-200 text-green-800"
                                    : "bg-red-200 text-red-800"
                                }`}
                              >
                                {option.option_text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Correct Answer */}
                      {!result.isCorrect && (
                        <div>
                          <span className="text-sm font-medium text-gray-600">
                            {t("correct_answer")}:
                          </span>
                          <div className="mt-1">
                            {result.correctOptions.map((option, idx) => (
                              <div
                                key={idx}
                                className="inline-block px-3 py-1 bg-green-200 text-green-800 rounded-lg text-sm mr-2"
                              >
                                {option.option_text}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Explanation */}
                      {result.question.explanation && (
                        <div className="mt-4 p-3 bg-blue-100 rounded-lg">
                          <p className="text-sm text-blue-800">
                            <span className="font-medium">
                              {t("explanation")}:
                            </span>{" "}
                            {result.question.explanation}
                          </p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="text-center mt-8">
                <button
                  onClick={() => router.push(`/${locale}/exam-tests`)}
                  className="px-8 py-4 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
                >
                  {t("back_to_tests")}
                </button>
              </div>
            </div>
          </main>
        </div>
      </ExamErrorBoundary>
    </AuthModalProvider>
  );
}
