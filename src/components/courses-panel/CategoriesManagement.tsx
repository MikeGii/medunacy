"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { getCourseCategories } from "@/lib/courses";
import { useCourseManagement } from "@/hooks/useCourseManagement";
import { CourseCategory } from "@/types/course.types";
import CategoryForm from "./CategoryForm";

export default function CategoriesManagement() {
  const t = useTranslations("courses_panel");
  const { createCategory, updateCategory, deleteCategory } = useCourseManagement();
  
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CourseCategory | null>(null);

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

  const handleCreate = async (data: any) => {
    const result = await createCategory(data);
    if (result.success) {
      setShowForm(false);
      fetchCategories();
    }
    return result;
  };

  const handleUpdate = async (data: any) => {
    if (!editingCategory) return { success: false };
    
    const result = await updateCategory(editingCategory.id, data);
    if (result.success) {
      setEditingCategory(null);
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
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCategory(null);
  };

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("tabs.categories")}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t("form.create_category")}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CategoryForm
          category={editingCategory}
          onSubmit={editingCategory ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}

      {/* Categories List */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("table.name")} (ET)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("table.name")} (UKR)
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("table.created_at")}
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {categories.map((category) => (
                <tr key={category.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.name_et}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.name_uk}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(category.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(category)}
                      className="text-indigo-600 hover:text-indigo-900 mr-4"
                    >
                      {t("form.actions.edit")}
                    </button>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      {t("form.actions.delete")}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}