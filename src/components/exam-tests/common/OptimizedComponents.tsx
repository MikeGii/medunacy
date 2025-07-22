// src/components/exam-tests/common/OptimizedComponents.tsx

"use client";

import React, { memo } from "react";
import { Test, TestCategory, TestQuestion } from "@/types/exam";

// Optimized Category Card
export const CategoryCard = memo(
  ({
    category,
    isSelected,
    onClick,
  }: {
    category: TestCategory;
    isSelected: boolean;
    onClick: () => void;
  }) => {
    return (
      <button
        onClick={onClick}
        className={`group p-6 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
          isSelected
            ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-md"
            : "border-gray-200 hover:border-[#5DB996]/50 bg-white"
        }`}
      >
        <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-[#118B50] transition-colors">
          {category.name}
        </h3>
        {category.description && (
          <p className="text-sm text-gray-600 line-clamp-2">
            {category.description}
          </p>
        )}
      </button>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.category.id === nextProps.category.id &&
      prevProps.isSelected === nextProps.isSelected
    );
  }
);

CategoryCard.displayName = "CategoryCard";

// Optimized Test Card
export const TestCard = memo(
  ({
    test,
    isSelected,
    onClick,
    translations,
  }: {
    test: Test;
    isSelected: boolean;
    onClick: () => void;
    translations: {
      minutes: string;
      questions: string;
      to_pass: string;
    };
  }) => {
    return (
      <button
        onClick={onClick}
        className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
          isSelected
            ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
            : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
        }`}
      >
        <div className="flex justify-between items-start mb-4">
          <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#118B50] transition-colors flex-1">
            {test.title}
          </h3>
          {test.time_limit && (
            <span className="text-sm text-gray-500 ml-2">
              ⏱️ {test.time_limit} {translations.minutes}
            </span>
          )}
        </div>

        {test.description && (
          <p className="text-gray-600 mb-4 line-clamp-2">{test.description}</p>
        )}

        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500">
            📝 {test.question_count || 0} {translations.questions}
          </span>
          <span className="text-gray-500">
            ✓ {test.passing_score}% {translations.to_pass}
          </span>
        </div>
      </button>
    );
  },
  (prevProps, nextProps) => {
    return (
      prevProps.test.id === nextProps.test.id &&
      prevProps.isSelected === nextProps.isSelected &&
      prevProps.test.question_count === nextProps.test.question_count
    );
  }
);

TestCard.displayName = "TestCard";

// Optimized Question Card
export const QuestionCard = memo(
  ({
    question,
    index,
    onEdit,
    onDelete,
    onDuplicate,
    translations,
  }: {
    question: TestQuestion;
    index: number;
    onEdit: () => void;
    onDelete: () => void;
    onDuplicate: () => void;
    translations: {
      question: string; // ADD THIS LINE
      edit: string;
      delete: string;
      duplicate: string;
      points: string;
    };
  }) => {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow">
        <div className="flex justify-between items-start mb-4">
          <h4 className="font-semibold text-gray-900">
            {translations.question} {index + 1}
          </h4>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {question.points} {translations.points}
            </span>
            <button
              onClick={onEdit}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title={translations.edit}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                />
              </svg>
            </button>
            <button
              onClick={onDuplicate}
              className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
              title={translations.duplicate}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                />
              </svg>
            </button>
            <button
              onClick={onDelete}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              title={translations.delete}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </button>
          </div>
        </div>

        <p className="text-gray-700 mb-4">{question.question_text}</p>

        <div className="space-y-2">
          {question.options.map((option, idx) => (
            <div
              key={option.id}
              className={`px-4 py-2 rounded-lg ${
                option.is_correct
                  ? "bg-green-50 border border-green-200"
                  : "bg-gray-50 border border-gray-200"
              }`}
            >
              <span className="font-medium text-gray-600 mr-2">
                {String.fromCharCode(65 + idx)}.
              </span>
              {option.option_text}
              {option.is_correct && (
                <span className="ml-2 text-green-600">✓</span>
              )}
            </div>
          ))}
        </div>

        {question.explanation && (
          <div className="mt-4 p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <span className="font-medium">Explanation:</span>{" "}
              {question.explanation}
            </p>
          </div>
        )}
      </div>
    );
  }
);

QuestionCard.displayName = "QuestionCard";
