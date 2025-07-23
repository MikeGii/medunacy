// src/components/exam-tests/exam/QuestionNavigationGrid.tsx

"use client";

import { memo } from "react";
import { useTranslations } from "next-intl";

interface QuestionNavigationGridProps {
  questions: Array<{ id: string }>;
  currentIndex: number;
  answers: Record<string, string[]>;
  markedForReview: Set<string>;
  onQuestionClick: (index: number) => void;
}

export default memo(function QuestionNavigationGrid({
  questions,
  currentIndex,
  answers,
  markedForReview,
  onQuestionClick,
}: QuestionNavigationGridProps) {
  const t = useTranslations("exam_tests");

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">
        {t("question_navigation")}
      </h3>
      
      {/* Legend */}
      <div className="flex flex-wrap gap-2 text-xs mb-3">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-emerald-200 rounded-sm" />
          <span className="text-gray-600">{t("answered")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-gray-200 rounded-sm" />
          <span className="text-gray-600">{t("unanswered")}</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 bg-amber-200 rounded-sm" />
          <span className="text-gray-600">{t("marked")}</span>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-8 gap-1">
        {questions.map((question, index) => {
          const isAnswered = (answers[question.id] || []).length > 0;
          const isMarked = markedForReview.has(question.id);
          const isCurrent = index === currentIndex;

          let bgColor = "bg-gray-200/60"; // Unanswered
          if (isMarked) {
            bgColor = "bg-amber-200/70"; // Marked
          } else if (isAnswered) {
            bgColor = "bg-emerald-200/60"; // Answered
          }

          return (
            <button
              key={question.id}
              onClick={() => onQuestionClick(index)}
              className={`
                aspect-square rounded text-xs font-medium
                transition-all duration-150 hover:scale-110
                ${bgColor}
                ${isCurrent ? "ring-2 ring-blue-500 ring-offset-1" : ""}
                ${
                  isMarked
                    ? "hover:bg-amber-300/70"
                    : isAnswered
                    ? "hover:bg-emerald-300/60"
                    : "hover:bg-gray-300/60"
                }
              `}
              title={`${t("question")} ${index + 1}${
                isMarked ? ` - ${t("marked_for_review")}` : ""
              }`}
            >
              {index + 1}
            </button>
          );
        })}
      </div>
    </div>
  );
});