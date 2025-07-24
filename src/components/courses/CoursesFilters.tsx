"use client";

import { useTranslations } from "next-intl";
import { CourseCategory } from "@/types/course.types";
import { usePathname } from "next/navigation";

interface CoursesFiltersProps {
  categories: CourseCategory[];
  selectedCategory: string;
  onCategoryChange: (categoryId: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export default function CoursesFilters({
  categories,
  selectedCategory,
  onCategoryChange,
  searchQuery,
  onSearchChange,
}: CoursesFiltersProps) {
  const t = useTranslations("courses.filters");
  const pathname = usePathname();
  const locale = pathname.startsWith("/ukr") ? "ukr" : "et";

  return (
    <div className="flex flex-col sm:flex-row gap-4 mb-6">
      {/* Category Filter */}
      <select
        value={selectedCategory}
        onChange={(e) => onCategoryChange(e.target.value)}
        className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
      >
        <option value="">{t("all_categories")}</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {locale === "ukr" ? category.name_uk : category.name_et}
          </option>
        ))}
      </select>

      {/* Search */}
      <div className="flex-1">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={t("search_placeholder")}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
