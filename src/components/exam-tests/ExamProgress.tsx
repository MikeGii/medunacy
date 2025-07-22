// src/components/exam-tests/ExamProgress.tsx

"use client";

import { ExamQuestion } from '@/types/exam';

interface ExamProgressProps {
  progress: {
    current: number;
    total: number;
    answered: number;
    markedForReview: number;
  };
  onQuestionClick: (index: number) => void;
  currentQuestionIndex: number;
  answeredQuestions: Record<string, number>;
  markedQuestions: Set<string>;
  questions: ExamQuestion[];
}

export default function ExamProgress({
  progress,
  onQuestionClick,
  currentQuestionIndex,
  answeredQuestions,
  markedQuestions,
  questions,
}: ExamProgressProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h3 className="font-semibold mb-4">Progress Overview</h3>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-4 text-sm">
        <div className="text-center">
          <div className="font-semibold text-green-600">
            {progress.answered}
          </div>
          <div className="text-gray-500">Answered</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-gray-600">
            {progress.total - progress.answered}
          </div>
          <div className="text-gray-500">Remaining</div>
        </div>
        <div className="text-center">
          <div className="font-semibold text-yellow-600">
            {progress.markedForReview}
          </div>
          <div className="text-gray-500">For Review</div>
        </div>
      </div>

      {/* Question Grid */}
      <div className="grid grid-cols-10 gap-2">
        {questions.map((question, i) => {
          const questionNumber = i + 1;
          const isAnswered = answeredQuestions.hasOwnProperty(question.id);
          const isCurrent = i === currentQuestionIndex;
          const isMarked = markedQuestions.has(question.id);

          let className = "w-full aspect-square rounded text-xs font-medium ";

          if (isCurrent) {
            className += "bg-[#118B50] text-white";
          } else if (isMarked) {
            className +=
              "bg-yellow-200 text-yellow-800 border-2 border-yellow-400";
          } else if (isAnswered) {
            className += "bg-green-100 text-green-700";
          } else {
            className += "bg-gray-100 text-gray-500";
          }

          return (
            <button
              key={i}
              onClick={() => onQuestionClick(i)}
              className={className}
            >
              {questionNumber}
            </button>
          );
        })}
      </div>
    </div>
  );
}
