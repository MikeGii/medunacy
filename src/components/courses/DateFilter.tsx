// src/components/courses/DateFilter.tsx
"use client";

import { useTranslations } from "next-intl";

interface DateFilterProps {
  selectedFilter: "all" | "upcoming" | "past";
  onFilterChange: (filter: "all" | "upcoming" | "past") => void;
}

export default function DateFilter({ selectedFilter, onFilterChange }: DateFilterProps) {
  const t = useTranslations("courses.filters");

  const filters = [
    { id: "all" as const, label: t("show_all") },
    { id: "upcoming" as const, label: t("show_upcoming") },
    { id: "past" as const, label: t("show_past") },
  ];

  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`
            px-4 py-2 rounded-lg font-medium transition-all duration-200
            text-sm sm:text-base
            ${
              selectedFilter === filter.id
                ? "bg-red-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900"
            }
          `}
        >
          {filter.label}
        </button>
      ))}
    </div>
  );
}