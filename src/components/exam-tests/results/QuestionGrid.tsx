// src/components/exam-tests/results/QuestionGrid.tsx

"use client";

import { useState } from "react";
import QuestionDetailModal from "./QuestionDetailModal";

interface QuestionGridProps {
  questionResults: Array<{
    question: any;
    selectedOptions: any[];
    correctOptions: any[];
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

export default function QuestionGrid({ questionResults }: QuestionGridProps) {
  const [selectedQuestion, setSelectedQuestion] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-6 sm:grid-cols-10 md:grid-cols-12 gap-2">
        {questionResults.map((result, index) => (
          <button
            key={index}
            onClick={() => setSelectedQuestion(index)}
            className={`
              aspect-square rounded-md flex items-center justify-center font-medium text-xs
              transition-all duration-200 transform hover:scale-105 hover:shadow-md
              ${
                result.isCorrect
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : "bg-rose-600 text-white hover:bg-rose-700"
              }
            `}
          >
            {index + 1}
          </button>
        ))}
      </div>

      {selectedQuestion !== null && (
        <QuestionDetailModal
          isOpen={true}
          questionNumber={selectedQuestion + 1}
          result={questionResults[selectedQuestion]}
          onClose={() => setSelectedQuestion(null)}
        />
      )}
    </>
  );
}
