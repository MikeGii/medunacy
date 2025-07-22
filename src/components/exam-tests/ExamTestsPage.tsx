// src/components/exam-tests/ExamTestsPage.tsx - REFACTORED

"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useExam } from "@/contexts/ExamContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { TestCategory, Test } from "@/types/exam";

export default function ExamTestsPage() {
  const t = useTranslations("exam_tests");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  // Use the ExamContext
  const {
    categories,
    tests,
    loading,
    error,
    fetchCategories,
    fetchTests,
    clearError,
  } = useExam();

  // Local state for UI interactions
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(
    null
  );
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedMode, setSelectedMode] = useState<"training" | "exam" | null>(
    null
  );

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Fetch tests when category changes
  useEffect(() => {
    if (selectedCategory) {
      fetchTests(selectedCategory.id);
    } else {
      // Reset selections when no category selected
      setSelectedTest(null);
      setSelectedMode(null);
    }
  }, [selectedCategory, fetchTests]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: TestCategory) => {
    setSelectedCategory(category);
    setSelectedTest(null);
    setSelectedMode(null);
  }, []);

  // Handle test selection
  const handleTestSelect = useCallback((test: Test) => {
    setSelectedTest(test);
    setSelectedMode(null);
  }, []);

  // Handle mode selection
  const handleModeSelect = useCallback((mode: "training" | "exam") => {
    setSelectedMode(mode);
  }, []);

  // Handle start test
  const handleStartTest = useCallback(() => {
    if (!selectedTest || !selectedMode || !user) return;

    // Check if test has questions
    if (!selectedTest.question_count || selectedTest.question_count === 0) {
      // You might want to show a toast here instead
      alert(t("no_questions_in_test"));
      return;
    }

    router.push(`/${locale}/exam-tests/${selectedMode}/${selectedTest.id}`);
  }, [selectedTest, selectedMode, user, router, locale, t]);

  const canStart = selectedTest && selectedMode && user;

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Content */}
        <main className="py-12">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Hero Section */}
            <div className="text-center mb-12">
              <div className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
                <h1 className="text-4xl md:text-5xl font-bold mb-4">
                  {t("title")}
                </h1>
              </div>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {t("subtitle")}
              </p>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-8">
                <div className="flex items-center space-x-3">
                  <svg
                    className="w-6 h-6 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div>
                    <p className="text-red-800 font-medium">{error}</p>
                    <button
                      onClick={clearError}
                      className="text-red-600 underline text-sm mt-1"
                    >
                      {t("dismiss")}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Category Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#118B50] to-[#5DB996] text-white rounded-full mb-4">
                  <span className="font-bold text-xl">1</span>
                </div>
                <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                  {t("select_category")}
                </h2>
                <p className="text-gray-600">{t("category_description")}</p>
              </div>

              {loading && categories.length === 0 ? (
                <div className="flex justify-center py-8">
                  <LoadingSpinner />
                </div>
              ) : categories.length === 0 ? (
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
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                      />
                    </svg>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    {t("no_categories")}
                  </h3>
                  {(user?.role === "doctor" || user?.role === "admin") && (
                    <button
                      onClick={() =>
                        router.push(`/${locale}/exam-tests/create`)
                      }
                      className="mt-4 px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300"
                    >
                      {t("create_first_category")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategorySelect(category)}
                      className={`group p-6 rounded-xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-lg ${
                        selectedCategory?.id === category.id
                          ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-md"
                          : "border-gray-200 hover:border-[#5DB996]/50 bg-white"
                      }`}
                    >
                      <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-[#118B50] transition-colors">
                        {category.name}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-600 line-clamp-2">
                          {category.description}
                        </p>
                      )}
                      {selectedCategory?.id === category.id && (
                        <div className="mt-3 flex items-center text-[#118B50] text-sm font-medium">
                          <svg
                            className="w-4 h-4 mr-1"
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
                          {t("selected")}
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Test Selection */}
            {selectedCategory && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#118B50] to-[#5DB996] text-white rounded-full mb-4">
                    <span className="font-bold text-xl">2</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                    {t("select_test")}
                  </h2>
                  <p className="text-gray-600">{t("test_description")}</p>
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <LoadingSpinner />
                  </div>
                ) : tests.length === 0 ? (
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      {t("no_tests_available")}
                    </h3>
                    <p className="text-gray-500 mb-6">
                      {t("no_tests_description")}
                    </p>
                    {(user?.role === "doctor" || user?.role === "admin") && (
                      <button
                        onClick={() =>
                          router.push(`/${locale}/exam-tests/create`)
                        }
                        className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300"
                      >
                        {t("create_test")}
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {tests.map((test) => (
                      <button
                        key={test.id}
                        onClick={() => handleTestSelect(test)}
                        className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                          selectedTest?.id === test.id
                            ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
                            : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-4">
                          <h3 className="font-bold text-xl text-gray-800 group-hover:text-[#118B50] transition-colors flex-1">
                            {test.title}
                          </h3>
                          {test.time_limit && (
                            <span className="text-sm text-gray-500 ml-2">
                              ⏱️ {test.time_limit} {t("minutes")}
                            </span>
                          )}
                        </div>

                        {test.description && (
                          <p className="text-gray-600 mb-4 line-clamp-2">
                            {test.description}
                          </p>
                        )}

                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-500">
                            📝 {test.question_count || 0} {t("questions")}
                          </span>
                          <span className="text-gray-500">
                            ✓ {test.passing_score}% {t("to_pass")}
                          </span>
                        </div>

                        {selectedTest?.id === test.id && (
                          <div className="mt-4 flex items-center justify-center text-[#118B50] font-medium">
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
                            {t("selected")}
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Mode Selection */}
            {selectedTest && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
                <div className="text-center mb-8">
                  <div className="inline-flex items-center justify-center w-12 h-12 bg-gradient-to-br from-[#118B50] to-[#5DB996] text-white rounded-full mb-4">
                    <span className="font-bold text-xl">3</span>
                  </div>
                  <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                    {t("select_mode")}
                  </h2>
                  <p className="text-gray-600">{t("mode_description")}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Training Mode */}
                  <button
                    onClick={() => handleModeSelect("training")}
                    className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                      selectedMode === "training"
                        ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
                        : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-colors ${
                          selectedMode === "training"
                            ? "bg-[#118B50] text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-[#E3F0AF] group-hover:text-[#118B50]"
                        }`}
                      >
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-[#118B50]">
                        {t("modes.training")}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {t("modes.training_desc")}
                      </p>
                    </div>
                    {selectedMode === "training" && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-[#118B50] rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
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
                        </div>
                      </div>
                    )}
                  </button>

                  {/* Exam Mode */}
                  <button
                    onClick={() => handleModeSelect("exam")}
                    className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                      selectedMode === "exam"
                        ? "border-red-500 bg-gradient-to-br from-red-50 to-orange-50 shadow-lg"
                        : "border-gray-200 hover:border-red-300 bg-gradient-to-br from-white to-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-colors ${
                          selectedMode === "exam"
                            ? "bg-red-500 text-white"
                            : "bg-gray-100 text-gray-600 group-hover:bg-red-100 group-hover:text-red-600"
                        }`}
                      >
                        <svg
                          className="w-8 h-8"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-red-600">
                        {t("modes.exam")}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {t("modes.exam_desc")}
                      </p>
                    </div>
                    {selectedMode === "exam" && (
                      <div className="absolute top-4 right-4">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <svg
                            className="w-4 h-4 text-white"
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
                        </div>
                      </div>
                    )}
                  </button>
                </div>

                {/* Start Button */}
                <div className="mt-8 text-center">
                  <button
                    onClick={handleStartTest}
                    disabled={!canStart || loading}
                    className={`px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                      canStart && !loading
                        ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white hover:from-[#0A6B3B] hover:to-[#4A9B7E] hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
                  >
                    {loading ? (
                      <div className="flex items-center space-x-2">
                        <LoadingSpinner />
                        <span>{t("loading")}</span>
                      </div>
                    ) : !user ? (
                      t("login_required")
                    ) : (
                      t("start_test")
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}
