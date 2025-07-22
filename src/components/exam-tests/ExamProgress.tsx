// src/components/exam-tests/ExamProgress.tsx

"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";

interface ExamProgressProps {
  current: number;
  total: number;
  answered: number;
  markedForReview: number;
}

const ExamProgress = memo(
  ({ current, total, answered, markedForReview }: ExamProgressProps) => {
    const t = useTranslations("exam_tests");

    const progressPercentage = ((current + 1) / total) * 100;
    const answeredPercentage = (answered / total) * 100;

    return (
      <div>
        {/* Progress Bar */}
        <div className="relative h-3 bg-gray-200 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-green-200 transition-all duration-300"
            style={{ width: `${answeredPercentage}%` }}
          />
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-[#118B50] to-[#5DB996] transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>

        {/* Progress Stats */}
        <div className="flex justify-between mt-2 text-xs text-gray-600">
          <span>{t("progress_overview")}</span>
          <div className="flex space-x-4">
            <span className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
              {answered}/{total} {t("answered")}
            </span>
            {markedForReview > 0 && (
              <span className="flex items-center">
                <div className="w-2 h-2 bg-yellow-500 rounded-full mr-1" />
                {markedForReview} {t("marked")}
              </span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

ExamProgress.displayName = "ExamProgress";

export default ExamProgress;
