// src/components/forum/ForumCategories.tsx
"use client";

import { useEffect, memo, useMemo } from "react";
import { useTranslations } from "next-intl";
import { usePathname } from "next/navigation";
import { useForum } from "@/hooks/useForum";
import { useForumContext } from "@/contexts/ForumContext";

interface ForumCategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  refreshTrigger?: number;
}

const ForumCategories = memo(function ForumCategories({
  selectedCategory,
  onCategorySelect,
  refreshTrigger,
}: ForumCategoriesProps) {
  const t = useTranslations("forum.categories");
  const { state } = useForumContext();
  const { fetchCategories } = useForum();

  // Only fetch categories once on mount
  useEffect(() => {
    if (state.categories.length === 0) {
      fetchCategories();
    }
  }, [fetchCategories, state.categories.length]);

  // Calculate total post count
  const totalPostCount = useMemo(() => {
    return state.categories.reduce(
      (sum, cat) => sum + (cat.post_count || 0),
      0
    );
  }, [state.categories]);

  // Don't show skeleton if we already have categories (language change)
  if (state.isLoading && state.categories.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-4 md:p-6">
        <h2 className="text-lg md:text-xl font-bold text-[#118B50] mb-4">
          {t("title")}
        </h2>
        <div className="space-y-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="w-full h-12 bg-gray-200/50 animate-pulse rounded-lg"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-[#118B50] mb-4">
        {t("title")}
      </h2>

      <div className="space-y-2">
        {/* All Categories button */}
        <button
          onClick={() => onCategorySelect(null)}
          className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group
            ${
              selectedCategory === null
                ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white shadow-md"
                : "hover:bg-white/50 text-gray-700 hover:text-[#118B50]"
            }`}
          aria-pressed={selectedCategory === null}
          role="button"
        >
          <span className="font-medium">{t("all")}</span>
          <div
            className={`flex items-center space-x-2 ${
              selectedCategory === null ? "text-white/80" : "text-gray-500"
            }`}
          >
            <span className="text-sm">{totalPostCount}</span>
            <svg
              className={`w-4 h-4 transition-transform duration-200 ${
                selectedCategory === null
                  ? "translate-x-1"
                  : "group-hover:translate-x-1"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </div>
        </button>

        {/* Category buttons */}
        {state.categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onCategorySelect(category.id)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group
              ${
                selectedCategory === category.id
                  ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white shadow-md"
                  : "hover:bg-white/50 text-gray-700 hover:text-[#118B50]"
              }`}
            aria-pressed={selectedCategory === category.id}
            role="button"
          >
            <span className="font-medium">{category.name}</span>
            <div
              className={`flex items-center space-x-2 ${
                selectedCategory === category.id
                  ? "text-white/80"
                  : "text-gray-500"
              }`}
            >
              <span className="text-sm">{category.post_count || 0}</span>
              <svg
                className={`w-4 h-4 transition-transform duration-200 ${
                  selectedCategory === category.id
                    ? "translate-x-1"
                    : "group-hover:translate-x-1"
                }`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>
          </button>
        ))}

        {/* Empty state */}
        {state.categories.length === 0 && !state.isLoading && (
          <div className="text-center py-8 text-gray-500">
            <p>{t("no_categories")}</p>
          </div>
        )}
      </div>

      {/* Error state */}
      {state.error && (
        <div className="mt-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">
          <p>{t("error_loading")}</p>
          <button
            onClick={fetchCategories}
            className="text-red-700 underline hover:no-underline mt-1"
          >
            {t("retry")}
          </button>
        </div>
      )}
    </div>
  );
});

export default ForumCategories;
