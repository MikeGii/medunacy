// src/components/exam-tests/creation/QuestionManagementPage.tsx - REFACTORED

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
import { QuestionCard } from "../common/OptimizedComponents";
import { QuestionSkeleton } from "../common/ExamSkeleton";
import ConfirmationModal from "../common/ConfirmationModal";

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
  const [deleteConfirm, setDeleteConfirm] = useState<TestQuestion | null>(null);

  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["doctor", "admin"],
    redirectOnUnauthorized: true,
  });

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

  const handleDeleteQuestion = async () => {
    if (!deleteConfirm) return;

    const success = await deleteQuestion(deleteConfirm.id);
    if (success) {
      setDeleteConfirm(null);
    }
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
              <div className="mb-8">
                <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
                  <button
                    onClick={() => router.push(`/${locale}/exam-tests/create`)}
                    className="hover:text-[#118B50] transition-colors"
                  >
                    {t("test_management")}
                  </button>
                  <span>→</span>
                  <span className="text-[#118B50] font-medium">
                    {t("question_management")}
                  </span>
                </nav>

                <div className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
                  <h1 className="text-3xl md:text-4xl font-bold mb-2">
                    {t("manage_questions")}
                  </h1>
                </div>
                <p className="text-xl text-gray-600">
                  {currentTest.title} • {questions.length} {t("questions")}
                </p>
              </div>

              {/* Error Display */}
              {error && (
                <ErrorDisplay
                  error={error}
                  onDismiss={clearError}
                  className="mb-6"
                />
              )}

              {/* Create Question Button */}
              {!isCreating && !editingQuestion && (
                <div className="mb-6">
                  <button
                    onClick={() => setIsCreating(true)}
                    className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-2">
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
                </div>
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

              {/* Questions List */}
              <div className="space-y-6">
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
                    <p className="text-gray-500">
                      {t("no_questions_description")}
                    </p>
                  </div>
                ) : (
                  questions.map((question, index) => (
                    <QuestionCard
                      key={question.id}
                      question={question}
                      index={index}
                      onEdit={() => setEditingQuestion(question)}
                      onDelete={() => setDeleteConfirm(question)}
                      onDuplicate={() => handleDuplicateQuestion(question)}
                      translations={{
                        question: t("question"),
                        edit: t("edit"),
                        delete: t("delete"),
                        duplicate: t("duplicate"),
                        points: t("points"),
                      }}
                    />
                  ))
                )}
              </div>
            </div>
          </main>
        </div>

        {/* Delete Confirmation Modal */}
        <ConfirmationModal
          isOpen={!!deleteConfirm}
          title={t("delete_question_title")}
          message={t("delete_question_message")}
          confirmText={t("delete")}
          cancelText={t("cancel")}
          type="danger"
          onConfirm={handleDeleteQuestion}
          onCancel={() => setDeleteConfirm(null)}
        />
      </ExamErrorBoundary>
    </AuthModalProvider>
  );
}
