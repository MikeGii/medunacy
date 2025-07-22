// src/components/exam-tests/ExamTestsPage.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "next-intl";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { TestCategory, Test } from "@/types/exam";
import { supabase } from "@/lib/supabase";

export default function ExamTestsPage() {
  const t = useTranslations("exam_tests");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();

  const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(
    null
  );
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const [selectedMode, setSelectedMode] = useState<"training" | "exam" | null>(
    null
  );

  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<Test[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingTests, setLoadingTests] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories on mount - STABLE REFERENCE
  const fetchCategories = useCallback(async () => {
    try {
      setLoadingCategories(true);
      const { data, error } = await supabase
        .from("test_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error fetching categories:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load categories"
      );
    } finally {
      setLoadingCategories(false);
    }
  }, []);

  // Fetch tests for selected category - STABLE REFERENCE
  const fetchTests = useCallback(async (categoryId: string) => {
    try {
      setLoadingTests(true);
      setError(null); // Clear previous errors

      const { data, error } = await supabase
        .from("tests")
        .select(
          `
          *,
          category:test_categories(*),
          test_questions(count)
        `
        )
        .eq("category_id", categoryId)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to extract the count properly
      const transformedTests =
        data?.map((test: any) => ({
          ...test,
          question_count: test.test_questions?.[0]?.count || 0,
        })) || [];

      setTests(transformedTests);
    } catch (err) {
      console.error("Error fetching tests:", err);
      setError(err instanceof Error ? err.message : "Failed to load tests");
    } finally {
      setLoadingTests(false);
    }
  }, []);

  // SINGLE useEffect for categories - runs once on mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // CONTROLLED useEffect for tests - only runs when category is explicitly selected
  useEffect(() => {
    if (selectedCategory?.id) {
      fetchTests(selectedCategory.id);
    } else {
      // Clear tests when no category is selected
      setTests([]);
      setSelectedTest(null);
      setSelectedMode(null);
    }
  }, [selectedCategory?.id, fetchTests]);

  // Handle category selection
  const handleCategorySelect = useCallback((category: TestCategory) => {
    setSelectedCategory(category);
    setSelectedTest(null); // Reset test selection
    setSelectedMode(null); // Reset mode selection
  }, []);

  // Handle test selection
  const handleTestSelect = useCallback((test: Test) => {
    setSelectedTest(test);
    setSelectedMode(null); // Reset mode selection
  }, []);

  // Handle mode selection
  const handleModeSelect = useCallback((mode: "training" | "exam") => {
    setSelectedMode(mode);
  }, []);

  const handleStartTest = useCallback(() => {
    if (selectedTest && selectedMode && user) {
      router.push(`/${locale}/exam-tests/${selectedMode}/${selectedTest.id}`);
    }
  }, [selectedTest, selectedMode, user, router, locale]);

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
                <div className="flex items-center">
                  <svg
                    className="w-6 h-6 text-red-600 mr-3"
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
                  <p className="text-red-800 font-medium">{error}</p>
                </div>
              </div>
            )}

            {/* Step 1: Category Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                  {t("select_category")}
                </h2>
                <p className="text-gray-600">{t("category_description")}</p>
              </div>

              {loadingCategories ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-gray-600 mt-4">
                    {t("loading_categories")}
                  </p>
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
                    {t("no_categories_available")}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t("no_categories_description")}
                  </p>
                  {(user?.role === "doctor" || user?.role === "admin") && (
                    <button
                      onClick={() =>
                        router.push(`/${locale}/exam-tests/create`)
                      }
                      className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
                    >
                      {t("create_first_test")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category)}
                      className={`group p-6 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                        selectedCategory?.id === category.id
                          ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
                          : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
                      }`}
                    >
                      <div className="text-center">
                        <h3 className="font-bold text-lg mb-2 text-[#118B50]">
                          {category.name}
                        </h3>
                        {category.description && (
                          <p className="text-gray-600 text-sm">
                            {category.description}
                          </p>
                        )}
                      </div>
                      {selectedCategory?.id === category.id && (
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
                  ))}
                </div>
              )}
            </div>

            {/* Step 2: Test Selection */}
            {selectedCategory && (
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
                <div className="text-center mb-8">
                  <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                    {t("select_test")} - {selectedCategory.name}
                  </h2>
                  <p className="text-gray-600">{t("test_description")}</p>
                </div>

                {loadingTests ? (
                  <div className="text-center py-8">
                    <LoadingSpinner />
                    <p className="text-gray-600 mt-4">{t("loading_tests")}</p>
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
                        className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
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
                        onClick={() => setSelectedTest(test)}
                        className={`group p-6 rounded-2xl border-2 text-left transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                          selectedTest?.id === test.id
                            ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
                            : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
                        }`}
                      >
                        <div className="relative">
                          <h3 className="font-bold text-lg mb-2 text-[#118B50]">
                            {test.title}
                          </h3>
                          {test.description && (
                            <p className="text-gray-600 text-sm mb-4">
                              {test.description}
                            </p>
                          )}
                          <div className="flex items-center justify-between text-sm text-gray-500">
                            <span>
                              {test.question_count || 0} {t("questions")}
                            </span>
                            {test.time_limit && (
                              <span>
                                {test.time_limit} {t("minutes")}
                              </span>
                            )}
                          </div>
                          {selectedTest?.id === test.id && (
                            <div className="absolute top-0 right-0">
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
                        </div>
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
                  <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                    {t("select_mode")}
                  </h2>
                  <p className="text-gray-600">{t("mode_description")}</p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Training Mode */}
                  <button
                    onClick={() => setSelectedMode("training")}
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
                    onClick={() => setSelectedMode("exam")}
                    className={`group relative p-8 rounded-2xl border-2 transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                      selectedMode === "exam"
                        ? "border-[#118B50] bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 shadow-lg"
                        : "border-gray-200 hover:border-[#5DB996]/50 bg-gradient-to-br from-white to-gray-50/50"
                    }`}
                  >
                    <div className="flex flex-col items-center text-center">
                      <div
                        className={`w-16 h-16 rounded-full mb-4 flex items-center justify-center transition-colors ${
                          selectedMode === "exam"
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
                            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                          />
                        </svg>
                      </div>
                      <h3 className="font-bold text-xl mb-3 text-[#118B50]">
                        {t("modes.exam")}
                      </h3>
                      <p className="text-gray-600 text-sm leading-relaxed">
                        {t("modes.exam_desc")}
                      </p>
                    </div>
                    {selectedMode === "exam" && (
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
                </div>
              </div>
            )}

            {/* Step 4: Start Button */}
            {canStart && (
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E3F0AF]/30 p-8 inline-block">
                  <button
                    onClick={handleStartTest}
                    className="group relative px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white hover:from-[#0A6B3B] hover:to-[#4A9B7E] hover:scale-105 shadow-lg hover:shadow-xl"
                  >
                    <span className="flex items-center">
                      <svg
                        className="w-6 h-6 mr-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293H16M6 6h12M6 18h12"
                        />
                      </svg>
                      {t("start_test")}
                    </span>
                    <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  </button>
                  {!user && (
                    <p className="text-red-500 text-sm mt-3">
                      {t("login_required")}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}
