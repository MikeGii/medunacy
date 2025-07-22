// src/components/exam-tests/ExamQuestion.tsx

'use client';

import { ExamQuestion as ExamQuestionType } from '@/types/exam';
import { useTranslations } from 'next-intl';

interface ExamQuestionProps {
  question: ExamQuestionType;
  selectedAnswer?: number;
  onSelectAnswer: (optionIndex: number) => void;
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
  onToggleMarkForReview
}: ExamQuestionProps) {
  const t = useTranslations('exam_tests');

  return (
    <div>
      {/* Question Header */}
      <div className="flex justify-between items-start mb-6">
        <h2 className="text-lg font-medium text-gray-900 flex-1">
          {question.questionText}
        </h2>
        <button
          onClick={onToggleMarkForReview}
          className={`ml-4 px-3 py-1 text-sm rounded ${
            isMarkedForReview
              ? 'bg-yellow-100 text-yellow-700 border border-yellow-300'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          {isMarkedForReview ? '⚠️ ' : '🔖 '}
          {isMarkedForReview ? t('marked_for_review') : t('mark_for_review')}
        </button>
      </div>

      {/* Options */}
      <div className="space-y-3">
        {question.options.map((option, index) => {
          const isSelected = selectedAnswer === index;
          const isCorrect = option.isCorrect;
          const showCorrectness = showResult && selectedAnswer !== undefined;

          let optionClass = 'border-gray-300 hover:border-gray-400';
          
          if (isSelected && !showCorrectness) {
            optionClass = 'border-[#118B50] bg-[#118B50]/10';
          } else if (showCorrectness && isSelected && isCorrect) {
            optionClass = 'border-green-500 bg-green-50';
          } else if (showCorrectness && isSelected && !isCorrect) {
            optionClass = 'border-red-500 bg-red-50';
          } else if (showCorrectness && isCorrect) {
            optionClass = 'border-green-500 bg-green-50';
          }

          return (
            <button
              key={index}
              onClick={() => onSelectAnswer(index)}
              disabled={showResult}
              className={`w-full text-left p-4 rounded-lg border-2 transition-all ${optionClass}`}
            >
              <div className="flex items-center">
                <div className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                  isSelected ? 'border-[#118B50]' : 'border-gray-400'
                }`}>
                  {isSelected && (
                    <div className="w-3 h-3 rounded-full bg-[#118B50]" />
                  )}
                </div>
                <span className="flex-1">{option.text}</span>
                {showCorrectness && (
                  <span className="ml-2">
                    {isCorrect ? '✅' : isSelected ? '❌' : ''}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}