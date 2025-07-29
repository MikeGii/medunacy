// src/components/courses-panel/CoursesPanelTabs.tsx - Enhanced mobile version
"use client";

import { useTranslations } from "next-intl";
import { useRef, useState, useEffect } from "react";

interface CoursesPanelTabsProps {
  activeTab: "courses" | "categories" | "enrollments";
  onTabChange: (tab: "courses" | "categories" | "enrollments") => void;
}

export default function CoursesPanelTabs({
  activeTab,
  onTabChange,
}: CoursesPanelTabsProps) {
  const t = useTranslations("courses_panel.tabs");
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftGradient, setShowLeftGradient] = useState(false);
  const [showRightGradient, setShowRightGradient] = useState(false);

  const tabs = [
    { id: "courses" as const, label: t("courses") },
    { id: "categories" as const, label: t("categories") },
    { id: "enrollments" as const, label: t("enrollments") },
  ];

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } =
        scrollContainerRef.current;
      setShowLeftGradient(scrollLeft > 0);
      setShowRightGradient(scrollLeft < scrollWidth - clientWidth - 5);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  return (
    <div className="relative">
      {/* Left gradient indicator for mobile */}
      {showLeftGradient && (
        <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-white to-transparent z-10 pointer-events-none md:hidden" />
      )}

      {/* Right gradient indicator for mobile */}
      {showRightGradient && (
        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent z-10 pointer-events-none md:hidden" />
      )}

      <div className="flex justify-center">
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="w-full md:w-auto overflow-x-auto scrollbar-hide"
          style={{
            scrollbarWidth: "none",
            msOverflowStyle: "none",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg min-w-max md:min-w-0">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`
                  px-4 py-2.5 rounded-md font-medium transition-all duration-200 whitespace-nowrap
                  md:px-6
                  ${
                    activeTab === tab.id
                      ? "bg-white text-[#118B50] shadow-sm"
                      : "text-gray-600 hover:text-gray-900"
                  }
                `}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
