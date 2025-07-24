"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useTranslations } from "next-intl";
import { useCourseDetails } from "@/hooks/useCourses";
import { format } from "date-fns";
import { et, uk } from "date-fns/locale";

interface CourseDetailsModalProps {
  isOpen: boolean;
  courseId: string | null;
  onClose: () => void;
  onEnroll: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  onUnenroll: (courseId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CourseDetailsModal({
  isOpen,
  courseId,
  onClose,
  onEnroll,
  onUnenroll,
}: CourseDetailsModalProps) {
  const t = useTranslations("courses");
  const locale = useTranslations()("_locale") as "et" | "ukr";
  const modalRef = useRef<HTMLDivElement>(null);
  const [enrollLoading, setEnrollLoading] = useState(false);
  
  const { course, enrollments, loading, error } = useCourseDetails(courseId || "");
  const dateLocale = locale === "ukr" ? uk : et;

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  const handleEnrollmentToggle = async () => {
    if (!course) return;
    
    setEnrollLoading(true);
    const result = course.is_enrolled 
      ? await onUnenroll(course.id)
      : await onEnroll(course.id);
    
    if (!result.success && result.error) {
      alert(result.error);
    }
    setEnrollLoading(false);
  };

  if (!isOpen || !courseId) return null;

  const modalContent = (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex min-h-full items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          ref={modalRef}
          className="relative bg-white rounded-2xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto transform transition-all"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            aria-label="Close modal"
          >
            <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>

          {loading ? (
            <div className="p-8 flex justify-center items-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            </div>
          ) : error ? (
            <div className="p-8">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
                {error}
              </div>
            </div>
          ) : course ? (
            <>
              {/* Header */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 p-6 rounded-t-2xl">
                <h2 className="text-2xl font-bold text-white pr-12">{course.name}</h2>
                <p className="text-red-100 mt-2">{course.provider}</p>
              </div>

              {/* Content */}
              <div className="p-6 space-y-6">
                {/* Key Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Date */}
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">{t("course.date")}</p>
                      <p className="font-medium">
                        {format(new Date(course.start_date), "d MMMM yyyy", { locale: dateLocale })}
                        {course.end_date && (
                          <> - {format(new Date(course.end_date), "d MMMM yyyy", { locale: dateLocale })}</>
                        )}
                      </p>
                    </div>
                  </div>

                  {/* Location */}
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">{t("course.location")}</p>
                      <p className="font-medium">{t(`location_types.${course.location_type}`)}</p>
                    </div>
                  </div>

                  {/* Type */}
                  <div className="flex items-start space-x-3">
                    <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div>
                      <p className="text-sm text-gray-500">{t("course.type")}</p>
                      <p className="font-medium">{t(`course_types.${course.course_type}`)}</p>
                    </div>
                  </div>

                  {/* Category */}
                  {course.category && (
                    <div className="flex items-start space-x-3">
                      <svg className="w-5 h-5 text-gray-400 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <div>
                        <p className="text-sm text-gray-500">{t("course.category")}</p>
                        <p className="font-medium">
                          {locale === "ukr" ? course.category.name_uk : course.category.name_et}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Description */}
                {course.description && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {t("course.description")}
                    </h3>
                    <p className="text-gray-600 whitespace-pre-wrap">{course.description}</p>
                  </div>
                )}

                {/* Enrollment Info */}
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    {t("course.enrolled_count", { count: enrollments.length })}
                  </p>
                </div>

                {/* Action Button */}
                <div className="flex justify-end">
                  <button
                    onClick={handleEnrollmentToggle}
                    disabled={enrollLoading}
                    className={`px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 ${
                      course.is_enrolled
                        ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {enrollLoading ? (
                      <span className="flex items-center">
                        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                        {t("actions.loading")}
                      </span>
                    ) : (
                      course.is_enrolled ? t("actions.enrolled") : t("actions.enroll")
                    )}
                  </button>
                </div>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  );

  // Create portal for modal
  if (typeof document !== "undefined") {
    return createPortal(modalContent, document.body);
  }

  return null;
}