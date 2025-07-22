// src/components/exam-tests/ExamTestsPage.tsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "next-intl";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface AvailableYear {
  year: number;
  questionCount: number;
}

export default function ExamTestsPage() {
  const t = useTranslations("exam_tests");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<"training" | "exam" | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  const [availableYears, setAvailableYears] = useState<AvailableYear[]>([]);
  const [loadingYears, setLoadingYears] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch available years when component mounts and user is available
  useEffect(() => {
    const fetchAvailableYears = async () => {
      if (!user) {
        setLoadingYears(false);
        return;
      }

      try {
        const response = await fetch("/api/exam/years");
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.error || "Failed to fetch available years");
        }

        if (data.success) {
          setAvailableYears(data.years);
        }
      } catch (err) {
        console.error("Error fetching years:", err);
        setError(
          err instanceof Error ? err.message : "Failed to load exam years"
        );
      } finally {
        setLoadingYears(false);
      }
    };

    fetchAvailableYears();
  }, [user]);

  const handleStartTest = () => {
    if (selectedMode && selectedYear && user) {
      router.push(`/${locale}/exam-tests/${selectedMode}/${selectedYear}`);
    }
  };

  const canStart = selectedMode && selectedYear && user;

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

            {/* Mode Selection */}
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

            {/* Year Selection */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-[#E3F0AF]/30 p-8 mb-8">
              <div className="text-center mb-8">
                <h2 className="text-2xl font-bold text-[#118B50] mb-2">
                  {t("select_year")}
                </h2>
                <p className="text-gray-600">{t("year_description")}</p>
              </div>

              {loadingYears ? (
                <div className="text-center py-8">
                  <LoadingSpinner />
                  <p className="text-gray-600 mt-4">{t("loading_years")}</p>
                </div>
              ) : availableYears.length === 0 ? (
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
                    {t("no_exams_available")}
                  </h3>
                  <p className="text-gray-500 mb-6">
                    {t("no_exams_description")}
                  </p>
                  {user?.role === "admin" && (
                    <button
                      onClick={() =>
                        router.push(`/${locale}/admin/import-exam-questions`)
                      }
                      className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
                    >
                      {t("import_exam_questions")}
                    </button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {availableYears.map(({ year, questionCount }) => (
                    <button
                      key={year}
                      onClick={() => setSelectedYear(year)}
                      className={`group p-6 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 ${
                        selectedYear === year
                          ? "bg-gradient-to-br from-[#118B50] to-[#5DB996] text-white shadow-lg border-2 border-[#118B50]"
                          : "bg-gradient-to-br from-gray-50 to-gray-100 text-gray-700 border-2 border-gray-200 hover:border-[#5DB996] hover:from-[#E3F0AF]/20 hover:to-[#5DB996]/10"
                      }`}
                    >
                      <div className="flex flex-col items-center">
                        <span className="text-2xl mb-1">{year}</span>
                        <span className="text-sm opacity-75">
                          {questionCount} {t("questions")}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Start Button Section */}
            {availableYears.length > 0 && (
              <div className="text-center">
                <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-[#E3F0AF]/30 p-8 inline-block">
                  <button
                    onClick={handleStartTest}
                    disabled={!canStart}
                    className={`group relative px-12 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform ${
                      canStart
                        ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white hover:from-[#0A6B3B] hover:to-[#4A9B7E] hover:scale-105 shadow-lg hover:shadow-xl"
                        : "bg-gray-300 text-gray-500 cursor-not-allowed"
                    }`}
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
                    {canStart && (
                      <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                    )}
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
