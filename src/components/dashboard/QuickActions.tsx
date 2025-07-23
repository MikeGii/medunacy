// src/components/dashboard/QuickActions.tsx
"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserProfile } from "@/hooks/useUserProfile";
import DashboardActionButton from "../ui/DashboardActionButton";

export default function QuickActions() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { profileCompletion, loading } = useUserProfile();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const baseUrl = `/${currentLocale}`;

  const quickActions = [
    {
      title: t("forum"),
      description: t("forum_description"),
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a2 2 0 01-2-2v-6a2 2 0 012-2h8z"
          />
        </svg>
      ),
      href: `${baseUrl}/forum`,
      gradient: "from-[#118B50] to-[#5DB996]",
      bgGradient: "from-[#118B50]/10 to-[#5DB996]/10",
      showNotification: false,
    },
    {
      title: t("my_data"),
      description: t("my_data_description"),
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
      href: `${baseUrl}/profile`,
      gradient: "from-[#5DB996] to-[#E3F0AF]",
      bgGradient: "from-[#5DB996]/10 to-[#E3F0AF]/10",
      showNotification:
        profileCompletion && !loading && !profileCompletion.isComplete,
    },
    {
      title: t("exam_tests"),
      description: t("exam_tests_description"),
      icon: (
        <svg
          className="w-full h-full"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
          />
        </svg>
      ),
      href: `${baseUrl}/exam-tests`,
      gradient: "from-[#E3F0AF] to-[#118B50]",
      bgGradient: "from-[#E3F0AF]/10 to-[#118B50]/10",
      showNotification: false,
    },
  ];

  return (
    <section className="relative py-8 md:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div
          className={`text-center mb-8 md:mb-12 transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
              {t("quick_actions")}
            </span>
          </h2>
        </div>

        {/* Quick Action Buttons - 2 column layout that wraps naturally */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {quickActions.map((action, index) => (
            <div
              key={index}
              className={`transform transition-all duration-1000 ease-out ${
                isVisible
                  ? "translate-y-0 opacity-100"
                  : "translate-y-10 opacity-0"
              }`}
              style={{
                animationDelay: `${index * 0.1}s`,
                transitionDelay: `${index * 0.1}s`,
              }}
            >
              <DashboardActionButton {...action} colorScheme="green" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
