// src/components/exam-tests/ExamProgress.tsx - Final smart version

"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";

interface ExamProgressProps {
  current: number;
  total: number;
  answered: number;
  markedForReview: number;
  markedQuestions?: number; // Questions that are both answered and marked
}

const ExamProgress = memo(
  ({
    current,
    total,
    answered,
    markedForReview,
    markedQuestions = 0,
  }: ExamProgressProps) => {
    const t = useTranslations("exam_tests");

    // Calculate segments
    const answeredOnly = answered - markedQuestions;
    const markedOnly = markedForReview - markedQuestions;

    // Calculate percentages for each segment
    const answeredOnlyPercentage = (answeredOnly / total) * 100;
    const markedPercentage = (markedForReview / total) * 100; // Total marked (includes answered+marked)

    return (
      <div className="w-full">
        {/* Progress Bar */}
        <div className="relative h-2 bg-gray-300 rounded-full overflow-hidden">
          {/* Green - Answered questions only (not marked) */}
          {answeredOnly > 0 && (
            <div
              className="absolute top-0 left-0 h-full bg-emerald-500 transition-all duration-300"
              style={{ width: `${answeredOnlyPercentage}%` }}
            />
          )}

          {/* Yellow - All marked questions (includes both marked-only and marked+answered) */}
          {markedForReview > 0 && (
            <div
              className="absolute top-0 h-full bg-amber-400 transition-all duration-300"
              style={{
                left: `${answeredOnlyPercentage}%`,
                width: `${markedPercentage}%`,
              }}
            />
          )}
        </div>

        {/* Minimal stats */}
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-3 text-xs">
            <span className="flex items-center text-emerald-700">
              <div className="w-2 h-2 bg-emerald-500 rounded-full mr-1" />
              {answered}
            </span>
            {markedForReview > 0 && (
              <span className="flex items-center text-amber-700">
                <div className="w-2 h-2 bg-amber-400 rounded-full mr-1" />
                {markedForReview}
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">
            {total - answered} {t("unanswered")}
          </span>
        </div>
      </div>
    );
  }
);

ExamProgress.displayName = "ExamProgress";

export default ExamProgress;
