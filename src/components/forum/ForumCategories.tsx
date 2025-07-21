"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";

interface Category {
  id: string;
  name: string;
  post_count?: number;
}

interface ForumCategoriesProps {
  selectedCategory: string | null;
  onCategorySelect: (categoryId: string | null) => void;
  refreshTrigger?: number;
}

export default function ForumCategories({
  selectedCategory,
  onCategorySelect,
  refreshTrigger,
}: ForumCategoriesProps) {
  const t = useTranslations("forum.categories");
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, [refreshTrigger]);

  const fetchCategories = async () => {
    try {
      // First, just get the categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("forum_categories")
        .select("id, name")
        .order("name");

      if (categoriesError) throw categoriesError;

      // Then get post counts separately
      const { data: postsData, error: postsError } = await supabase
        .from("forum_posts")
        .select("category_id")
        .eq("is_deleted", false);

      if (postsError) throw postsError;

      // Calculate post counts
      const postCounts =
        postsData?.reduce((acc, post) => {
          acc[post.category_id] = (acc[post.category_id] || 0) + 1;
          return acc;
        }, {} as Record<string, number>) || {};

      // Combine categories with counts
      const categoriesWithCount = (categoriesData || []).map((cat) => ({
        id: cat.id,
        name: cat.name,
        post_count: postCounts[cat.id] || 0,
      }));

      setCategories(categoriesWithCount);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-4 md:p-6">
      <h2 className="text-lg md:text-xl font-bold text-[#118B50] mb-4">
        {t("title")}
      </h2>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin w-6 h-6 border-3 border-[#118B50] border-t-transparent rounded-full"></div>
        </div>
      ) : (
        <div className="space-y-2">
          {/* All Categories button */}
          <button
            onClick={() => onCategorySelect(null)}
            className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group
              ${
                selectedCategory === null
                  ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white"
                  : "hover:bg-white/50 text-gray-700 hover:text-[#118B50]"
              }`}
          >
            <span className="font-medium">{t("all")}</span>
            <div
              className={`flex items-center space-x-2 ${
                selectedCategory === null ? "text-white/80" : "text-gray-500"
              }`}
            >
              <span className="text-sm">
                {categories.reduce(
                  (sum, cat) => sum + (cat.post_count || 0),
                  0
                )}
              </span>
              <svg
                className="w-4 h-4"
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
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => onCategorySelect(category.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition-all duration-200 flex items-center justify-between group
                ${
                  selectedCategory === category.id
                    ? "bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white"
                    : "hover:bg-white/50 text-gray-700 hover:text-[#118B50]"
                }`}
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
                  className="w-4 h-4"
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
        </div>
      )}
    </div>
  );
}
