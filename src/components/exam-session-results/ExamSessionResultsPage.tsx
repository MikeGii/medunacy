// Update src/components/exam-session-results/ExamSessionResultsPage.tsx

"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ExamSessionsTable from "./ExamSessionsTable";

export default function ExamSessionResultsPage() {
  const t = useTranslations("exam_session_results");
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user has access (doctor or admin only)
    if (!authLoading && user) {
      if (user.role !== "doctor" && user.role !== "admin") {
        router.push("/");
      } else {
        setLoading(false);
      }
    }
  }, [user, authLoading, router]);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#E3F0AF]/20">
        <Header />

        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Page Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {t("page_title")}
            </h1>
            <p className="text-gray-600">{t("page_subtitle")}</p>
          </div>

          {/* Exam Sessions Table */}
          <ExamSessionsTable />
        </main>
      </div>
    </AuthModalProvider>
  );
}
