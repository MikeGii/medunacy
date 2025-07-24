"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import CoursesPanelTabs from "./CoursesPanelTabs";
import CoursesManagement from "./CoursesManagement";
import CategoriesManagement from "./CategoriesManagement";
import EnrollmentsView from "./EnrollmentsView";

function CoursesPanelContent() {
  const t = useTranslations("courses_panel");
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const locale = pathname.startsWith("/ukr") ? "ukr" : "et";

  const [activeTab, setActiveTab] = useState<
    "courses" | "categories" | "enrollments"
  >("courses");

  // Check if user has permission
  useEffect(() => {
    if (user && user.role !== "doctor" && user.role !== "admin") {
      router.push(`/${locale}/`);
    }
  }, [user, router, locale]);

  if (!user || (user.role !== "doctor" && user.role !== "admin")) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("description")}</p>
        </div>

        {/* Tabs */}
        <CoursesPanelTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Content */}
        <div className="mt-6">
          {activeTab === "courses" && <CoursesManagement />}
          {activeTab === "categories" && <CategoriesManagement />}
          {activeTab === "enrollments" && <EnrollmentsView />}
        </div>
      </main>
    </div>
  );
}

export default function CoursesPanel() {
  return (
    <AuthModalProvider>
      <CoursesPanelContent />
    </AuthModalProvider>
  );
}
