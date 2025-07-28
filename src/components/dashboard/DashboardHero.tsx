// src/components/dashboard/DashboardHero.tsx
"use client";

import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useSubscription } from "@/hooks/useSubscription";
import { useEffect, useState } from "react";

export default function DashboardHero() {
  const t = useTranslations("dashboard");
  const { user } = useAuth();
  const { isPremium } = useSubscription();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Get user's first name
  const firstName =
    user?.user_metadata?.first_name || user?.email?.split("@")[0] || "Kasutaja";

  return (
    <section className="relative overflow-hidden py-8 md:py-12">
      {/* Background with enhanced animation for premium users */}
      <div className="absolute inset-0 bg-gradient-to-br from-white via-[#FBF6E9] to-white opacity-50">
        {isPremium ? (
          <>
            {/* Premium animated background */}
            <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-yellow-300 to-yellow-500 blur-3xl opacity-30 -top-10 -right-10 animate-pulse"></div>
            <div className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-l from-yellow-400 to-amber-500 blur-2xl opacity-25 -bottom-10 -left-10 animate-pulse"></div>
            <div className="absolute w-56 h-56 md:w-72 md:h-72 rounded-full bg-gradient-to-tr from-yellow-200 to-yellow-400 blur-2xl opacity-20 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse"></div>
          </>
        ) : (
          <>
            {/* Standard background */}
            <div className="absolute w-64 h-64 md:w-96 md:h-96 rounded-full bg-gradient-to-r from-[#E3F0AF] to-[#5DB996] blur-3xl opacity-20 -top-10 -right-10"></div>
            <div className="absolute w-48 h-48 md:w-80 md:h-80 rounded-full bg-gradient-to-l from-[#118B50] to-[#5DB996] blur-2xl opacity-15 -bottom-10 -left-10"></div>
          </>
        )}
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`text-center transform transition-all duration-1000 ease-out ${
            isVisible ? "translate-y-0 opacity-100" : "translate-y-10 opacity-0"
          }`}
        >
          {/* Premium badge above welcome message */}
          {isPremium && (
            <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-yellow-100 to-amber-100 px-4 py-2 rounded-full mb-4 border border-yellow-300">
              <svg
                className="w-5 h-5 text-yellow-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-sm font-semibold text-yellow-700">
                Premium liige
              </span>
            </div>
          )}

          {/* Welcome Message */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 md:mb-6">
            <span className="text-gray-700">{t("welcome")}</span>
            <br />
            <span
              className={`${
                isPremium
                  ? "bg-gradient-to-r from-yellow-500 via-amber-500 to-yellow-500 animate-gradient-x"
                  : "bg-gradient-to-r from-[#118B50] to-[#5DB996]"
              } bg-clip-text text-transparent drop-shadow-sm`}
            >
              {firstName}!
            </span>
          </h1>

          {/* Decorative elements */}
          <div className="flex items-center justify-center space-x-4 mt-6">
            <div
              className={`h-px ${
                isPremium
                  ? "bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"
                  : "bg-gradient-to-r from-transparent via-[#5DB996]/50 to-transparent"
              } flex-1 max-w-20`}
            ></div>
            <div
              className={`w-2 h-2 ${
                isPremium ? "bg-yellow-500" : "bg-[#118B50]"
              } rounded-full animate-pulse`}
            ></div>
            <div
              className={`h-px ${
                isPremium
                  ? "bg-gradient-to-r from-transparent via-yellow-400/50 to-transparent"
                  : "bg-gradient-to-r from-transparent via-[#5DB996]/50 to-transparent"
              } flex-1 max-w-20`}
            ></div>
          </div>
        </div>
      </div>
    </section>
  );
}
