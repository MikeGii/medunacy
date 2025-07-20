// src/components/dashboard/DashboardHero.tsx
"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useState } from "react";

export default function DashboardHero() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get user's first name
  const firstName = user?.user_metadata?.first_name || user?.email?.split('@')[0] || 'Kasutaja';

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      {/* Background with subtle animation */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FBF6E9] to-white opacity-50">
        <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] blur-3xl opacity-20 -top-10 -right-10"></div>
        <div className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-l from-[#118B50] to-[#5DB996] blur-2xl opacity-15 -bottom-10 -left-10"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Welcome Message */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="text-gray-700">{t("welcome")}</span>
            <br />
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent drop-shadow-sm">
              {firstName}!
            </span>
          </h1>

          {/* Decorative elements */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div className="h-px bg-gradient-to-r from-transparent via-[#5DB996]/50 to-transparent flex-1 max-w-20"></div>
            <div className="w-2 h-2 bg-[#118B50] rounded-full animate-pulse"></div>
            <div className="h-px bg-gradient-to-r from-transparent via-[#5DB996]/50 to-transparent flex-1 max-w-20"></div>
          </div>
        </div>
      </div>
    </section>
  );
}