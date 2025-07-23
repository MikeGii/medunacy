// src/components/exam-tests/results/QuestionDetailModal.tsx

"use client";

import { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";

interface QuestionDetailModalProps {
  isOpen: boolean;
  questionNumber: number;
  result: {
    question: any;
    selectedOptions: any[];
    correctOptions: any[];
    isCorrect: boolean;
    pointsEarned: number;
  };
  onClose: () => void;
}

export default function QuestionDetailModal({
  isOpen,
  questionNumber,
  result,
  onClose,
}: QuestionDetailModalProps) {
  const t = useTranslations("exam_tests.results");
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
        >
          {/* Header */}
          <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                    result.isCorrect ? "bg-green-500" : "bg-red-500"
                  }`}
                >
                  {questionNumber}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  {t("question")} {questionNumber}
                </h3>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
              >
                <svg
                  className="w-5 h-5 text-gray-600"
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
              </button>
            </div>
          </div>

          {/* Content */}
          <div className="px-6 py-4">
            {/* Question Text */}
            <div className="mb-6">
              <p className="text-gray-800 text-lg">{result.question.question_text}</p>
            </div>

            {/* Points */}
            <div className="mb-6">
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  result.isCorrect
                    ? "bg-green-100 text-green-800"
                    : "bg-red-100 text-red-800"
                }`}
              >
                {result.pointsEarned}/{result.question.points} {t("points")}
              </span>
            </div>

            {/* Your Answer */}
            {result.selectedOptions.length > 0 && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {t("your_answer")}:
                </h4>
                <div className="space-y-2">
                  {result.selectedOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg border-2 ${
                        option.is_correct
                          ? "bg-green-50 border-green-300"
                          : "bg-red-50 border-red-300"
                      }`}
                    >
                      <div className="flex items-center">
                        <div
                          className={`w-5 h-5 mr-2 rounded-full ${
                            option.is_correct ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <svg
                            className="w-5 h-5 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            {option.is_correct ? (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            ) : (
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M6 18L18 6M6 6l12 12"
                              />
                            )}
                          </svg>
                        </div>
                        <span className="text-gray-800">{option.option_text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Correct Answer (if wrong) */}
            {!result.isCorrect && (
              <div className="mb-6">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">
                  {t("correct_answer")}:
                </h4>
                <div className="space-y-2">
                  {result.correctOptions.map((option, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg bg-green-50 border-2 border-green-300"
                    >
                      <div className="flex items-center">
                        <div className="w-5 h-5 mr-2 rounded-full bg-green-500">
                          <svg
                            className="w-5 h-5 text-white"
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
                        </div>
                        <span className="text-gray-800">{option.option_text}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Explanation */}
            {result.question.explanation && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="text-sm font-semibold text-blue-900 mb-1">
                  {t("explanation")}:
                </h4>
                <p className="text-sm text-blue-800">{result.question.explanation}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Create portal for modal
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}