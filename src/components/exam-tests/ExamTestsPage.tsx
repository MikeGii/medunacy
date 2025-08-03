// src/components/exam-tests/ExamTestsPage.tsx - REFACTORED

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useExam } from "@/contexts/ExamContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { TestCategory, Test } from "@/types/exam";
import { useSubscription } from "@/hooks/useSubscription";
import { useTestAttempts } from "@/hooks/useTestAttempts";
import TestLimitIndicator from "./TestLimitIndicator";

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
  const [showPremiumModal, setShowPremiumModal] = useState(false);

  const { limits, recordAttempt } = useTestAttempts();

  const {
    canAccessTest,
    isPremium,
    subscriptionStatus,
    isLoading: subscriptionLoading,
  } = useSubscription();

  // After getting tests from context, filter based on user role
  const filteredTests = useMemo(() => {
    // Only show published tests to regular users
    if (!user || user.role === "user") {
      return tests.filter((test) => test.is_published);
    }

    // Doctors and admins can see all tests (but this page is for taking tests, not managing)
    // So even for them, only show published tests on this page
    return tests.filter((test) => test.is_published);
  }, [tests, user]);

  // Filter tests by selected category
  const categoryTests = useMemo(() => {
    if (!selectedCategory) return [];

    return filteredTests.filter(
      (test) => test.category_id === selectedCategory.id
    );
  }, [filteredTests, selectedCategory]);

  // Group tests by accessibility
  const groupedTests = useMemo(() => {
    return {
      accessible: categoryTests.filter((test) => canAccessTest(test)),
      premium: categoryTests.filter((test) => !canAccessTest(test)),
    };
  }, [categoryTests, canAccessTest]);

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

  // Handle test selection with premium check
  const handleTestSelect = useCallback(
    (test: Test) => {
      if (!canAccessTest(test)) {
        setShowPremiumModal(true);
        return;
      }
      setSelectedTest(test);
      setSelectedMode(null);
    },
    [canAccessTest]
  );

  // Handle mode selection
  const handleModeSelect = useCallback((mode: "training" | "exam") => {
    setSelectedMode(mode);
  }, []);

  // Handle start test
  const handleStartTest = useCallback(async () => {
    if (!selectedTest || !selectedMode || !user) return;

    // Check premium access
    if (!canAccessTest(selectedTest)) {
      setShowPremiumModal(true);
      return;
    }

    // Check daily limits for free users
    if (!isPremium) {
      if (selectedMode === "training" && !limits.canStartTraining) {
        alert(t("daily_limits.training_limit_reached"));
        return;
      }
      if (selectedMode === "exam" && !limits.canStartExam) {
        alert(t("daily_limits.exam_limit_reached"));
        return;
      }
    }

    // Check if test has questions
    if (!selectedTest.question_count || selectedTest.question_count === 0) {
      alert(t("no_questions_in_test"));
      return;
    }

    // Record the attempt
    const recorded = await recordAttempt(selectedTest.id, selectedMode);
    if (!recorded) {
      alert(t("daily_limits.error_recording"));
      return;
    }

    // Navigate to test
    router.push(`/${locale}/exam-tests/${selectedMode}/${selectedTest.id}`);
  }, [
    selectedTest,
    selectedMode,
    user,
    router,
    locale,
    t,
    canAccessTest,
    isPremium,
    limits,
    recordAttempt,
  ]);

  const canStart =
    selectedTest && selectedMode && user && canAccessTest(selectedTest);

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
              <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-6">
                {t("subtitle")}
              </p>

              {/* Test Attempts Display */}
              {user && (
                <div className="flex justify-center">
                  <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 max-w-md w-full">
                    <h3 className="text-sm font-semibold text-gray-700 mb-4">
                      {t("daily_limits.remaining_attempts")}
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                      {/* Training Mode */}
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-[#E3F0AF] to-[#5DB996]/20 rounded-lg p-4">
                          <svg
                            className="w-8 h-8 mx-auto mb-2 text-[#5DB996]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                            />
                          </svg>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            {t("modes.training")}
                          </h4>
                          <div className="text-2xl font-bold">
                            {isPremium ? (
                              <span className="text-[#118B50]">∞</span>
                            ) : (
                              <span
                                className={
                                  limits.canStartTraining
                                    ? "text-[#118B50]"
                                    : "text-red-500"
                                }
                              >
                                {limits.trainingLimit - limits.trainingUsed}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isPremium
                              ? t("daily_limits.unlimited")
                              : t("daily_limits.remaining")}
                          </p>
                        </div>
                      </div>

                      {/* Exam Mode */}
                      <div className="text-center">
                        <div className="bg-gradient-to-br from-[#FBF6E9] to-[#E3F0AF]/20 rounded-lg p-4">
                          <svg
                            className="w-8 h-8 mx-auto mb-2 text-[#118B50]"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                            />
                          </svg>
                          <h4 className="text-sm font-medium text-gray-700 mb-1">
                            {t("modes.exam")}
                          </h4>
                          <div className="text-2xl font-bold">
                            {isPremium ? (
                              <span className="text-[#118B50]">∞</span>
                            ) : (
                              <span
                                className={
                                  limits.canStartExam
                                    ? "text-[#118B50]"
                                    : "text-red-500"
                                }
                              >
                                {limits.examLimit - limits.examUsed}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isPremium
                              ? t("daily_limits.unlimited")
                              : t("daily_limits.remaining")}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* User subscription status badge */}
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <span
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                          isPremium
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {isPremium && (
                          <svg
                            className="w-4 h-4 mr-1"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        )}
                        {t(`subscription.${subscriptionStatus}`)}
                      </span>
                    </div>

                    {!isPremium && (
                      <>
                        <p className="text-xs text-gray-500 text-center mt-3">
                          {t("daily_limits.reset_info")}
                        </p>
                        {(limits.trainingUsed >= limits.trainingLimit ||
                          limits.examUsed >= limits.examLimit) && (
                          <button
                            onClick={() => setShowPremiumModal(true)}
                            className="mt-2 text-xs text-yellow-600 hover:text-yellow-700 font-medium w-full"
                          >
                            {t("daily_limits.upgrade_for_unlimited")}
                          </button>
                        )}
                      </>
                    )}
                  </div>
                </div>
              )}
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
                ) : categoryTests.length === 0 ? (
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
                    {categoryTests.map((test) => {
                      const isAccessible = canAccessTest(test);

                      return (
                        <button
                          key={test.id}
                          onClick={() => handleTestSelect(test)}
                          className={`group relative p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                            selectedTest?.id === test.id
                              ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
                              : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
                          }`}
                        >
                          {/* Premium badge */}
                          {test.is_premium && (
                            <div className="absolute top-4 right-4 z-10">
                              <span
                                className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                                  isAccessible
                                    ? "bg-yellow-100 text-yellow-800"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                              >
                                <svg
                                  className="w-3 h-3 mr-1"
                                  fill="currentColor"
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                                {t("premium")}
                              </span>
                            </div>
                          )}

                          {/* Lock overlay for inaccessible tests - Updated styling */}
                          {!isAccessible && (
                            <div className="absolute inset-0 bg-gray-100/30 backdrop-blur-[1px] rounded-2xl flex items-center justify-center">
                              <div className="bg-white/90 p-3 rounded-full shadow-lg">
                                <svg
                                  className="w-8 h-8 text-gray-500"
                                  fill="none"
                                  stroke="currentColor"
                                  viewBox="0 0 24 24"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                                  />
                                </svg>
                              </div>
                            </div>
                          )}

                          {/* Content with conditional opacity */}
                          <div className={!isAccessible ? "opacity-60" : ""}>
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

                            {selectedTest?.id === test.id && isAccessible && (
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
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Mode Selection */}
            {selectedTest && canAccessTest(selectedTest) && (
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

        {/* Premium Modal */}
        {showPremiumModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 max-w-md w-full">
              <div className="text-center">
                <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg
                    className="w-8 h-8 text-yellow-600"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  {t("premium_required_title")}
                </h3>
                <p className="text-gray-600 mb-6">
                  {t("premium_required_message")}
                </p>
                <div className="flex gap-3 justify-center">
                  <button
                    onClick={() => setShowPremiumModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    {t("close")}
                  </button>
                  <button
                    onClick={() => {
                      // Later this will redirect to payment page
                      setShowPremiumModal(false);
                    }}
                    className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                  >
                    {t("upgrade_to_premium")}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AuthModalProvider>
  );
}
