// src/components/exam-tests/ExamResultsPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { ExamResults } from "@/types/exam";
import LoadingSpinner from "@/components/common/LoadingSpinner";

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
    // Try to get results from sessionStorage
    const storedResults = sessionStorage.getItem("examResults");
    if (storedResults) {
      try {
        const parsedResults = JSON.parse(storedResults);
        if (parsedResults.sessionId === sessionId) {
          setResults(parsedResults);
          sessionStorage.removeItem("examResults"); // Clear after reading
        }
      } catch (error) {
        console.error("Error parsing results:", error);
      }
    }
    setLoading(false);
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (!results) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">No results found</p>
          <button
            onClick={() => router.push(`/${locale}/exam-tests`)}
            className="px-4 py-2 bg-[#118B50] text-white rounded hover:bg-[#0A6B3B]"
          >
            {t("back_to_tests")}
          </button>
        </div>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`;
    }
    return `${minutes}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Results Header */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-6">
          <h1 className="text-3xl font-bold text-center mb-8">{t("title")}</h1>

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
                  stroke={results.scorePercentage >= 70 ? "#118B50" : "#EF4444"}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-semibold text-green-600">
                {results.correctAnswers}
              </div>
              <div className="text-sm text-gray-600">{t("correct")}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-semibold text-red-600">
                {results.incorrectAnswers}
              </div>
              <div className="text-sm text-gray-600">{t("incorrect")}</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-semibold text-gray-700">
                {results.totalQuestions}
              </div>
              <div className="text-sm text-gray-600">Total</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded">
              <div className="text-2xl font-semibold text-blue-600">
                {formatTime(results.timeSpent)}
              </div>
              <div className="text-sm text-gray-600">{t("time_spent")}</div>
            </div>
          </div>
        </div>

        {/* Question Review Toggle */}
        <div className="text-center mb-6">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="px-6 py-2 bg-white rounded-lg shadow hover:shadow-md transition-shadow"
          >
            {showDetails ? "Hide" : "Show"} {t("question_review")}
          </button>
        </div>

        {/* Detailed Question Review */}
        {showDetails && (
          <div className="space-y-4">
            {results.questionResults.map((result, index) => {
              const userAnswer =
                result.selectedOption >= 0
                  ? result.question.options[result.selectedOption]
                  : null;
              const correctAnswer = result.question.options.find(
                (opt) => opt.isCorrect
              );

              return (
                <div
                  key={index}
                  className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                    result.isCorrect ? "border-green-500" : "border-red-500"
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-gray-900 flex-1">
                      {index + 1}. {result.question.questionText}
                    </h3>
                    <span
                      className={`ml-4 text-2xl ${
                        result.isCorrect ? "text-green-500" : "text-red-500"
                      }`}
                    >
                      {result.isCorrect ? "✓" : "✗"}
                    </span>
                  </div>

                  {/* Options */}
                  <div className="space-y-2">
                    {result.question.options.map((option, optionIndex) => {
                      const isUserAnswer =
                        result.selectedOption === optionIndex;
                      const isCorrectAnswer = option.isCorrect;

                      let className = "p-3 rounded border ";
                      if (isCorrectAnswer) {
                        className +=
                          "bg-green-50 border-green-300 text-green-800";
                      } else if (isUserAnswer && !isCorrectAnswer) {
                        className += "bg-red-50 border-red-300 text-red-800";
                      } else {
                        className += "bg-gray-50 border-gray-200 text-gray-600";
                      }

                      return (
                        <div key={optionIndex} className={className}>
                          <div className="flex items-center">
                            <span className="flex-1">{option.text}</span>
                            {isUserAnswer && (
                              <span className="ml-2 text-sm font-medium">
                                {t("your_answer")}
                              </span>
                            )}
                            {isCorrectAnswer && (
                              <span className="ml-2 text-sm font-medium">
                                {t("correct_answer")}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* No answer case */}
                  {result.selectedOption < 0 && (
                    <p className="mt-2 text-sm text-gray-500 italic">
                      Not answered
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.push(`/${locale}/exam-tests`)}
            className="px-6 py-3 bg-[#118B50] text-white rounded-lg hover:bg-[#0A6B3B] font-semibold"
          >
            {t("back_to_tests")}
          </button>
        </div>
      </div>
    </div>
  );
}
