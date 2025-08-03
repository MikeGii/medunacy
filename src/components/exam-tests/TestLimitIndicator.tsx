// src/components/exam-tests/TestLimitIndicator.tsx
"use client";

import { useTranslations } from "next-intl";
import { useTestAttempts } from "@/hooks/useTestAttempts";

export default function TestLimitIndicator() {
  const t = useTranslations("exam_tests");
  const { limits, loading } = useTestAttempts();

  if (loading) return null;

  // Don't show for premium users (unlimited)
  if (limits.trainingLimit === Infinity) return null;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">
        {t("daily_limits.title")}
      </h3>
      
      <div className="space-y-2">
        {/* Training Tests */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {t("daily_limits.training")}
          </span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              limits.canStartTraining ? 'text-green-600' : 'text-red-600'
            }`}>
              {limits.trainingUsed} / {limits.trainingLimit}
            </span>
            {!limits.canStartTraining && (
              <span className="text-xs text-red-600">
                {t("daily_limits.limit_reached")}
              </span>
            )}
          </div>
        </div>

        {/* Exam Tests */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">
            {t("daily_limits.exam")}
          </span>
          <div className="flex items-center space-x-2">
            <span className={`text-sm font-medium ${
              limits.canStartExam ? 'text-green-600' : 'text-red-600'
            }`}>
              {limits.examUsed} / {limits.examLimit}
            </span>
            {!limits.canStartExam && (
              <span className="text-xs text-red-600">
                {t("daily_limits.limit_reached")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="mt-3 pt-3 border-t border-gray-100">
        <p className="text-xs text-gray-500">
          {t("daily_limits.reset_info")}
        </p>
      </div>
    </div>
  );
}