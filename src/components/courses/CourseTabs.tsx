// src/components/courses/CourseTabs.tsx
"use client";

import { useTranslations } from "next-intl";

interface CourseTabsProps {
  activeTab: "courses" | "enrollments";
  onTabChange: (tab: "courses" | "enrollments") => void;
}

export default function CourseTabs({
  activeTab,
  onTabChange,
}: CourseTabsProps) {
  const t = useTranslations("courses.tabs");

  const tabs = [
    { id: "courses" as const, label: t("courses") },
    { id: "enrollments" as const, label: t("enrollments") },
  ];

  return (
    <div className="flex space-x-1 mb-6 bg-gray-100 p-1 rounded-lg w-full max-w-md mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`
            flex-1 py-2 px-4 rounded-md font-medium transition-all duration-200
            ${
              activeTab === tab.id
                ? "bg-white text-red-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }
          `}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
