// src/components/exam-tests/ExamTestPage.tsx - UPDATED

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
  testId: string; // Changed from year to testId
}

export default function ExamTestPage({ mode, testId }: ExamTestPageProps) {
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
    testId, // Changed from year to testId
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
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-[#118B50] font-medium mt-4">{t("loading_exam")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-red-200 p-8 max-w-md mx-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-red-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <p className="text-red-600 mb-6 font-medium">{error}</p>
          <button
            onClick={() => router.push(`/${locale}/exam-tests`)}
            className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
          >
            {t("back_to_tests")}
          </button>
        </div>
      </div>
    );
  }

  if (!currentQuestion) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
      {/* Modern Header */}
      <div className="bg-gradient-to-r from-white/90 to-[#FBF6E9]/90 backdrop-blur-sm border-b border-[#E3F0AF]/30 sticky top-0 z-10 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 py-4">
            {/* Left Section - Progress & Test Info */}
            <div className="flex items-center space-x-6">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-xl flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl font-bold text-[#118B50]">
                      {progress.current + 1} / {progress.total}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-medium ${
                        mode === "exam"
                          ? "bg-red-100 text-red-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {mode === "exam" ? t("exam_mode") : t("training_mode")}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600">
                    {sessionState?.test.title}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="hidden md:block w-48">
                <div className="bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-[#118B50] to-[#5DB996] h-3 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((progress.current + 1) / progress.total) * 100
                      }%`,
                    }}
                  />
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {progress.answered} {t("answered")} •{" "}
                  {progress.markedForReview} {t("flagged")}
                </div>
              </div>
            </div>

            {/* Right Section - Timer & Submit */}
            <div className="flex items-center space-x-4">
              {mode === "exam" && sessionState?.test.time_limit && (
                <div className="bg-white/80 rounded-xl px-4 py-2 border border-[#E3F0AF]/50">
                  <ExamTimer
                    timeElapsed={timeElapsed}
                    timeLimit={sessionState.test.time_limit * 60}
                    onTimeUp={submitExam}
                  />
                </div>
              )}

              <button
                onClick={handleSubmit}
                className="group px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
              >
                <span className="flex items-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {t("submit_exam")}
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Question Section - Left Side */}
          <div className="lg:col-span-3">
            {/* Question Card */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-6">
              <ExamQuestion
                question={currentQuestion}
                selectedAnswer={selectedAnswer} // Array of option IDs
                onSelectAnswer={(optionId: string) => selectAnswer(optionId)} // Fixed: only 1 argument
                showResult={mode === "training" && selectedAnswer.length > 0}
                isMarkedForReview={isMarkedForReview}
                onToggleMarkForReview={toggleMarkForReview} // Fixed: no arguments needed
              />
            </div>

            {/* Navigation */}
            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-6">
              <div className="flex justify-between items-center">
                <button
                  onClick={goToPrevious}
                  disabled={progress.current === 0}
                  className={`group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    progress.current === 0
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700 hover:from-[#E3F0AF] hover:to-[#5DB996]/20 hover:text-[#118B50] transform hover:scale-105 shadow-md hover:shadow-lg"
                  }`}
                >
                  <svg
                    className="w-5 h-5 mr-2"
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
                  {t("previous")}
                </button>

                {/* Question Counter */}
                <div className="text-center">
                  <div className="text-sm text-gray-500 mb-1">
                    {t("question")}
                  </div>
                  <div className="text-2xl font-bold text-[#118B50]">
                    {progress.current + 1}
                  </div>
                  <div className="text-sm text-gray-500">
                    {t("of")} {progress.total}
                  </div>
                </div>

                <button
                  onClick={goToNext}
                  disabled={progress.current === progress.total - 1}
                  className={`group flex items-center px-6 py-3 rounded-xl font-semibold transition-all duration-300 ${
                    progress.current === progress.total - 1
                      ? "bg-gray-200 text-gray-400 cursor-not-allowed"
                      : "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white hover:from-[#0A6B3B] hover:to-[#4A9B7E] transform hover:scale-105 shadow-md hover:shadow-lg"
                  }`}
                >
                  {t("next")}
                  <svg
                    className="w-5 h-5 ml-2"
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
            </div>
          </div>

          {/* Progress Section - Right Sidebar */}
          <div className="lg:col-span-1">
            <div className="sticky top-32">
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
        </div>
      </div>
    </div>
  );
}
