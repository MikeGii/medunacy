// src/components/exam-tests/creation/CategoryManagement.tsx - SIMPLIFIED VERSION

"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { TestCategory, TestCategoryCreate } from "@/types/exam";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface CategoryManagementProps {
  categories: TestCategory[];
  onRefresh: () => void;
}

export default function CategoryManagement({
  categories,
  onRefresh,
}: CategoryManagementProps) {
  const t = useTranslations("test_creation");
  const { user } = useAuth();
  const [isCreating, setIsCreating] = useState(false);
  const [editingCategory, setEditingCategory] = useState<TestCategory | null>(
    null
  );
  const [formData, setFormData] = useState<TestCategoryCreate>({
    name: "",
    description: "",
    slug: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleNameChange = (name: string) => {
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      setError("You must be logged in to create categories");
      return;
    }

    // Check user role client-side
    if (!["doctor", "admin"].includes(user.role || "")) {
      setError("You don't have permission to create categories");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      if (editingCategory) {
        // Update existing category
        const { error } = await supabase
          .from("test_categories")
          .update({
            ...formData,
            updated_at: new Date().toISOString(),
          })
          .eq("id", editingCategory.id);

        if (error) throw error;
      } else {
        // Create new category
        const slug = formData.slug || generateSlug(formData.name);

        const { error } = await supabase.from("test_categories").insert({
          ...formData,
          slug,
          created_by: user.id,
          is_active: true,
        });

        if (error) throw error;
      }

      // Reset form and refresh
      setFormData({ name: "", description: "", slug: "" });
      setIsCreating(false);
      setEditingCategory(null);
      onRefresh();
    } catch (err) {
      console.error("Error saving category:", err);
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category: TestCategory) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      description: category.description || "",
      slug: category.slug,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingCategory(null);
    setFormData({ name: "", description: "", slug: "" });
    setError(null);
  };

  const handleDelete = async (category: TestCategory) => {
    if (!confirm(t("confirm_delete_category", { name: category.name }))) {
      return;
    }

    if (!user || !["doctor", "admin"].includes(user.role || "")) {
      setError("You don't have permission to delete categories");
      return;
    }

    try {
      const { error } = await supabase
        .from("test_categories")
        .delete()
        .eq("id", category.id);

      if (error) throw error;

      onRefresh();
    } catch (err) {
      console.error("Error deleting category:", err);
      setError(
        err instanceof Error ? err.message : "Failed to delete category"
      );
    }
  };

  // Rest of your component JSX remains the same...
  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#118B50]">{t("categories")}</h2>
        {!isCreating && (user?.role === "doctor" || user?.role === "admin") && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>{t("create_category")}</span>
            </div>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 border border-[#E3F0AF] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#118B50]">
            {editingCategory ? t("edit_category") : t("create_new_category")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("category_name")} *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => handleNameChange(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                placeholder={t("category_name_placeholder")}
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("category_description")}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                placeholder={t("category_description_placeholder")}
                rows={3}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("category_slug")} *
              </label>
              <input
                type="text"
                value={formData.slug}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, slug: e.target.value }))
                }
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                placeholder={t("category_slug_placeholder")}
                required
              />
              <p className="text-sm text-gray-500 mt-1">{t("slug_help")}</p>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span>{t("saving")}</span>
                  </div>
                ) : editingCategory ? (
                  t("update_category")
                ) : (
                  t("create_category")
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Categories List */}
      <div className="space-y-4">
        {categories.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t("no_categories")}
            </h3>
            <p className="text-gray-500">{t("no_categories_description")}</p>
          </div>
        ) : (
          categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {category.name}
                  </h3>
                  {category.description && (
                    <p className="text-gray-600 mb-3">{category.description}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span>Slug: {category.slug}</span>
                    <span>
                      Created:{" "}
                      {new Date(category.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
                {(user?.role === "doctor" || user?.role === "admin") && (
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => handleEdit(category)}
                      className="px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    >
                      {t("edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(category)}
                      className="px-3 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    >
                      {t("delete")}
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
