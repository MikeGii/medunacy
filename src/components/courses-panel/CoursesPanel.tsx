// src/components/courses-panel/CoursesPanel.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import Header from "@/components/layout/Header";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import CoursesPanelTabs from "./CoursesPanelTabs";
import CoursesManagement from "./CoursesManagement";
import CategoriesManagement from "./CategoriesManagement";
import EnrollmentsView from "./EnrollmentsView";

export default function CoursesPanel() {
  const t = useTranslations("courses_panel");
  const [activeTab, setActiveTab] = useState<
    "courses" | "categories" | "enrollments"
  >("courses");

  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  if (isLoading) {
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
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        <main className="py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8 text-center">
              <h1 className="text-3xl md:text-4xl font-bold text-[#118B50] mb-3">
                {t("title")}
              </h1>
              <p className="text-gray-600 text-lg">{t("description")}</p>
            </div>

            {/* Tabs */}
            <div className="mb-8">
              <CoursesPanelTabs
                activeTab={activeTab}
                onTabChange={setActiveTab}
              />
            </div>

            {/* Tab Content */}
            <div className="bg-white rounded-2xl shadow-xl p-6 md:p-8">
              {activeTab === "courses" && <CoursesManagement />}
              {activeTab === "categories" && <CategoriesManagement />}
              {activeTab === "enrollments" && <EnrollmentsView />}
            </div>
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}
