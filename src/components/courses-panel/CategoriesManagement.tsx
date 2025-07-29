// src/components/courses-panel/CategoriesManagement.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getCourseCategories } from "@/lib/courses";
import { useCourseManagement } from "@/hooks/useCourseManagement";
import { useCourses } from "@/hooks/useCourses";
import { CourseCategory } from "@/types/course.types";
import CategoryForm from "./CategoryForm";

export default function CategoriesManagement() {
  const t = useTranslations("courses_panel");
  const locale = useLocale();
  const { createCategory, updateCategory, deleteCategory } =
    useCourseManagement();
  const { courses } = useCourses(); // Get courses to count them per category

  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(
    null
  );

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await getCourseCategories();
      setCategories(data);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // Calculate course count for each category
  const getCategoryCoursesCount = (categoryId: string) => {
    return courses.filter((course) => course.category_id === categoryId).length;
  };

  const handleCreate = async (data: any) => {
    const result = await createCategory(data);
    if (result.success) {
      setIsFormOpen(false);
      fetchCategories();
    }
    return result;
  };

  const handleUpdate = async (data: any) => {
    if (!editingCategory) return { success: false };

    const result = await updateCategory(editingCategory.id, data);
    if (result.success) {
      setEditingCategory(null);
      setIsFormOpen(false);
      fetchCategories();
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("messages.category_delete_confirm"))) return;

    const result = await deleteCategory(id);
    if (result.success) {
      fetchCategories();
    }
  };

  const handleEdit = (category: CourseCategory) => {
    setEditingCategory(category);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("tabs.categories")}
        </h2>
        {!isFormOpen && (
          <button
            onClick={() => setIsFormOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#5DB996] to-[#118B50] text-white font-medium rounded-lg hover:from-[#5DB996] hover:to-[#0F7541] transition-all duration-200 shadow-md"
          >
            {t("form.create_category")}
          </button>
        )}
      </div>

      {/* Inline Form */}
      {isFormOpen && (
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
          isInline={true}
        />
      )}

      {/* Categories Table/Cards */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5DB996]"></div>
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
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
                d="M7 7h10M7 11h10m-7 4h4"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-700 mb-2">
            Kategooriaid ei leitud
          </h3>
          <p className="text-gray-500">Lisa esimene kategooria, et alustada.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nimi
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Koolitusi
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("table.actions")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {categories.map((category) => (
                  <tr key={category.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {locale === "ukr"
                            ? category.name_uk
                            : category.name_et}
                        </div>
                        <div className="text-xs text-gray-500">
                          {locale === "ukr"
                            ? category.name_et
                            : category.name_uk}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">
                      {getCategoryCoursesCount(category.id)}
                    </td>
                    <td className="px-6 py-3 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-1 text-gray-600 hover:text-[#118B50] transition-colors"
                          title="Edit"
                        >
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
                              d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                            />
                          </svg>
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-1 text-gray-600 hover:text-red-600 transition-colors"
                          title="Delete"
                        >
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
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-4">
            {categories.map((category) => (
              <div
                key={category.id}
                className="bg-white rounded-lg border border-gray-200 p-4"
              >
                <div className="flex justify-between items-start mb-2">
                  <div className="flex-1">
                    <h3 className="text-sm font-medium text-gray-900">
                      {locale === "ukr" ? category.name_uk : category.name_et}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {locale === "ukr" ? category.name_et : category.name_uk}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(category)}
                      className="p-1.5 text-gray-600 hover:text-[#118B50] transition-colors"
                    >
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
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="p-1.5 text-gray-600 hover:text-red-600 transition-colors"
                    >
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
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="flex items-center text-xs text-gray-600">
                  <span className="font-medium">
                    {getCategoryCoursesCount(category.id)}
                  </span>
                  <span className="ml-1">koolitust</span>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
