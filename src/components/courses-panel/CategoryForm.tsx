"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { CourseCategory } from "@/types/course.types";

interface CategoryFormProps {
  category: CourseCategory | null;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export default function CategoryForm({
  category,
  onSubmit,
  onClose,
}: CategoryFormProps) {
  const t = useTranslations("courses_panel.form");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    name_et: "",
    name_uk: "",
  });

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        name_et: category.name_et,
        name_uk: category.name_uk,
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onSubmit(formData);

    if (!result.success) {
      setError(result.error || t("validation.category_name_required"));
    } else {
      onClose();
    }

    setLoading(false);
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {category ? t("edit_category") : t("create_category")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Estonian Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.category_name_et")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_et}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      name_et: e.target.value,
                      name: e.target.value, // Use Estonian as default
                    });
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t("fields.category_name_placeholder")}
                />
              </div>

              {/* Ukrainian Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t("fields.category_name_uk")}
                </label>
                <input
                  type="text"
                  required
                  value={formData.name_uk}
                  onChange={(e) =>
                    setFormData({ ...formData, name_uk: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t("fields.category_name_placeholder")}
                />
              </div>

              {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-3 pt-4">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  {t("actions.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                >
                  {loading ? t("actions.saving") : t("actions.save")}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
