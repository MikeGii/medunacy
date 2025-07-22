// src/components/exam-tests/ExamResultsPage.tsx - UPDATED

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ExamResults } from "@/types/exam";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";

interface ExamResultsPageProps {
  sessionId: string;
}

export default function ExamResultsPage({ sessionId }: ExamResultsPageProps) {
  const t = useTranslations("exam_tests.results");
  const router = useRouter();
  const locale = useLocale();
  const [results, setResults] = useState<ExamResults | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Try to get results from sessionStorage first
    const storedResults = sessionStorage.getItem("examResults");
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        if (parsedResults.sessionId === sessionId) {
          setResults(parsedResults);
          sessionStorage.removeItem("examResults"); // Clear after reading
          setLoading(false);
          return;
        }
      } catch (error) {
        console.error("Error parsing stored results:", error);
      }
    }

    // If no stored results, show no results found (remove API call)
    console.log("No stored results found for session:", sessionId);
    setLoading(false);
  }, [sessionId]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  if (loading) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-[#118B50] font-medium mt-4">
                {t("loading_results")}
              </p>
            </div>
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  if (!results) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-200 p-8 max-w-md mx-4">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                {t("no_results_found")}
              </h3>
              <p className="text-gray-500 mb-6">
                {t("no_results_description")}
              </p>
              <button
                onClick={() => router.push(`/${locale}/exam-tests`)}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
              >
                {t("back_to_tests")}
              </button>
            </div>
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        <main className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Results Header */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
              <div className="text-center mb-8">
                <h1 className="text-4xl font-bold mb-4">
                  <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
                    {t("title")}
                  </span>
                </h1>
                <h2 className="text-xl text-gray-600 mb-2">
                  {results.test.title}
                </h2>
                <p className="text-gray-500">{results.test.category?.name}</p>
              </div>

              {/* Score Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="#E5E7EB"
                      strokeWidth="16"
                      fill="none"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke={
                        results.scorePercentage >=
                        (results.test.passing_score || 70)
                          ? "#118B50"
                          : "#EF4444"
                      }
                      strokeWidth="16"
                      fill="none"
                      strokeDasharray={`${
                        (results.scorePercentage / 100) * 553
                      } 553`}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold">
                      {Math.round(results.scorePercentage)}%
                    </span>
                    <span className="text-gray-600">{t("score")}</span>
                  </div>
                </div>
              </div>

              {/* Pass/Fail Badge */}
              <div className="text-center mb-6">
                <span
                  className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${
                    results.passed
                      ? "bg-green-100 text-green-800 border border-green-200"
                      : "bg-red-100 text-red-800 border border-red-200"
                  }`}
                >
                  {results.passed ? (
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  ) : (
                    <svg
                      className="w-6 h-6 mr-2"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {results.passed ? t("passed") : t("failed")}
                </span>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                <div className="text-center p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
                  <div className="text-3xl font-bold text-green-700 mb-2">
                    {results.correctAnswers}
                  </div>
                  <div className="text-sm font-medium text-green-600">
                    {t("correct")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-xl border border-red-200">
                  <div className="text-3xl font-bold text-red-700 mb-2">
                    {results.incorrectAnswers}
                  </div>
                  <div className="text-sm font-medium text-red-600">
                    {t("incorrect")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
                  <div className="text-3xl font-bold text-blue-700 mb-2">
                    {results.totalQuestions}
                  </div>
                  <div className="text-sm font-medium text-blue-600">
                    {t("total")}
                  </div>
                </div>
                <div className="text-center p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
                  <div className="text-2xl font-bold text-purple-700 mb-2">
                    {formatTime(results.timeSpent)}
                  </div>
                  <div className="text-sm font-medium text-purple-600">
                    {t("time_spent")}
                  </div>
                </div>
              </div>
            </div>

            {/* Question Review Toggle */}
            <div className="text-center mb-8">
              <button
                onClick={() => setShowDetails(!showDetails)}
                className="px-8 py-4 bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border border-[#E3F0AF]/30"
              >
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-6 h-6 text-[#118B50]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span className="font-semibold text-gray-700">
                    {showDetails
                      ? t("hide_question_review")
                      : t("show_question_review")}
                  </span>
                  <svg
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      showDetails ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </div>
              </button>
            </div>

            {/* Detailed Question Review */}
            {showDetails && (
              <div className="space-y-6">
                <h3 className="text-2xl font-bold text-center text-[#118B50] mb-8">
                  {t("question_review")}
                </h3>

                {results.questionResults.map((result, index) => (
                  <div
                    key={index}
                    className={`bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border-l-4 p-8 ${
                      result.isCorrect ? "border-green-500" : "border-red-500"
                    }`}
                  >
                    <div className="flex justify-between items-start mb-6">
                      <h4 className="text-lg font-semibold text-gray-900 flex-1">
                        {index + 1}. {result.question.question_text}
                      </h4>
                      <span
                        className={`text-3xl ${
                          result.isCorrect ? "text-green-500" : "text-red-500"
                        }`}
                      >
                        {result.isCorrect ? "✓" : "✗"}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="space-y-3 mb-6">
                      {result.question.options.map((option, optionIndex) => {
                        const isUserSelected = result.selectedOptions.some(
                          (selected) => selected.id === option.id
                        );
                        const isCorrect = option.is_correct;

                        let className = "p-4 rounded-lg border-2 ";
                        if (isCorrect) {
                          className +=
                            "bg-green-50 border-green-300 text-green-800";
                        } else if (isUserSelected && !isCorrect) {
                          className += "bg-red-50 border-red-300 text-red-800";
                        } else {
                          className +=
                            "bg-gray-50 border-gray-200 text-gray-700";
                        }

                        return (
                          <div key={option.id} className={className}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <span className="font-semibold text-sm">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="flex-1">
                                  {option.option_text}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                {isUserSelected && (
                                  <span className="text-xs font-medium px-2 py-1 rounded bg-blue-100 text-blue-800">
                                    {t("your_answer")}
                                  </span>
                                )}
                                {isCorrect && (
                                  <span className="text-xs font-medium px-2 py-1 rounded bg-green-100 text-green-800">
                                    {t("correct_answer")}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* No answer case */}
                    {result.selectedOptions.length === 0 && (
                      <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
                        <p className="text-yellow-800 font-medium">
                          {t("not_answered")}
                        </p>
                      </div>
                    )}

                    {/* Explanation */}
                    {result.question.explanation && (
                      <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h5 className="font-semibold text-blue-800 mb-2">
                          {t("explanation")}:
                        </h5>
                        <p className="text-blue-700 text-sm">
                          {result.question.explanation}
                        </p>
                      </div>
                    )}

                    {/* Points */}
                    <div className="mt-4 text-right">
                      <span className="text-sm text-gray-500">
                        {t("points_earned")}:{" "}
                        <span className="font-semibold">
                          {result.pointsEarned}/{result.question.points}
                        </span>
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Action Buttons */}
            <div className="mt-12 flex justify-center gap-6">
              <button
                onClick={() => router.push(`/${locale}/exam-tests`)}
                className="px-8 py-4 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <div className="flex items-center space-x-2">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <span>{t("back_to_tests")}</span>
                </div>
              </button>

              {results.test.allow_multiple_attempts && (
                <button
                  onClick={() =>
                    router.push(
                      `/${locale}/exam-tests/training/${results.test.id}`
                    )
                  }
                  className="px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-semibold hover:from-blue-600 hover:to-blue-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  <div className="flex items-center space-x-2">
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                      />
                    </svg>
                    <span>{t("retake_test")}</span>
                  </div>
                </button>
              )}
            </div>
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}
