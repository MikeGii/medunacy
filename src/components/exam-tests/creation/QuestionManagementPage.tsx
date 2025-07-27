// src/components/exam-tests/creation/QuestionManagementPage.tsx - FIXED

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useExam } from "@/contexts/ExamContext";
import { useQuestionEditor } from "@/hooks/useQuestionEditor";
import Header from "../../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Test, TestQuestion, QuestionFormData } from "@/types/exam";
import QuestionEditor from "./QuestionEditor";
import { useAuthorization } from "@/hooks/useAuthorization";
import ExamErrorBoundary from "@/components/exam-tests/common/ExamErrorBoundary";
import ErrorDisplay from "../common/ErrorDisplay";
import { QuestionSkeleton } from "../common/ExamSkeleton";

interface QuestionManagementPageProps {
  testId: string;
}

export default function QuestionManagementPage({
  testId,
}: QuestionManagementPageProps) {
  const t = useTranslations("test_creation");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  const { currentTest, fetchTestById } = useExam();
  const {
    questions,
    loading,
    saving,
    error,
    fetchQuestions,
    createQuestion,
    updateQuestion,
    deleteQuestion,
    duplicateQuestion,
    clearError,
  } = useQuestionEditor({
    testId,
    onQuestionSaved: () => {
      // Optionally refresh test data to update question count
      fetchTestById(testId);
    },
  });

  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(
    null
  );

  const [deletingQuestionId, setDeletingQuestionId] = useState<string | null>(
    null
  );
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  // Handle click outside to cancel delete confirmation
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (confirmDeleteId) {
        const target = event.target as HTMLElement;
        if (!target.closest("button")) {
          setConfirmDeleteId(null);
        }
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [confirmDeleteId]);

  // Fetch test and questions on mount
  useEffect(() => {
    fetchTestById(testId);
    fetchQuestions();
  }, [testId, fetchTestById, fetchQuestions]);

  const handleCreateQuestion = async (data: QuestionFormData) => {
    const newQuestion = await createQuestion(data);
    if (newQuestion) {
      setIsCreating(false);
      setEditingQuestion(null);
    }
  };

  const handleUpdateQuestion = async (data: QuestionFormData) => {
    if (!editingQuestion) return;

    const updated = await updateQuestion(editingQuestion.id, data);
    if (updated) {
      setEditingQuestion(null);
      setIsCreating(false);
    }
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!confirmDeleteId || confirmDeleteId !== questionId) {
      // First click - show confirmation
      setConfirmDeleteId(questionId);
      return;
    }

    // Second click - perform deletion
    try {
      setDeletingQuestionId(questionId);
      await deleteQuestion(questionId);
      setConfirmDeleteId(null);
    } catch (error) {
      console.error("Failed to delete question:", error);
    } finally {
      setDeletingQuestionId(null);
    }
  };

  const handleCancelDelete = () => {
    setConfirmDeleteId(null);
  };

  const handleDuplicateQuestion = async (question: TestQuestion) => {
    await duplicateQuestion(question.id);
  };

  if (isLoading || (!currentTest && loading)) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <LoadingSpinner />
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  if (!currentTest) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-gray-600 mb-4">{t("test_not_found")}</p>
              <button
                onClick={() => router.push(`/${locale}/exam-tests/create`)}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300"
              >
                {t("back_to_tests")}
              </button>
            </div>
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  return (
    <AuthModalProvider>
      <ExamErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />

          <main className="py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
                <div className="flex-1">
                  {/* Enhanced Breadcrumb Navigation */}
                  <nav className="flex items-center space-x-2 text-sm mb-3">
                    <button
                      onClick={() =>
                        router.push(`/${locale}/exam-tests/create`)
                      }
                      className="flex items-center space-x-1 text-gray-600 hover:text-[#118B50] transition-colors group"
                    >
                      {/* Back arrow icon */}
                      <svg
                        className="w-4 h-4 group-hover:-translate-x-1 transition-transform"
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
                      <span className="underline underline-offset-2 decoration-gray-300 hover:decoration-[#118B50]">
                        {t("test_management")}
                      </span>
                    </button>

                    <svg
                      className="w-4 h-4 text-gray-400"
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

                    <span className="text-[#118B50] font-medium">
                      {t("question_management")}
                    </span>
                  </nav>

                  <h1 className="text-xl sm:text-2xl font-bold text-[#118B50] mb-1">
                    {t("manage_questions")}
                  </h1>
                  <p className="text-sm text-gray-600">
                    {currentTest.title} • {questions.length} {t("questions")}
                  </p>
                </div>

                {/* Create Question Button - moved here for better mobile layout */}
                {!isCreating && !editingQuestion && (
                  <button
                    onClick={() => setIsCreating(true)}
                    className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center justify-center space-x-2">
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
                          d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                        />
                      </svg>
                      <span>{t("create_question")}</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Error Display */}
              {error && (
                <ErrorDisplay
                  error={error}
                  onDismiss={clearError}
                  className="mb-6"
                />
              )}

              {/* Question Editor */}
              {(isCreating || editingQuestion) && (
                <div className="mb-8">
                  <QuestionEditor
                    question={editingQuestion}
                    onSave={
                      editingQuestion
                        ? handleUpdateQuestion
                        : handleCreateQuestion
                    }
                    onCancel={() => {
                      setIsCreating(false);
                      setEditingQuestion(null);
                    }}
                    isSaving={saving}
                  />
                </div>
              )}

              {/* Questions List - Compact with answers on separate rows */}
              <div className="space-y-3">
                {loading ? (
                  <>
                    <QuestionSkeleton />
                    <QuestionSkeleton />
                    <QuestionSkeleton />
                  </>
                ) : questions.length === 0 ? (
                  <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
                    <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                      <svg
                        className="w-8 h-8 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {t("no_questions")}
                    </h3>
                    <p className="text-gray-500 text-sm">
                      {t("no_questions_description")}
                    </p>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    {questions.map((question, index) => (
                      <div
                        key={question.id}
                        className={`p-4 hover:bg-gray-50 transition-colors ${
                          index !== questions.length - 1
                            ? "border-b border-gray-200"
                            : ""
                        }`}
                      >
                        {/* Header row with question info and actions */}
                        <div className="flex items-start gap-4 mb-3">
                          {/* Question number and text */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-baseline gap-2">
                              <span className="font-semibold text-gray-900 text-sm flex-shrink-0">
                                {t("question")} {index + 1}
                              </span>
                              <span className="text-gray-500 text-xs">
                                ({question.points}{" "}
                                {question.points === 1
                                  ? t("point")
                                  : t("points")}
                                )
                              </span>
                            </div>
                            <p className="text-gray-700 text-sm mt-1">
                              {question.question_text}
                            </p>
                            {/* Show actual explanation if it exists */}
                            {question.explanation && (
                              <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                                <div className="flex items-start gap-1">
                                  <svg
                                    className="w-3 h-3 text-blue-600 mt-0.5 flex-shrink-0"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path
                                      fillRule="evenodd"
                                      d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                                      clipRule="evenodd"
                                    />
                                  </svg>
                                  <p className="text-xs text-blue-700">
                                    <span className="font-medium">
                                      {t("explanation")}:
                                    </span>{" "}
                                    {question.explanation}
                                  </p>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action buttons - compact */}
                          <div className="flex items-center gap-1 flex-shrink-0">
                            <button
                              onClick={() => setEditingQuestion(question)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title={t("edit")}
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
                              onClick={() => handleDuplicateQuestion(question)}
                              className="p-1.5 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
                              title={t("duplicate")}
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

                            {/* Delete with inline confirmation */}
                            {confirmDeleteId === question.id ? (
                              <>
                                <button
                                  onClick={() =>
                                    handleDeleteQuestion(question.id)
                                  }
                                  disabled={deletingQuestionId === question.id}
                                  className="p-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                                  title={t("confirm_delete")}
                                >
                                  {deletingQuestionId === question.id ? (
                                    <LoadingSpinner />
                                  ) : (
                                    <span className="text-xs">✓</span>
                                  )}
                                </button>
                                <button
                                  onClick={handleCancelDelete}
                                  className="p-1.5 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                                  title={t("cancel")}
                                >
                                  <span className="text-xs">✕</span>
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setConfirmDeleteId(question.id)}
                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                title={t("delete")}
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
                            )}
                          </div>
                        </div>

                        {/* Answer options - each on separate row */}
                        <div className="space-y-1 ml-4">
                          {question.options.map((option, idx) => (
                            <div
                              key={option.id}
                              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm ${
                                option.is_correct
                                  ? "bg-green-50 text-green-700"
                                  : "bg-gray-50 text-gray-600"
                              }`}
                            >
                              <span className="font-medium">
                                {String.fromCharCode(65 + idx)}.
                              </span>
                              <span className="flex-1">
                                {option.option_text}
                              </span>
                              {option.is_correct && (
                                <svg
                                  className="w-4 h-4 flex-shrink-0"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </ExamErrorBoundary>
    </AuthModalProvider>
  );
}
