// src/components/exam-tests/ExamTestsPage.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useLocale } from "next-intl";

export default function ExamTestsPage() {
  const t = useTranslations("exam_tests");
  const router = useRouter();
  const locale = useLocale();
  const { user } = useAuth();
  const [selectedMode, setSelectedMode] = useState<"training" | "exam" | null>(
    null
  );
  const [selectedYear, setSelectedYear] = useState<number | null>(null);

  // Available years (you can fetch this from database later)
  const availableYears = [2017, 2018];

  const handleStartTest = () => {
    if (selectedMode && selectedYear && user) {
      router.push(`/${locale}/exam-tests/${selectedMode}/${selectedYear}`);
    }
  };

  const canStart = selectedMode && selectedYear && user;

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          {t("title")}
        </h1>

        {/* Mode Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t("select_mode")}</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedMode("training")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMode === "training"
                  ? "border-[#118B50] bg-[#118B50]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">
                {t("modes.training")}
              </h3>
              <p className="text-gray-600 text-sm">
                {t("modes.training_desc")}
              </p>
            </button>

            <button
              onClick={() => setSelectedMode("exam")}
              className={`p-6 rounded-lg border-2 transition-all ${
                selectedMode === "exam"
                  ? "border-[#118B50] bg-[#118B50]/10"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <h3 className="font-semibold text-lg mb-2">{t("modes.exam")}</h3>
              <p className="text-gray-600 text-sm">{t("modes.exam_desc")}</p>
            </button>
          </div>
        </div>

        {/* Year Selection */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">{t("select_year")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {availableYears.map((year) => (
              <button
                key={year}
                onClick={() => setSelectedYear(year)}
                className={`p-4 rounded-lg border-2 font-semibold transition-all ${
                  selectedYear === year
                    ? "border-[#118B50] bg-[#118B50]/10 text-[#118B50]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                {year}
              </button>
            ))}
          </div>
        </div>

        {/* Start Button */}
        <div className="text-center">
          <button
            onClick={handleStartTest}
            disabled={!canStart}
            className={`px-8 py-3 rounded-lg font-semibold text-white transition-all ${
              canStart
                ? "bg-[#118B50] hover:bg-[#0A6B3B]"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {t("start_test")}
          </button>
        </div>
      </div>
    </div>
  );
}
