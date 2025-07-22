// src/components/exam-tests/creation/QuestionManagementPage.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Test, TestQuestion, QuestionFormData } from "@/types/exam";
import QuestionEditor from "./QuestionEditor";
import { useAuthorization } from "@/hooks/useAuthorization";

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

  const [test, setTest] = useState<Test | null>(null);
  const [questions, setQuestions] = useState<TestQuestion[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<TestQuestion | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  // Fetch test and questions
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch test details
        const testResponse = await fetch(
          `/api/tests/${testId}?include_unpublished=true`
        );
        const testData = await testResponse.json();

        if (!testResponse.ok) {
          throw new Error(testData.error || "Test not found");
        }

        if (testData.success) {
          setTest(testData.data);
          setQuestions(testData.data.questions || []);
        }
      } catch (err) {
        console.error("Error fetching test:", err);
        setError(err instanceof Error ? err.message : "Failed to load test");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchData();
    }
  }, [testId, isAuthorized]);

  const refreshQuestions = async () => {
    try {
      const response = await fetch(`/api/tests/${testId}/questions`);
      const data = await response.json();
      if (data.success) {
        setQuestions(data.data);
      }
    } catch (err) {
      console.error("Error refreshing questions:", err);
    }
  };

  const handleCreateQuestion = async (questionData: QuestionFormData) => {
    try {
      const response = await fetch(`/api/tests/${testId}/questions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          question_text: questionData.question_text,
          explanation: questionData.explanation,
          points: questionData.points,
          question_order: questions.length + 1,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to create question");
      }

      const questionId = data.data.id;

      // Create options
      for (let i = 0; i < questionData.options.length; i++) {
        const option = questionData.options[i];
        await fetch(`/api/tests/${testId}/questions/${questionId}/options`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            option_text: option.option_text,
            is_correct: option.is_correct,
            option_order: i + 1,
          }),
        });
      }

      await refreshQuestions();
      setIsCreating(false);
    } catch (err) {
      console.error("Error creating question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to create question"
      );
    }
  };

  const handleDeleteQuestion = async (question: TestQuestion) => {
    if (!confirm(t("confirm_delete_question"))) {
      return;
    }

    try {
      const response = await fetch(
        `/api/tests/${testId}/questions/${question.id}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete question");
      }

      await refreshQuestions();
    } catch (err) {
      console.error("Error deleting question:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete question"
      );
    }
  };

  // Show loading while checking authorization
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner />
          <p className="text-[#118B50] font-medium mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  // Don't render if user doesn't have access
  if (!isAuthorized) {
    return null;
  }

  if (loading) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <LoadingSpinner />
              <p className="text-[#118B50] font-medium mt-4">{t("loading")}</p>
            </div>
          </div>
        </div>
      </AuthModalProvider>
    );
  }

  if (error || !test) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
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
              <p className="text-red-600 mb-6 font-medium">
                {error || t("test_not_found")}
              </p>
              <button
                onClick={() => router.push(`/${locale}/exam-tests/create`)}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
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
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Content */}
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center space-x-4 mb-4">
                <button
                  onClick={() => router.push(`/${locale}/exam-tests/create`)}
                  className="p-2 text-gray-600 hover:text-[#118B50] hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg
                    className="w-6 h-6"
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
                </button>
                <div>
                  <h1 className="text-3xl font-bold text-[#118B50]">
                    {t("manage_questions")}
                  </h1>
                  <p className="text-xl text-gray-600">{test.title}</p>
                </div>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-xl border border-[#E3F0AF]/30 p-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-500">{t("category")}:</span>
                    <div className="font-medium">{test.category?.name}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("questions")}:</span>
                    <div className="font-medium">{questions.length}</div>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("status")}:</span>
                    <div
                      className={`font-medium ${
                        test.is_published ? "text-green-600" : "text-yellow-600"
                      }`}
                    >
                      {test.is_published ? t("published") : t("draft")}
                    </div>
                  </div>
                  <div>
                    <span className="text-gray-500">{t("passing_score")}:</span>
                    <div className="font-medium">{test.passing_score}%</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Questions Management */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-[#118B50]">
                  {t("questions")}
                </h2>
                {!isCreating && !editingQuestion && (
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
                      <span>{t("add_question")}</span>
                    </div>
                  </button>
                )}
              </div>

              {/* Question Editor */}
              {(isCreating || editingQuestion) && (
                <QuestionEditor
                  question={editingQuestion}
                  onSave={handleCreateQuestion}
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingQuestion(null);
                  }}
                />
              )}

              {/* Questions List */}
              <div className="space-y-6">
                {questions.length === 0 ? (
                  <div className="text-center py-12">
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
                    <div
                      key={question.id}
                      className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 p-6"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className="text-lg font-bold text-[#118B50]">
                              {index + 1}.
                            </span>
                            <span className="text-sm text-gray-500">
                              {question.points}{" "}
                              {question.points === 1 ? t("point") : t("points")}
                            </span>
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-3">
                            {question.question_text}
                          </h3>

                          {/* Options */}
                          <div className="space-y-2">
                            {question.options.map((option, optionIndex) => (
                              <div
                                key={option.id}
                                className={`flex items-center space-x-2 p-2 rounded ${
                                  option.is_correct
                                    ? "bg-green-100 border border-green-200"
                                    : "bg-white border border-gray-200"
                                }`}
                              >
                                <span className="text-sm font-medium text-gray-500">
                                  {String.fromCharCode(65 + optionIndex)}.
                                </span>
                                <span className="flex-1 text-sm">
                                  {option.option_text}
                                </span>
                                {option.is_correct && (
                                  <span className="text-green-600">
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
                                        d="M5 13l4 4L19 7"
                                      />
                                    </svg>
                                  </span>
                                )}
                              </div>
                            ))}
                          </div>

                          {question.explanation && (
                            <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                              <p className="text-sm text-blue-700">
                                <strong>{t("explanation")}:</strong>{" "}
                                {question.explanation}
                              </p>
                            </div>
                          )}
                        </div>

                        <div className="flex space-x-2">
                          <button
                            onClick={() => setEditingQuestion(question)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={t("edit")}
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
                                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                              />
                            </svg>
                          </button>

                          <button
                            onClick={() => handleDeleteQuestion(question)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title={t("delete")}
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
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}
