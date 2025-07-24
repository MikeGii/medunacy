"use client";

import { useTranslations } from "next-intl";

interface CoursesPanelTabsProps {
  activeTab: "courses" | "categories" | "enrollments";
  onTabChange: (tab: "courses" | "categories" | "enrollments") => void;
}

export default function CoursesPanelTabs({ activeTab, onTabChange }: CoursesPanelTabsProps) {
  const t = useTranslations("courses_panel.tabs");

  const tabs = [
    { id: "courses" as const, label: t("courses") },
    { id: "categories" as const, label: t("categories") },
    { id: "enrollments" as const, label: t("enrollments") },
  ];

  return (
    <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg">
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