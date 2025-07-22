// src/components/exam-tests/TestCreationPage.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { TestCategory, Test } from "@/types/exam";
import CategoryManagement from "./creation/CategoryManagement";
import TestManagement from "./creation/TestManagement";
import { useAuthorization } from "@/hooks/useAuthorization";
import { supabase } from "@/lib/supabase";

export default function TestCreationPage() {
  const t = useTranslations("test_creation");

  const [activeTab, setActiveTab] = useState<"categories" | "tests">(
    "categories"
  );
  const [categories, setCategories] = useState<TestCategory[]>([]);
  const [tests, setTests] = useState<Test[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  // Fetch data on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch categories directly from Supabase
        const { data: categoriesData, error: categoriesError } = await supabase
          .from("test_categories")
          .select("*")
          .eq("is_active", true)
          .order("name");

        if (categoriesError) throw categoriesError;
        setCategories(categoriesData || []);

        // Fetch all tests (including unpublished for doctors/admins)
        const { data: testsData, error: testsError } = await supabase
          .from("tests")
          .select(
            `
          *,
          category:test_categories(*),
          test_questions(count)
        `
          )
          .order("created_at", { ascending: false });

        if (testsError) throw testsError;

        // Transform the data to flatten the count
        const transformedTests =
          testsData?.map((test) => ({
            ...test,
            question_count: test.test_questions?.[0]?.count || 0,
          })) || [];

        setTests(transformedTests);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError(err instanceof Error ? err.message : "Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    if (isAuthorized) {
      fetchData();
    }
  }, [isAuthorized]);

  const refreshCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("test_categories")
        .select("*")
        .eq("is_active", true)
        .order("name");

      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error refreshing categories:", err);
    }
  };

  const refreshTests = async () => {
    try {
      const { data, error } = await supabase
        .from("tests")
        .select(
          `
        *,
        category:test_categories(*),
        test_questions(count)
      `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Transform the data to flatten the count
      const transformedTests =
        data?.map((test) => ({
          ...test,
          question_count: test.test_questions?.[0]?.count || 0,
        })) || [];

      setTests(transformedTests);
    } catch (err) {
      console.error("Error refreshing tests:", err);
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

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        {/* Main Content */}
        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Header */}
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

            {/* Tab Navigation */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 mb-8">
              <div className="border-b border-gray-200">
                <nav className="flex space-x-8 px-8 pt-6">
                  <button
                    onClick={() => setActiveTab("categories")}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "categories"
                        ? "border-[#118B50] text-[#118B50]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span>{t("manage_categories")}</span>
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveTab("tests")}
                    className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors duration-200 ${
                      activeTab === "tests"
                        ? "border-[#118B50] text-[#118B50]"
                        : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }`}
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
                          d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                        />
                      </svg>
                      <span>{t("manage_tests")}</span>
                    </div>
                  </button>
                </nav>
              </div>

              {/* Tab Content */}
              <div className="p-8">
                {activeTab === "categories" && (
                  <CategoryManagement
                    categories={categories}
                    onRefresh={refreshCategories}
                  />
                )}

                {activeTab === "tests" && (
                  <TestManagement
                    tests={tests}
                    categories={categories}
                    onRefresh={refreshTests}
                  />
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}
