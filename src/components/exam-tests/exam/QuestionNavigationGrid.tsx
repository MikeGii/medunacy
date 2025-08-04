// src/components/exam-tests/exam/QuestionNavigationGrid.tsx

"use client";

import { memo, useState, useEffect } from "react";
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
  const [currentPage, setCurrentPage] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  // Questions per page for mobile
  const questionsPerPage = 30;
  const totalPages = Math.ceil(questions.length / questionsPerPage);

  // Check if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Update page when current question changes
  useEffect(() => {
    const newPage = Math.floor(currentIndex / questionsPerPage);
    if (newPage !== currentPage) {
      setCurrentPage(newPage);
    }
  }, [currentIndex, currentPage, questionsPerPage]);

  const startIndex = currentPage * questionsPerPage;
  const endIndex = Math.min(startIndex + questionsPerPage, questions.length);
  const visibleQuestions = questions.slice(startIndex, endIndex);

  const getQuestionStyle = (question: { id: string }, index: number) => {
    const globalIndex = isMobile ? startIndex + index : index;
    const isAnswered = (answers[question.id] || []).length > 0;
    const isMarked = markedForReview.has(question.id);
    const isCurrent = globalIndex === currentIndex;

    let bgColor = "bg-gray-200/60"; // Unanswered
    if (isMarked) {
      bgColor = "bg-amber-200/70"; // Marked
    } else if (isAnswered) {
      bgColor = "bg-emerald-200/60"; // Answered
    }

    return {
      bgColor,
      isCurrent,
      isMarked,
      isAnswered,
    };
  };

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

      {/* Mobile Pagination Controls - Top */}
      {isMobile && totalPages > 1 && (
        <div className="flex items-center justify-between mb-3">
          <button
            onClick={() => setCurrentPage(Math.max(0, currentPage - 1))}
            disabled={currentPage === 0}
            className="px-3 py-1 text-sm bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            ← {t("previous")}
          </button>
          <span className="text-xs text-gray-600">
            {startIndex + 1}-{endIndex} / {questions.length}
          </span>
          <button
            onClick={() =>
              setCurrentPage(Math.min(totalPages - 1, currentPage + 1))
            }
            disabled={currentPage === totalPages - 1}
            className="px-3 py-1 text-sm bg-gray-100 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-200 transition-colors"
          >
            {t("next")} →
          </button>
        </div>
      )}

      {/* Question Grid - Responsive */}
      <div className={`grid gap-1 ${isMobile ? "grid-cols-6" : "grid-cols-8"}`}>
        {(isMobile ? visibleQuestions : questions).map((question, index) => {
          const { bgColor, isCurrent, isMarked, isAnswered } = getQuestionStyle(
            question,
            index
          );
          const globalIndex = isMobile ? startIndex + index : index;

          return (
            <button
              key={question.id}
              onClick={() => onQuestionClick(globalIndex)}
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
              title={`${t("question")} ${globalIndex + 1}${
                isMarked ? ` - ${t("marked_for_review")}` : ""
              }`}
            >
              {globalIndex + 1}
            </button>
          );
        })}
      </div>

      {/* Mobile Quick Jump */}
      {isMobile && questions.length > questionsPerPage && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-600">{t("jump_to")}:</span>
            <input
              type="number"
              min="1"
              max={questions.length}
              value={currentIndex + 1}
              onChange={(e) => {
                const questionNum = parseInt(e.target.value) - 1;
                if (questionNum >= 0 && questionNum < questions.length) {
                  onQuestionClick(questionNum);
                }
              }}
              className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      )}
    </div>
  );
});
