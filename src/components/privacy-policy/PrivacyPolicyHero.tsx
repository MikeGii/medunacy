// src/components/privacy-policy/PrivacyPolicyHero.tsx
"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";

export default function PrivacyPolicyHero() {
  const t = useTranslations("privacy");
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <section className="relative overflow-hidden py-12 md:py-16">
      {/* Background decoration */}
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
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
              {t("title")}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            {t("subtitle")}
          </p>
          <p className="text-sm text-gray-500 mt-4">
            {t("last_updated")}: {t("update_date")}
          </p>
        </div>
      </div>
    </section>
  );
}