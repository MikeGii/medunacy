// src/components/courses-panel/CategoryForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { CourseCategory } from "@/types/course.types";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface CategoryFormProps {
  category: CourseCategory | null;
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
  isInline?: boolean;
}

export default function CategoryForm({
  category,
  onSubmit,
  onClose,
  isInline = false,
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
        name_et: category.name_et || "",
        name_uk: category.name_uk || "",
      });
    }
  }, [category]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const result = await onSubmit(formData);

    if (!result.success) {
      setError(
        result.error ||
          t(category ? "messages.update_error" : "messages.create_error")
      );
    }

    setLoading(false);
  };

  const formContent = (
    <div
      className={
        isInline ? "bg-white rounded-xl border border-gray-200 p-6" : "p-6"
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {category ? t("edit_category") : t("create_category")}
      </h3>

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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
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
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
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
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {t("actions.cancel")}
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-gradient-to-r from-[#5DB996] to-[#118B50] text-white font-medium rounded-lg hover:from-[#5DB996] hover:to-[#0F7541] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>{t("actions.saving")}</span>
              </div>
            ) : (
              t("actions.save")
            )}
          </button>
        </div>
      </form>
    </div>
  );

  // If inline, render directly
  if (isInline) {
    return formContent;
  }

  // Otherwise, render as modal
  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full">
          {formContent}
        </div>
      </div>
    </div>
  );

  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}
