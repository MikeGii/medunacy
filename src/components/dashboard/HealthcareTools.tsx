// src/components/dashboard/HealthcareTools.tsx
"use client";

import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import DashboardActionButton from "../ui/DashboardActionButton";

export default function HealthcareTools() {
  const t = useTranslations("dashboard");
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Don't show this section for regular users
  if (user?.role !== "doctor" && user?.role !== "admin") {
    return null;
  }

  // Extract current locale from pathname
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const baseUrl = `/${currentLocale}`;

  const healthcareActions = [
    {
      title: t("users"),
      description: t("users_description"),
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
            d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
          />
        </svg>
      ),
      href: `${baseUrl}/users`,
      gradient: "from-[#E3F0AF] to-[#118B50]",
      bgGradient: "from-[#E3F0AF]/10 to-[#118B50]/10",
    },
    {
      title: t("test_creation"),
      description: t("test_creation_description"),
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
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: `${baseUrl}/exam-tests/create`,
      gradient: "from-[#E3F0AF] to-[#118B50]",
      bgGradient: "from-[#E3F0AF]/10 to-[#118B50]/10",
    },
    {
      title: t("exam_session_results"),
      description: t("exam_session_results_description"),
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
            d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
      ),
      href: `${baseUrl}/exam-session-results`,
      gradient: "from-[#E3F0AF] to-[#118B50]",
      bgGradient: "from-[#E3F0AF]/10 to-[#118B50]/10",
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
            <span className="bg-gradient-to-r from-[#E3F0AF] to-[#118B50] bg-clip-text text-transparent">
              {t("healthcare_tools")}
            </span>
          </h2>
        </div>

        {/* Healthcare Tool Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-6 max-w-4xl mx-auto">
          {healthcareActions.map((action, index) => (
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
