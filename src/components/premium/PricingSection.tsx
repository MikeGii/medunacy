// src/components/premium/PricingSection.tsx
"use client";

import { useTranslations } from "next-intl";
import { useState } from "react";
import { User } from "@supabase/supabase-js";

interface PricingSectionProps {
  user: User | null;
  isPremium: boolean;
}

export default function PricingSection({
  user,
  isPremium,
}: PricingSectionProps) {
  const t = useTranslations("premium");
  const [isAnnual, setIsAnnual] = useState(true);
  const [isLoading, setIsLoading] = useState(false);

  const monthlyPrice = 7.99;
  const annualPrice = 69.99;
  const annualMonthlyPrice = (annualPrice / 12).toFixed(2);
  const savings = (
    ((monthlyPrice * 12 - annualPrice) / (monthlyPrice * 12)) *
    100
  ).toFixed(0);

  const handleSubscribe = async () => {
    if (!user) {
      // Open login modal - you'll need to implement this
      alert(t("please_login"));
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Implement payment integration
      console.log("Subscribing to:", isAnnual ? "annual" : "monthly");
      alert(t("payment_coming_soon"));
    } catch (error) {
      console.error("Subscription error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
              {t("pricing_title")}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("pricing_subtitle")}
          </p>
        </div>

        {/* Billing Toggle */}
        <div className="flex items-center justify-center mb-12">
          <span
            className={`text-sm font-medium ${
              !isAnnual ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {t("monthly")}
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="mx-4 relative inline-flex h-6 w-11 items-center rounded-full bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-[#118B50] focus:ring-offset-2"
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                isAnnual ? "translate-x-6" : "translate-x-1"
              }`}
            />
          </button>
          <span
            className={`text-sm font-medium ${
              isAnnual ? "text-gray-900" : "text-gray-500"
            }`}
          >
            {t("annual")}
            <span className="ml-1 text-xs text-green-600 font-semibold">
              {t("save", { percent: savings })}
            </span>
          </span>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {/* Free Plan */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 relative">
            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                {t("free_plan")}
              </h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-gray-900">€0</span>
                <span className="text-gray-500 ml-2">/{t("month")}</span>
              </div>
              <p className="text-gray-600 mb-8">{t("free_description")}</p>

              {/* Features */}
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_1")}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_2")}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_4")}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_5")}
                  </span>
                </li>
              </ul>

              <button
                disabled
                className="w-full py-3 px-6 text-gray-500 bg-gray-100 rounded-full font-semibold cursor-not-allowed"
              >
                {t("current_plan")}
              </button>
            </div>
          </div>

          {/* Premium Plan */}
          <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-2xl shadow-xl border-2 border-yellow-300 p-8 relative">
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <span className="bg-gradient-to-r from-yellow-500 to-amber-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                {t("most_popular")}
              </span>
            </div>

            <div className="text-center">
              <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
                <svg
                  className="w-6 h-6 text-yellow-500 mr-2"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t("premium_plan")}
              </h3>

              <div className="mb-6">
                {isAnnual ? (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      €{annualMonthlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">/{t("month")}</span>
                    <div className="text-sm text-gray-600 mt-1">
                      €{annualPrice} {t("billed_annually")}
                    </div>
                  </>
                ) : (
                  <>
                    <span className="text-4xl font-bold text-gray-900">
                      €{monthlyPrice}
                    </span>
                    <span className="text-gray-500 ml-2">/{t("month")}</span>
                  </>
                )}
              </div>

              <p className="text-gray-600 mb-8">{t("premium_description")}</p>

              {/* Features */}
              <ul className="space-y-4 mb-8 text-left">
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_1")}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_2")}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_4")}
                  </span>
                </li>
                <li className="flex items-start">
                  <svg
                    className="w-5 h-5 text-yellow-500 mr-3 mt-0.5 flex-shrink-0"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-gray-700 font-medium">
                    {t("premium_feature_5")}
                  </span>
                </li>
              </ul>

              <button
                onClick={handleSubscribe}
                disabled={isPremium || isLoading}
                className={`w-full py-3 px-6 font-semibold rounded-full transition-all duration-300 
                  ${
                    isPremium
                      ? "text-gray-500 bg-gray-100 cursor-not-allowed"
                      : "text-white bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 transform hover:scale-105 shadow-lg hover:shadow-xl"
                  }`}
              >
                {isLoading ? (
                  <span className="flex items-center justify-center">
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {t("processing")}
                  </span>
                ) : isPremium ? (
                  t("already_subscribed")
                ) : (
                  t("upgrade_now")
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
