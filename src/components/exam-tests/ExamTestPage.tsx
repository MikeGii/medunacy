// src/components/exam-tests/ExamTestPage.tsx

"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useExamSession } from "@/hooks/useExamSession";
import ExamQuestion from "./ExamQuestion";
import ExamProgress from "./ExamProgress";
import ExamTimer from "./ExamTimer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useTranslations, useLocale } from "next-intl";

interface ExamTestPageProps {
  mode: "training" | "exam";
  year: number;
}

export default function ExamTestPage({ mode, year }: ExamTestPageProps) {
  const t = useTranslations("exam_tests");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  const {
    loading,
    error,
    sessionState,
    currentQuestion,
    selectedAnswer,
    isMarkedForReview,
    progress,
    timeElapsed,
    selectAnswer,
    goToNext,
    goToPrevious,
    goToQuestion,
    toggleMarkForReview,
    submitExam,
  } = useExamSession({
    mode,
    year,
    userId: user?.id || "",
  });

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/signin`);
    }
  }, [user, router, locale]);

  // Handle submit confirmation
  const handleSubmit = () => {
    const unanswered = progress.total - progress.answered;

    if (unanswered > 0) {
      const message = t("unanswered_warning", { count: unanswered });
      if (!confirm(`${message}\n\n${t("submit_confirm")}`)) {
        return;
      }
    } else if (!confirm(t("submit_confirm"))) {
      return;
    }

    submitExam();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push(`/${locale}/exam-tests`)}
            className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
          >
            {t("results.back_to_tests")}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Progress */}
            <div className="flex items-center space-x-4">
              <span className="font-semibold">
                {t("question")} {progress.current + 1} {t("of")}{" "}
                {progress.total}
              </span>
              {mode === "exam" && (
                <ExamTimer timeElapsed={timeElapsed} onTimeUp={submitExam} />
              )}
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              {t("submit_exam")}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Question Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <ExamQuestion
            question={currentQuestion}
            selectedAnswer={selectedAnswer}
            onSelectAnswer={(optionIndex) =>
              selectAnswer(currentQuestion.id, optionIndex)
            }
            showResult={mode === "training" && selectedAnswer !== undefined}
            isMarkedForReview={isMarkedForReview}
            onToggleMarkForReview={() =>
              toggleMarkForReview(currentQuestion.id)
            }
          />
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={goToPrevious}
            disabled={progress.current === 0}
            className={`px-4 py-2 rounded ${
              progress.current === 0
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            ← {t("previous")}
          </button>

          <button
            onClick={goToNext}
            disabled={progress.current === progress.total - 1}
            className={`px-4 py-2 rounded ${
              progress.current === progress.total - 1
                ? "bg-gray-300 cursor-not-allowed"
                : "bg-gray-200 hover:bg-gray-300"
            }`}
          >
            {t("next")} →
          </button>
        </div>

        {/* Progress Overview */}
        <ExamProgress
          progress={progress}
          onQuestionClick={goToQuestion}
          currentQuestionIndex={progress.current}
          answeredQuestions={sessionState?.answers || {}}
          markedQuestions={sessionState?.markedForReview || new Set()}
          questions={sessionState?.questions || []}
        />
      </div>
    </div>
  );
}
