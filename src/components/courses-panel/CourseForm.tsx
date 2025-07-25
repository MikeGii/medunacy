"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { createPortal } from "react-dom";
import { Course, CourseCategory } from "@/types/course.types";
import { usePathname } from "next/navigation";
import { useSubmissionGuard } from "@/hooks/useSubmissionGuard";

interface CourseFormProps {
  course: Course | null;
  categories: CourseCategory[];
  onSubmit: (data: any) => Promise<{ success: boolean; error?: string }>;
  onClose: () => void;
}

export default function CourseForm({
  course,
  categories,
  onSubmit,
  onClose,
}: CourseFormProps) {
  const t = useTranslations("courses_panel.form");
  const [loading, setLoading] = useState(false);
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

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="fixed inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        <div className="relative bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              {course ? t("edit_course") : t("create_course")}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t("fields.provider_placeholder")}
                />
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  placeholder={t("fields.description_placeholder")}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="">{t("fields.select_category")}</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {locale === "ukr" ? cat.name_uk : cat.name_et}
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
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
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    setFormData({
                      ...formData,
                      course_type: e.target.value as any,
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                >
                  <option value="free">{tCourses("course_types.free")}</option>
                  <option value="paid">{tCourses("course_types.paid")}</option>
                </select>
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
                  disabled={isSubmitting}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isSubmitting
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                        />
                      </svg>
                      {t("messages.saving")}
                    </span>
                  ) : (
                    t(course ? "actions.update" : "actions.create")
                  )}
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
