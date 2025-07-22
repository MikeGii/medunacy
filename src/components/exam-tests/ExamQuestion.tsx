// src/components/exam-tests/ExamQuestion.tsx - UPDATED

"use client";

import { TestQuestion } from "@/types/exam";
import { useTranslations } from "next-intl";

interface ExamQuestionProps {
  question: TestQuestion;
  selectedAnswer: string[]; // Array of selected option IDs
  onSelectAnswer: (optionId: string) => void;
  showResult: boolean;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
}

export default function ExamQuestion({
  question,
  selectedAnswer,
  onSelectAnswer,
  showResult,
  isMarkedForReview,
  onToggleMarkForReview,
}: ExamQuestionProps) {
  const t = useTranslations("exam_tests");

  // Check if multiple correct answers exist
  const correctOptions = question.options.filter((opt) => opt.is_correct);
  const hasMultipleCorrect = correctOptions.length > 1;

  return (
    <div>
      {/* Question Header */}
      <div className="flex justify-between items-start mb-6">
        <div className="flex-1 pr-4">
          <h2 className="text-lg font-medium text-gray-900 mb-2">
            {question.question_text}
          </h2>
          {question.explanation && showResult && (
            <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-blue-800 mb-2">
                {t("explanation")}
              </h4>
              <p className="text-blue-700 text-sm">{question.explanation}</p>
            </div>
          )}
          {hasMultipleCorrect && !showResult && (
            <p className="text-sm text-amber-600 font-medium">
              {t("multiple_answers_allowed")}
            </p>
          )}
        </div>

        <button
          onClick={onToggleMarkForReview}
          className={`flex-shrink-0 px-3 py-1 text-sm rounded transition-all duration-200 ${
            isMarkedForReview
              ? "bg-yellow-100 text-yellow-700 border border-yellow-300 hover:bg-yellow-200"
              : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-300"
          }`}
        >
          {isMarkedForReview ? "⚠️ " : "🔖 "}
          {isMarkedForReview ? t("marked_for_review") : t("mark_for_review")}
        </button>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option) => {
          const isSelected = selectedAnswer.includes(option.id);
          const isCorrect = option.is_correct;
          const showCorrectness = showResult;

          let optionClass = "border-gray-300 hover:border-gray-400";
          let iconClass = "border-gray-400";

          if (isSelected && !showCorrectness) {
            optionClass = "border-[#118B50] bg-[#118B50]/10";
            iconClass = "border-[#118B50]";
          } else if (showCorrectness && isSelected && isCorrect) {
            optionClass = "border-green-500 bg-green-50";
            iconClass = "border-green-500";
          } else if (showCorrectness && isSelected && !isCorrect) {
            optionClass = "border-red-500 bg-red-50";
            iconClass = "border-red-500";
          } else if (showCorrectness && isCorrect) {
            optionClass = "border-green-500 bg-green-50";
            iconClass = "border-green-500";
          }

          return (
            <button
              key={option.id}
              onClick={() => onSelectAnswer(option.id)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all duration-200 ${optionClass} ${
                showResult ? "cursor-default" : "hover:shadow-md"
              }`}
            >
              <div className="flex items-start">
                {/* Selection indicator - use checkbox style for multiple, radio for single */}
                <div
                  className={`flex-shrink-0 w-6 h-6 mt-0.5 mr-3 flex items-center justify-center transition-all ${
                    hasMultipleCorrect
                      ? "rounded border-2" // Checkbox style
                      : "rounded-full border-2" // Radio style
                  } ${iconClass}`}
                >
                  {isSelected &&
                    (hasMultipleCorrect ? (
                      // Checkmark for multiple choice
                      <svg
                        className="w-4 h-4 text-[#118B50]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    ) : (
                      // Dot for single choice
                      <div className="w-3 h-3 rounded-full bg-[#118B50]" />
                    ))}
                </div>

                {/* Option text */}
                <div className="flex-1">
                  <span className="text-gray-900">{option.option_text}</span>

                  {/* Result indicators */}
                  {showCorrectness && (
                    <div className="mt-2 flex items-center space-x-2">
                      {isCorrect && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                          {t("correct_answer")}
                        </span>
                      )}
                      {isSelected && !isCorrect && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                          <svg
                            className="w-3 h-3 mr-1"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M6 18L18 6M6 6l12 12"
                            />
                          </svg>
                          {t("your_answer")}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Question Points Display */}
      {question.points > 1 && (
        <div className="mt-4 text-sm text-gray-500 text-right">
          {t("points")}: {question.points}
        </div>
      )}
    </div>
  );
}
