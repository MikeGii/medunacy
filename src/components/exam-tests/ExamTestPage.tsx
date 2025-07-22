// src/components/exam-tests/ExamTestPage.tsx - REFACTORED

"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useExamSession } from "@/hooks/useExamSession";
import ExamQuestion from "./ExamQuestion";
import ExamProgress from "./ExamProgress";
import ExamTimer from "./ExamTimer";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useTranslations, useLocale } from "next-intl";
import ExamErrorBoundary from "@/components/exam-tests/common/ExamErrorBoundary";
import ErrorDisplay from "./common/ErrorDisplay";
import ConfirmationModal from "./common/ConfirmationModal";
import { ExamSessionSkeleton } from "./common/ExamSkeleton";

interface ExamTestPageProps {
  mode: "training" | "exam";
  testId: string;
}

export default function ExamTestPage({ mode, testId }: ExamTestPageProps) {
  const t = useTranslations("exam_tests");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  const [showConfirmSubmit, setShowConfirmSubmit] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);

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
    testId,
    userId: user?.id || "",
  });

  // Redirect if no user
  useEffect(() => {
    if (!user) {
      router.push(`/${locale}/auth/signin`);
    }
  }, [user, router, locale]);

  // Prevent accidental navigation
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (sessionState && !sessionState.session.completed_at) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [sessionState]);

  // Handle submit
  const handleSubmit = () => {
    const unanswered = progress.total - progress.answered;

    if (unanswered > 0) {
      setShowConfirmSubmit(true);
    } else {
      submitExam();
    }
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) return;

      switch (e.key) {
        case "ArrowLeft":
          goToPrevious();
          break;
        case "ArrowRight":
          goToNext();
          break;
        case "m":
        case "M":
          toggleMarkForReview();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [goToNext, goToPrevious, toggleMarkForReview]);

  if (loading) {
    return (
      <ExamErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <div className="max-w-6xl mx-auto px-4 py-8">
            <ExamSessionSkeleton />
          </div>
        </div>
      </ExamErrorBoundary>
    );
  }

  if (error || !sessionState) {
    return (
      <ExamErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <ErrorDisplay
                error={error || t("errors.session_not_found")}
                type="error"
              />
              <button
                onClick={() => router.push(`/${locale}/exam-tests`)}
                className="mt-4 px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300"
              >
                {t("back_to_tests")}
              </button>
            </div>
          </div>
        </div>
      </ExamErrorBoundary>
    );
  }

  return (
    <ExamErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        {/* Header Bar */}
        <div className="bg-white shadow-md sticky top-0 z-40">
          <div className="max-w-6xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              {/* Left Section - Test Info */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowExitConfirm(true)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  title={t("exit_exam")}
                >
                  <svg
                    className="w-6 h-6 text-gray-600"
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

                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-lg font-semibold text-gray-900">
                      {sessionState.test.title}
                    </h1>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        mode === "exam"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {mode === "exam" ? t("exam_mode") : t("training_mode")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {t("question")} {progress.current + 1} {t("of")}{" "}
                    {progress.total}
                  </div>
                </div>
              </div>

              {/* Center Section - Progress */}
              <div className="hidden md:block flex-1 max-w-md mx-8">
                <ExamProgress
                  current={progress.current}
                  total={progress.total}
                  answered={progress.answered}
                  markedForReview={progress.markedForReview}
                />
              </div>

              {/* Right Section - Timer & Submit */}
              <div className="flex items-center space-x-4">
                {mode === "exam" && sessionState.test.time_limit && (
                  <ExamTimer
                    timeElapsed={timeElapsed}
                    timeLimit={sessionState.test.time_limit * 60}
                    onTimeUp={submitExam}
                  />
                )}

                <button
                  onClick={handleSubmit}
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 shadow-lg"
                >
                  {t("submit_exam")}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          {/* Error Display */}
          {error && (
            <ErrorDisplay error={error} type="error" className="mb-6" />
          )}

          {/* Question Card */}
          {currentQuestion && (
            <ExamQuestion
              question={currentQuestion}
              selectedAnswers={selectedAnswer}
              onSelectAnswer={selectAnswer}
              isMarkedForReview={isMarkedForReview}
              onToggleMarkForReview={toggleMarkForReview}
              showCorrectAnswers={
                mode === "training" &&
                sessionState.test.show_correct_answers_in_training &&
                selectedAnswer.length > 0 // Only show after answering
              }
              questionNumber={progress.current + 1}
            />
          )}

          {/* Navigation */}
          <div className="flex justify-between items-center mt-8">
            <button
              onClick={goToPrevious}
              disabled={progress.current === 0}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                progress.current === 0
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-white border-2 border-gray-300 text-gray-700 hover:border-[#118B50] hover:text-[#118B50]"
              }`}
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 19l-7-7 7-7"
                />
              </svg>
              <span>{t("previous")}</span>
            </button>

            {/* Question Navigator */}
            <div className="flex items-center space-x-2">
              {(() => {
                const totalQuestions = progress.total;
                const currentIndex = progress.current;

                // Show up to 5 questions centered around current
                const maxVisible = 5;
                const halfWindow = Math.floor(maxVisible / 2);

                // Calculate start and end indices
                let start = Math.max(0, currentIndex - halfWindow);
                let end = Math.min(totalQuestions - 1, start + maxVisible - 1);

                // Adjust start if we're near the end
                if (end - start + 1 < maxVisible) {
                  start = Math.max(0, end - maxVisible + 1);
                }

                const buttons = [];

                // Add "..." at the beginning if needed
                if (start > 0) {
                  buttons.push(
                    <span key="dots-start" className="text-gray-500 px-1">
                      ...
                    </span>
                  );
                }

                // Add question buttons
                for (let i = start; i <= end; i++) {
                  const question = sessionState.questions[i];
                  if (!question) continue;

                  const isAnswered =
                    !!sessionState.answers[question.id]?.length;
                  const isMarked = sessionState.markedForReview.has(
                    question.id
                  );
                  const isCurrent = i === currentIndex;

                  buttons.push(
                    <button
                      key={`q-${question.id}`} // Use question ID for unique key
                      onClick={() => goToQuestion(i)}
                      className={`w-10 h-10 rounded-lg font-medium transition-all ${
                        isCurrent
                          ? "bg-[#118B50] text-white"
                          : isAnswered
                          ? "bg-green-100 text-green-800 hover:bg-green-200"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      } ${isMarked ? "ring-2 ring-yellow-400" : ""}`}
                      title={`${t("question")} ${i + 1}`}
                    >
                      {i + 1}
                    </button>
                  );
                }

                // Add "..." at the end if needed
                if (end < totalQuestions - 1) {
                  buttons.push(
                    <span key="dots-end" className="text-gray-500 px-1">
                      ... +{totalQuestions - end - 1}
                    </span>
                  );
                }

                return buttons;
              })()}
            </div>

            <button
              onClick={goToNext}
              disabled={progress.current === progress.total - 1}
              className={`flex items-center space-x-2 px-6 py-3 rounded-xl font-semibold transition-all ${
                progress.current === progress.total - 1
                  ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white hover:from-[#0A6B3B] hover:to-[#4A9B7E]"
              }`}
            >
              <span>{t("next")}</span>
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
          </div>

          {/* Keyboard shortcuts hint */}
          <div className="mt-8 text-center text-sm text-gray-500">
            {t("keyboard_shortcuts")}: ← {t("previous")} | → {t("next")} | M{" "}
            {t("mark_for_review")}
          </div>
        </div>

        {/* Submit Confirmation Modal */}
        <ConfirmationModal
          isOpen={showConfirmSubmit}
          title={t("submit_exam")}
          message={
            progress.answered < progress.total
              ? t("unanswered_warning", {
                  count: (progress.total - progress.answered).toString(),
                })
              : t("submit_confirm")
          }
          confirmText={t("submit")}
          cancelText={t("continue_exam")}
          type="warning"
          onConfirm={() => {
            setShowConfirmSubmit(false);
            submitExam();
          }}
          onCancel={() => setShowConfirmSubmit(false)}
        />

        {/* Exit Confirmation Modal */}
        <ConfirmationModal
          isOpen={showExitConfirm}
          title={t("exit_exam_title")}
          message={t("exit_exam_message")}
          confirmText={t("exit")}
          cancelText={t("stay")}
          type="danger"
          onConfirm={() => {
            router.push(`/${locale}/exam-tests`);
          }}
          onCancel={() => setShowExitConfirm(false)}
        />
      </div>
    </ExamErrorBoundary>
  );
}
