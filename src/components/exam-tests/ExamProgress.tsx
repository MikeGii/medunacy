// src/components/exam-tests/ExamProgress.tsx - UPDATED

"use client";

import { TestQuestion } from "@/types/exam";
import { useTranslations } from "next-intl";

interface ExamProgressProps {
  progress: {
    current: number;
    total: number;
    answered: number;
    markedForReview: number;
  };
  onQuestionClick: (index: number) => void;
  currentQuestionIndex: number;
  answeredQuestions: Record<string, string[]>; // questionId -> selected option IDs
  markedQuestions: Set<string>;
  questions: TestQuestion[];
}

export default function ExamProgress({
  progress,
  onQuestionClick,
  currentQuestionIndex,
  answeredQuestions,
  markedQuestions,
  questions,
}: ExamProgressProps) {
  const t = useTranslations("exam_tests");

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-6">
      <h3 className="font-bold text-lg mb-6 text-[#118B50] text-center">
        {t("progress_overview")}
      </h3>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 mb-6">
        <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
          <div className="text-2xl font-bold text-green-700">
            {progress.answered}
          </div>
          <div className="text-sm text-green-600 font-medium">
            {t("answered")}
          </div>
        </div>

        <div className="text-center p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200">
          <div className="text-2xl font-bold text-gray-700">
            {progress.total - progress.answered}
          </div>
          <div className="text-sm text-gray-600 font-medium">
            {t("remaining")}
          </div>
        </div>

        {progress.markedForReview > 0 && (
          <div className="text-center p-4 bg-gradient-to-br from-yellow-50 to-yellow-100 rounded-xl border border-yellow-200">
            <div className="text-2xl font-bold text-yellow-700">
              {progress.markedForReview}
            </div>
            <div className="text-sm text-yellow-600 font-medium">
              {t("for_review")}
            </div>
          </div>
        )}
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-5 gap-2">
        {questions.map((question, i) => {
          const questionNumber = i + 1;
          const isAnswered =
            answeredQuestions.hasOwnProperty(question.id) &&
            answeredQuestions[question.id].length > 0;
          const isCurrent = i === currentQuestionIndex;
          const isMarked = markedQuestions.has(question.id);

          let className =
            "w-full aspect-square rounded-lg text-xs font-bold transition-all duration-200 border-2 ";

          if (isCurrent) {
            className +=
              "bg-[#118B50] text-white border-[#118B50] shadow-lg transform scale-110";
          } else if (isMarked && isAnswered) {
            className +=
              "bg-gradient-to-br from-yellow-200 to-amber-300 text-yellow-800 border-yellow-400 hover:from-yellow-300 hover:to-amber-400";
          } else if (isMarked) {
            className +=
              "bg-gradient-to-br from-yellow-100 to-yellow-200 text-yellow-700 border-yellow-300 hover:from-yellow-200 hover:to-yellow-300";
          } else if (isAnswered) {
            className +=
              "bg-gradient-to-br from-green-100 to-green-200 text-green-700 border-green-300 hover:from-green-200 hover:to-green-300";
          } else {
            className +=
              "bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 border-gray-300 hover:from-gray-200 hover:to-gray-300";
          }

          return (
            <button
              key={question.id}
              onClick={() => onQuestionClick(i)}
              className={className}
              title={`${t("question")} ${questionNumber}${
                isAnswered ? ` (${t("answered")})` : ""
              }${isMarked ? ` (${t("marked")})` : ""}`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span className="text-xs font-bold">{questionNumber}</span>
                {isMarked && <div className="text-xs mt-0.5">⚠️</div>}
              </div>
            </button>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-[#118B50] rounded"></div>
            <span className="text-gray-600">{t("current")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-200 rounded border border-green-300"></div>
            <span className="text-gray-600">{t("answered")}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-yellow-200 rounded border border-yellow-300"></div>
            <span className="text-gray-600">{t("marked")}</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-200 rounded border border-gray-300"></div>
            <span className="text-gray-600">{t("unanswered")}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
