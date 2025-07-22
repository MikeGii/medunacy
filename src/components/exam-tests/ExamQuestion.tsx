// src/components/exam-tests/ExamQuestion.tsx - REFACTORED

"use client";

import { memo } from "react";
import { TestQuestion } from "@/types/exam";
import { useTranslations } from "next-intl";

interface ExamQuestionProps {
  question: TestQuestion;
  selectedAnswers: string[];
  onSelectAnswer: (optionId: string) => void;
  isMarkedForReview: boolean;
  onToggleMarkForReview: () => void;
  showCorrectAnswers: boolean;
  questionNumber: number;
}

const ExamQuestion = memo(
  ({
    question,
    selectedAnswers,
    onSelectAnswer,
    isMarkedForReview,
    onToggleMarkForReview,
    showCorrectAnswers,
    questionNumber,
  }: ExamQuestionProps) => {
    const t = useTranslations("exam_tests");

    const hasMultipleCorrect =
      question.options.filter((opt) => opt.is_correct).length > 1;

    return (
      <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
        {/* Question Header */}
        <div className="bg-gradient-to-r from-[#118B50] to-[#5DB996] p-6">
          <div className="flex justify-between items-start">
            <div>
              <div className="flex items-center space-x-3">
                <span className="text-white/80 text-sm font-medium">
                  {t("question")} {questionNumber}
                </span>
                <span className="text-white/60">•</span>
                <span className="text-white/80 text-sm">
                  {question.points} {t("points")}
                </span>
                {hasMultipleCorrect && (
                  <>
                    <span className="text-white/60">•</span>
                    <span className="bg-white/20 text-white text-xs px-2 py-1 rounded-full">
                      {t("multiple_answers_allowed")}
                    </span>
                  </>
                )}
              </div>
              <h2 className="text-xl font-semibold text-white mt-2">
                {question.question_text}
              </h2>
            </div>

            <button
              onClick={onToggleMarkForReview}
              className={`p-3 rounded-lg transition-all ${
                isMarkedForReview
                  ? "bg-yellow-400 text-yellow-900 hover:bg-yellow-300"
                  : "bg-white/20 text-white hover:bg-white/30"
              }`}
              title={
                isMarkedForReview
                  ? t("marked_for_review")
                  : t("mark_for_review")
              }
            >
              <svg
                className="w-5 h-5"
                fill={isMarkedForReview ? "currentColor" : "none"}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6">
          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => {
              const isSelected = selectedAnswers.includes(option.id);
              const showAsCorrect = showCorrectAnswers && option.is_correct;
              const showAsIncorrect =
                showCorrectAnswers && isSelected && !option.is_correct;

              return (
                <button
                  key={option.id}
                  onClick={() => onSelectAnswer(option.id)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all transform hover:scale-[1.01] ${
                    isSelected
                      ? showAsIncorrect
                        ? "border-red-500 bg-red-50"
                        : "border-[#118B50] bg-[#E3F0AF]/20"
                      : showAsCorrect
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 hover:border-gray-300 bg-white"
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-medium ${
                        isSelected
                          ? showAsIncorrect
                            ? "bg-red-500 text-white"
                            : "bg-[#118B50] text-white"
                          : showAsCorrect
                          ? "bg-green-500 text-white"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {String.fromCharCode(65 + index)}
                    </div>
                    <div className="flex-1">
                      <p
                        className={`${
                          isSelected || showAsCorrect ? "font-medium" : ""
                        } text-gray-900`}
                      >
                        {option.option_text}
                      </p>
                      {/* Only show correct/incorrect indicators when showCorrectAnswers is true */}
                      {showCorrectAnswers && (
                        <div className="mt-1">
                          {option.is_correct && (
                            <span className="text-green-600 text-sm flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              {t("correct_answer")}
                            </span>
                          )}
                          {isSelected && !option.is_correct && (
                            <span className="text-red-600 text-sm flex items-center">
                              <svg
                                className="w-4 h-4 mr-1"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                                  clipRule="evenodd"
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

          {/* Explanation (Training Mode) */}
          {showCorrectAnswers &&
            question.explanation &&
            selectedAnswers.length > 0 && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
                <div className="flex items-start space-x-2">
                  <svg
                    className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <div>
                    <h4 className="font-medium text-blue-900 mb-1">
                      {t("explanation")}
                    </h4>
                    <p className="text-blue-800">{question.explanation}</p>
                  </div>
                </div>
              </div>
            )}
        </div>
      </div>
    );
  }
);

ExamQuestion.displayName = "ExamQuestion";

export default ExamQuestion;
