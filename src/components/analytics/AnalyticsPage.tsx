// src/components/analytics/AnalyticsPage.tsx
"use client";

import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { useAuthorization } from "@/hooks/useAuthorization";
import { useTranslations } from "next-intl";
import ProgressDashboard from "./ProgressDashboard";
import { useAuth } from "@/contexts/AuthContext";

export default function AnalyticsPage() {
  const t = useTranslations("analytics");
  const { user } = useAuth();
  const { isAuthorized, isLoading } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["user", "doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        <main className="py-8 md:py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Page Header */}
            <div className="mb-8">
              <h1 className="text-3xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
                  {t("page_title", { name: user?.user_metadata?.first_name || "User" })}
                </span>
              </h1>
              <p className="text-gray-600 mt-2">
                {t("page_subtitle")}
              </p>
            </div>

            {/* Progress Dashboard */}
            <ProgressDashboard />
          </div>
        </main>
      </div>
    </AuthModalProvider>
  );
}