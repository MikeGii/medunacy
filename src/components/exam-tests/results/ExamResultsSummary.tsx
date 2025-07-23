// src/components/exam-tests/results/ExamResultsSummary.tsx

"use client";

import { useTranslations } from "next-intl";
import { ExamResults } from "@/types/exam";

interface ExamResultsSummaryProps {
  results: ExamResults;
}

export default function ExamResultsSummary({
  results,
}: ExamResultsSummaryProps) {
  const t = useTranslations("exam_tests.results");

  const scoreColor = results.passed
    ? "from-emerald-600 to-emerald-700"
    : "from-rose-600 to-rose-700";

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Pass/Fail Badge */}
      <div className="text-center mb-6">
        <div
          className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold text-white bg-gradient-to-r ${scoreColor}`}
        >
          {results.passed ? (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
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
              {t("passed")}
            </>
          ) : (
            <>
              <svg
                className="w-4 h-4 mr-1.5"
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
              {t("failed")}
            </>
          )}
        </div>
      </div>

      {/* Score Circle - Smaller */}
      <div className="relative w-32 h-32 mx-auto mb-6">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="currentColor"
            strokeWidth="8"
            fill="none"
            className="text-gray-200"
          />
          <circle
            cx="64"
            cy="64"
            r="58"
            stroke="url(#scoreGradient)"
            strokeWidth="8"
            fill="none"
            strokeDasharray={`${(results.scorePercentage / 100) * 365} 365`}
            className="transition-all duration-1000 ease-out"
          />
          <defs>
            <linearGradient id="scoreGradient">
              <stop
                offset="0%"
                className={
                  results.passed ? "text-emerald-600" : "text-rose-600"
                }
              />
              <stop
                offset="100%"
                className={
                  results.passed ? "text-emerald-700" : "text-rose-700"
                }
              />
            </linearGradient>
          </defs>
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div
            className={`text-3xl font-bold bg-gradient-to-r ${scoreColor} bg-clip-text text-transparent`}
          >
            {Math.round(results.scorePercentage)}%
          </div>
          <div className="text-gray-600 text-xs mt-0.5">{t("score")}</div>
        </div>
      </div>

      {/* Stats Grid - Compact */}
      <div className="grid grid-cols-3 gap-3">
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-emerald-700">
            {results.correctAnswers}
          </div>
          <div className="text-xs text-gray-600">{t("correct")}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-rose-700">
            {results.incorrectAnswers}
          </div>
          <div className="text-xs text-gray-600">{t("incorrect")}</div>
        </div>
        <div className="text-center p-3 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-700">
            {formatTime(results.timeSpent)}
          </div>
          <div className="text-xs text-gray-600">{t("time_spent")}</div>
        </div>
      </div>
    </div>
  );
}
