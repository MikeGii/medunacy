// src/components/premium/ComparisonTable.tsx
"use client";

import { useTranslations } from "next-intl";
import React from "react";

export default function ComparisonTable() {
  const t = useTranslations("premium");

  const features = [
    {
      category: t("features.content_access"),
      items: [
        {
          feature: t("features.exam_tests"),
          free: t("features.limited"),
          premium: t("features.unlimited"),
        },
        {
          feature: t("features.courses_access"),
          free: t("features.limited"),
          premium: t("features.all_courses"),
        },
      ],
    },
    {
      category: t("features.exam_features"),
      items: [
        {
          feature: t("features.exam_attempts"),
          free: "3 / " + t("features.per_day"),
          premium: t("features.unlimited"),
        },
        {
          feature: t("features.progress_tracking"),
          free: t("features.basic"),
          premium: t("features.advanced"),
        },
      ],
    },
  ];

  const renderValue = (value: string | boolean) => {
    if (typeof value === "boolean") {
      return value ? (
        <svg
          className="w-6 h-6 text-green-500 mx-auto"
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
      ) : (
        <svg
          className="w-6 h-6 text-gray-300 mx-auto"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      );
    }
    return <span className="text-sm text-gray-700">{value}</span>;
  };

  return (
    <section className="py-16 md:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-[#118B50] to-[#5DB996] bg-clip-text text-transparent">
              {t("comparison_title")}
            </span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t("comparison_subtitle")}
          </p>
        </div>

        {/* Comparison Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[640px]">
            <thead>
              <tr>
                <th className="text-left py-4 px-6"></th>
                <th className="text-center py-4 px-6">
                  <div className="inline-block">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("free_plan")}
                    </h3>
                    <div className="text-sm text-gray-500">€0/{t("month")}</div>
                  </div>
                </th>
                <th className="text-center py-4 px-6">
                  <div className="inline-block">
                    <div className="flex items-center justify-center mb-2">
                      <svg
                        className="w-5 h-5 text-yellow-500 mr-1"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      <h3 className="text-lg font-semibold text-gray-900">
                        {t("premium_plan")}
                      </h3>
                    </div>
                    <div className="text-sm text-gray-500">
                      €8.33/{t("month")}
                    </div>
                  </div>
                </th>
              </tr>
            </thead>
            <tbody>
              {features.map((category, categoryIndex) => (
                <React.Fragment key={categoryIndex}>
                  <tr className="bg-gray-50">
                    <td
                      colSpan={3}
                      className="px-6 py-3 text-sm font-semibold text-gray-900 uppercase tracking-wider"
                    >
                      {category.category}
                    </td>
                  </tr>
                  {category.items.map((item, itemIndex) => (
                    <tr
                      key={itemIndex}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.feature}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {renderValue(item.free)}
                      </td>
                      <td className="px-6 py-4 text-center bg-yellow-50/30">
                        {renderValue(item.premium)}
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Comparison Cards */}
        <div className="md:hidden mt-8 space-y-6">
          {features.map((category, categoryIndex) => (
            <div key={categoryIndex} className="bg-white rounded-xl shadow-sm">
              <div className="bg-gray-50 px-4 py-3 rounded-t-xl">
                <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">
                  {category.category}
                </h3>
              </div>
              <div className="divide-y divide-gray-100">
                {category.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="px-4 py-4">
                    <h4 className="text-sm font-medium text-gray-900 mb-3">
                      {item.feature}
                    </h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center">
                        <div className="text-xs text-gray-500 mb-1">
                          {t("free")}
                        </div>
                        {renderValue(item.free)}
                      </div>
                      <div className="text-center bg-yellow-50 rounded-lg p-2">
                        <div className="text-xs text-gray-500 mb-1">
                          {t("premium")}
                        </div>
                        {renderValue(item.premium)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-12 text-center">
          <button
            onClick={() => {
              document
                .getElementById("pricing")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center px-8 py-4 text-lg font-semibold text-white 
                     bg-gradient-to-r from-yellow-500 to-amber-600 rounded-full 
                     hover:from-yellow-600 hover:to-amber-700 transform transition-all 
                     duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
          >
            {t("upgrade_to_premium")}
            <svg
              className="w-5 h-5 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 10l7-7m0 0l7 7m-7-7v18"
              />
            </svg>
          </button>
        </div>
      </div>
    </section>
  );
}
