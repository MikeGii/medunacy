// src/components/exam-tests/TestCreationPage.tsx - REFACTORED

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useExam } from "@/contexts/ExamContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CategoryManagement from "./creation/CategoryManagement";
import TestManagement from "./creation/TestManagement";
import { useAuthorization } from "@/hooks/useAuthorization";
import ExamErrorBoundary from "@/components/exam-tests/common/ExamErrorBoundary";
import ErrorDisplay from "./common/ErrorDisplay";

export default function TestCreationPage() {
  const t = useTranslations("test_creation");
  const {
    categories,
    tests,
    loading,
    error,
    fetchCategories,
    fetchTests,
    clearError,
  } = useExam();
  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  const [activeTab, setActiveTab] = useState<"categories" | "tests">(
    "tests"
  );

  // Fetch initial data
  useEffect(() => {
    let mounted = true;

    const loadData = async () => {
      if (!mounted) return;

      try {
        await Promise.all([fetchCategories(), fetchTests()]);
      } catch (error) {
        console.error("Failed to load initial data:", error);
      }
    };

    loadData();

    return () => {
      mounted = false;
    };
  }, []);

  if (isLoading || loading) {
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

  if (!isAuthorized) {
    return null; // useAuthorization will handle redirect
  }

  return (
    <AuthModalProvider>
      <ExamErrorBoundary>
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
          <Header />

          <main className="py-12">
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
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

              {/* Error Display */}
              {error && (
                <ErrorDisplay
                  error={error}
                  onDismiss={clearError}
                  className="mb-6"
                />
              )}

              {/* Tabs */}
              <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl mb-8">
                <button
                  onClick={() => setActiveTab("tests")}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    activeTab === "tests"
                      ? "bg-white text-[#118B50] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t("tests_tab")}
                </button>
                <button
                  onClick={() => setActiveTab("categories")}
                  className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                    activeTab === "categories"
                      ? "bg-white text-[#118B50] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }`}
                >
                  {t("categories_tab")}
                </button>
              </div>

              {/* Content */}
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8">
                {activeTab === "tests" ? (
                  <TestManagement
                    tests={tests}
                    categories={categories}
                    onRefresh={fetchTests}
                  />
                ) : (
                  <CategoryManagement
                    categories={categories}
                    onRefresh={fetchCategories}
                  />
                )}
              </div>
            </div>
          </main>
        </div>
      </ExamErrorBoundary>
    </AuthModalProvider>
  );
}
