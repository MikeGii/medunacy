// src/components/courses-panel/CourseForm.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { Course, CourseCategory } from "@/types/course.types";
import { usePathname } from "next/navigation";
import { useSubmissionGuard } from "@/hooks/useSubmissionGuard";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface CourseFormProps {
  course: Course | null;
  categories: CourseCategory[];
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
  isInline?: boolean;
}

export default function CourseForm({
  course,
  categories,
  onSubmit,
  onClose,
  isInline = false,
}: CourseFormProps) {
  const t = useTranslations("courses_panel.form");
  const [error, setError] = useState<string | null>(null);
  const tCourses = useTranslations("courses");
  const pathname = usePathname();
  const locale = pathname.startsWith("/ukr") ? "ukr" : "et";

  const [formData, setFormData] = useState({
    name: "",
    provider: "",
    description: "",
    category_id: "",
    start_date: "",
    end_date: "",
    location_type: "in_person" as "online" | "hybrid" | "in_person",
    course_type: "free" as "paid" | "free",
    is_premium: false,
  });

  useEffect(() => {
    if (course) {
      setFormData({
        name: course.name,
        provider: course.provider,
        description: course.description || "",
        category_id: course.category_id || "",
        start_date: course.start_date,
        end_date: course.end_date || "",
        location_type: course.location_type,
        course_type: course.course_type,
        is_premium: course.is_premium || false,
      });
    }
  }, [course]);

  const { guardedSubmit, isSubmitting } = useSubmissionGuard({
    onError: (error) => {
      setError(error.message);
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await guardedSubmit(async () => {
      setError(null);

      const result = await onSubmit(formData);

      if (!result.success) {
        throw new Error(
          result.error ||
            t(course ? "messages.update_error" : "messages.create_error")
        );
      }

      onClose();
    });
  };

  const formContent = (
    <div
      className={
        isInline ? "bg-white rounded-xl border border-gray-200 p-6" : "p-6"
      }
    >
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {course ? t("edit_course") : t("create_course")}
      </h3>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.name")}
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
              placeholder={t("fields.name_placeholder")}
            />
          </div>

          {/* Provider */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.provider")}
            </label>
            <input
              type="text"
              required
              value={formData.provider}
              onChange={(e) =>
                setFormData({ ...formData, provider: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
              placeholder={t("fields.provider_placeholder")}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.category")}
            </label>
            <select
              required
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
            >
              <option value="">{t("fields.select_category")}</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {locale === "ukr" ? cat.name_uk : cat.name_et}
                </option>
              ))}
            </select>
          </div>

          {/* Start Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.start_date")}
            </label>
            <input
              type="date"
              required
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
            />
          </div>

          {/* End Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.end_date")}
            </label>
            <input
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
            />
          </div>

          {/* Location Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.location_type")}
            </label>
            <select
              value={formData.location_type}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location_type: e.target.value as any,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
            >
              <option value="in_person">
                {tCourses("location_types.in_person")}
              </option>
              <option value="online">
                {tCourses("location_types.online")}
              </option>
              <option value="hybrid">
                {tCourses("location_types.hybrid")}
              </option>
            </select>
          </div>

          {/* Course Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {t("fields.course_type")}
            </label>
            <select
              value={formData.course_type}
              onChange={(e) =>
                setFormData({ ...formData, course_type: e.target.value as any })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
            >
              <option value="free">{tCourses("course_types.free")}</option>
              <option value="paid">{tCourses("course_types.paid")}</option>
            </select>
          </div>
        </div>

        {/* Premium Course Toggle */}
        <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
          <div className="flex items-start">
            <input
              type="checkbox"
              id="is_premium"
              checked={formData.is_premium}
              onChange={(e) =>
                setFormData({ ...formData, is_premium: e.target.checked })
              }
              className="w-4 h-4 mt-0.5 text-[#118B50] bg-white border-gray-300 rounded focus:ring-[#118B50] focus:ring-2"
            />
            <div className="ml-3">
              <label
                htmlFor="is_premium"
                className="text-sm font-medium text-gray-700"
              >
                {t("fields.premium_course")}
              </label>
              <p className="text-xs text-gray-500 mt-0.5">
                {t("fields.premium_course_description")}
              </p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {t("fields.description")}
          </label>
          <textarea
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
            placeholder={t("fields.description_placeholder")}
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
            disabled={isSubmitting}
            className="px-4 py-2 bg-gradient-to-r from-[#5DB996] to-[#118B50] text-white font-medium rounded-lg hover:from-[#5DB996] hover:to-[#0F7541] transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>{t("actions.saving")}</span>
              </div>
            ) : course ? (
              t("actions.update")
            ) : (
              t("actions.create")
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
        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
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
