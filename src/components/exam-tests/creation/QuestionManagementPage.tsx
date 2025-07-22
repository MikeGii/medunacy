// src/components/exam-tests/creation/QuestionManagementPage.tsx - FIX TypeScript errors

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
import { supabase } from "@/lib/supabase";

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

  // Fetch test and questions using Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch test details with questions and options using Supabase
        const { data: testData, error: testError } = await supabase
          .from("tests")
          .select(
            `
            *,
            category:test_categories(*),
            questions:test_questions(
              *,
              options:question_options(*)
            )
          `
          )
          .eq("id", testId)
          .single();

        if (testError) throw testError;
        if (!testData) throw new Error("Test not found");

        setTest(testData);

        // Sort questions and options by order - FIX: Add proper typing
        const sortedQuestions = (testData.questions || [])
          .sort((a: any, b: any) => a.question_order - b.question_order)
          .map((question: any) => ({
            ...question,
            options: question.options.sort(
              (a: any, b: any) => a.option_order - b.option_order
            ),
          }));

        setQuestions(sortedQuestions);
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
      const { data: questionsData, error } = await supabase
        .from("test_questions")
        .select(
          `
          *,
          options:question_options(*)
        `
        )
        .eq("test_id", testId)
        .order("question_order");

      if (error) throw error;

      // FIX: Add proper typing
      const sortedQuestions = (questionsData || []).map((question: any) => ({
        ...question,
        options: question.options.sort(
          (a: any, b: any) => a.option_order - b.option_order
        ),
      }));

      setQuestions(sortedQuestions);
    } catch (err) {
      console.error("Error refreshing questions:", err);
    }
  };

  const handleCreateQuestion = async (questionData: QuestionFormData) => {
    if (!user || !["doctor", "admin"].includes(user.role || "")) {
      setError("You don't have permission to create questions");
      return;
    }

    try {
      // Create the question
      const { data: question, error: questionError } = await supabase
        .from("test_questions")
        .insert({
          test_id: testId,
          question_text: questionData.question_text,
          explanation: questionData.explanation,
          points: questionData.points,
          question_order: questions.length + 1,
        })
        .select()
        .single();

      if (questionError) throw questionError;

      // Create the options
      const optionsToInsert = questionData.options.map((option, index) => ({
        question_id: question.id,
        option_text: option.option_text,
        is_correct: option.is_correct,
        option_order: index + 1,
      }));

      const { error: optionsError } = await supabase
        .from("question_options")
        .insert(optionsToInsert);

      if (optionsError) throw optionsError;

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

    if (!user || !["doctor", "admin"].includes(user.role || "")) {
      setError("You don't have permission to delete questions");
      return;
    }

    try {
      // Delete options first
      const { error: optionsError } = await supabase
        .from("question_options")
        .delete()
        .eq("question_id", question.id);

      if (optionsError) throw optionsError;

      // Delete the question
      const { error: questionError } = await supabase
        .from("test_questions")
        .delete()
        .eq("id", question.id);

      if (questionError) throw questionError;

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

  if (error) {
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
              <p className="text-red-600 mb-6 font-medium">{error}</p>
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

  if (!test) {
    return (
      <AuthModalProvider>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />
          <div className="flex items-center justify-center min-h-[60vh]">
            <div className="text-center">
              <p className="text-gray-600">{t("test_not_found")}</p>
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
                {test.title} • {questions.length} {t("questions")}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <p className="text-red-800">{error}</p>
              </div>
            )}

            {/* Create Question Button */}
            {!isCreating && (
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

            {/* Question Editor - FIX: Remove testId prop */}
            {isCreating && (
              <div className="mb-8">
                <QuestionEditor
                  question={editingQuestion}
                  onSave={handleCreateQuestion}
                  onCancel={() => {
                    setIsCreating(false);
                    setEditingQuestion(null);
                  }}
                />
              </div>
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
                              <span className="flex-1">
                                {option.option_text}
                              </span>
                              {option.is_correct && (
                                <span className="text-xs font-medium px-2 py-1 rounded bg-green-600 text-white">
                                  ✓
                                </span>
                              )}
                            </div>
                          ))}
                        </div>

                        {question.explanation && (
                          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <h4 className="font-semibold text-blue-800 mb-1">
                              {t("explanation")}:
                            </h4>
                            <p className="text-blue-700 text-sm">
                              {question.explanation}
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex space-x-2 ml-4">
                        <button
                          onClick={() => {
                            setEditingQuestion(question);
                            setIsCreating(true);
                          }}
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
        </main>
      </div>
    </AuthModalProvider>
  );
}
