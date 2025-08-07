// src/components/dashboard/CompactProgressWidget.tsx
"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { useProgressTracking } from "@/hooks/useProgressTracking";
import { useLocale } from "next-intl";

export default function CompactProgressWidget() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const { currentWeekStats, lastWeekStats, loading } = useProgressTracking();

  if (loading) {
    return (
      <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 animate-pulse">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="text-center">
              <div className="h-8 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4 mx-auto"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Calculate progress percentages
  const trainingProgress =
    currentWeekStats && lastWeekStats
      ? currentWeekStats.training_avg_score - lastWeekStats.training_avg_score
      : 0;

  const examProgress =
    currentWeekStats && lastWeekStats
      ? currentWeekStats.exam_avg_score - lastWeekStats.exam_avg_score
      : 0;

  return (
    <Link href={`/${locale}/analytics`} className="block group">
      <div
        className="bg-white/60 backdrop-blur-sm rounded-xl shadow-sm border border-white/80 p-4 
                      hover:shadow-md hover:bg-white/80 transition-all duration-300 cursor-pointer"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Training Average */}
          <div className="text-center">
            <div className="bg-blue-50 rounded-lg p-3 transition-all duration-300 group-hover:scale-105">
              <div className="text-2xl font-bold text-blue-600 mb-1">
                {currentWeekStats?.training_avg_score || 0}%
              </div>
              <p className="text-xs text-gray-600">{t("avg_training_score")}</p>
            </div>
          </div>

          {/* Exam Average */}
          <div className="text-center">
            <div className="bg-purple-50 rounded-lg p-3 transition-all duration-300 group-hover:scale-105">
              <div className="text-2xl font-bold text-purple-600 mb-1">
                {currentWeekStats?.exam_avg_score || 0}%
              </div>
              <p className="text-xs text-gray-600">{t("avg_exam_score")}</p>
            </div>
          </div>

          {/* Training Progress */}
          <div className="text-center">
            <div
              className={`${
                trainingProgress >= 0 ? "bg-green-50" : "bg-red-50"
              } rounded-lg p-3 transition-all duration-300 group-hover:scale-105`}
            >
              <div
                className={`text-2xl font-bold mb-1 flex items-center justify-center ${
                  trainingProgress >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {trainingProgress >= 0 ? (
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                )}
                {Math.abs(trainingProgress).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600">{t("training_progress")}</p>
            </div>
          </div>

          {/* Exam Progress */}
          <div className="text-center">
            <div
              className={`${
                examProgress >= 0 ? "bg-green-50" : "bg-red-50"
              } rounded-lg p-3 transition-all duration-300 group-hover:scale-105`}
            >
              <div
                className={`text-2xl font-bold mb-1 flex items-center justify-center ${
                  examProgress >= 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {examProgress >= 0 ? (
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M5 10l7-7m0 0l7 7m-7-7v18"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={3}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                )}
                {Math.abs(examProgress).toFixed(1)}%
              </div>
              <p className="text-xs text-gray-600">{t("exam_progress")}</p>
            </div>
          </div>
        </div>

        {/* Subtle hover indicator */}
        <div className="mt-3 text-center">
          <span className="text-xs text-gray-500 group-hover:text-purple-600 transition-colors">
            {t("click_for_details")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
