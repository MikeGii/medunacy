"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { Course } from "@/types/course.types";
import { format } from "date-fns";
import { et, uk } from "date-fns/locale";
import CourseDetailsModal from "./CourseDetailsModal";
import { usePathname } from "next/navigation";

interface CourseCardProps {
  course: Course;
  onEnroll: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  onUnenroll: (
    courseId: string
  ) => Promise<{ success: boolean; error?: string }>;
}

export default function CourseCard({
  course,
  onEnroll,
  onUnenroll,
}: CourseCardProps) {
  const t = useTranslations("courses");
  const tMessages = useTranslations("courses.messages");
  const pathname = usePathname();
  const locale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const dateLocale = locale === "ukr" ? uk : et;

  const handleEnrollmentToggle = async () => {
    setLoading(true);
    const result = course.is_enrolled
      ? await onUnenroll(course.id)
      : await onEnroll(course.id);

    if (!result.success && result.error) {
      alert(
        result.error === "Already enrolled in this course"
          ? tMessages("already_enrolled")
          : result.error
      );
    }
    setLoading(false);
  };

  const handleViewDetails = () => {
    setShowDetails(true);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300">
      {/* Card Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 p-4 relative">
        <h3 className="text-xl font-bold text-white line-clamp-2">
          {course.name}
        </h3>
        <p className="text-red-100 text-sm mt-1">{course.provider}</p>
        {/* Premium Badge */}
        {course.is_premium && (
          <div className="absolute top-2 right-2">
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-400 text-yellow-900">
              <svg
                className="w-3 h-3 mr-1"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {t("premium")}
            </span>
          </div>
        )}
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Date */}
        <div className="flex items-center text-gray-600">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
            />
          </svg>
          <span className="text-sm">
            {format(new Date(course.start_date), "d MMMM yyyy", {
              locale: dateLocale,
            })}
            {course.end_date && (
              <>
                {" "}
                -{" "}
                {format(new Date(course.end_date), "d MMMM yyyy", {
                  locale: dateLocale,
                })}
              </>
            )}
          </span>
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600">
          <svg
            className="w-5 h-5 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          <span className="text-sm">
            {t(`location_types.${course.location_type}`)}
          </span>
        </div>

        {/* Category & Type */}
        <div className="flex flex-wrap gap-2">
          {course.category && (
            <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
              {locale === "ukr"
                ? course.category.name_uk
                : course.category.name_et}
            </span>
          )}
          <span
            className={`px-2 py-1 text-xs rounded-full ${
              course.course_type === "free"
                ? "bg-green-100 text-green-700"
                : "bg-yellow-100 text-yellow-700"
            }`}
          >
            {t(`course_types.${course.course_type}`)}
          </span>
        </div>

        {/* Description */}
        {course.description && (
          <p className="text-gray-600 text-sm line-clamp-2">
            {course.description}
          </p>
        )}

        {/* Enrollment count */}
        {course.enrollment_count !== undefined &&
          course.enrollment_count > 0 && (
            <p className="text-sm text-gray-500">
              {t("course.enrolled_count", { count: course.enrollment_count })}
            </p>
          )}
      </div>

      {/* Card Footer */}
      <div className="p-4 bg-gray-50 flex gap-2">
        <button
          onClick={handleViewDetails}
          className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
        >
          {t("actions.view_details")}
        </button>

        <button
          onClick={handleEnrollmentToggle}
          disabled={loading}
          className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 ${
            course.is_enrolled
              ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
              : "bg-red-600 text-white hover:bg-red-700"
          }`}
        >
          {loading ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="none"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                />
              </svg>
              {t("actions.loading")}
            </span>
          ) : course.is_enrolled ? (
            t("actions.unenroll")
          ) : (
            t("actions.enroll")
          )}
        </button>
      </div>

      <CourseDetailsModal
        isOpen={showDetails}
        courseId={course.id}
        onClose={() => setShowDetails(false)}
        onEnroll={onEnroll}
        onUnenroll={onUnenroll}
      />
    </div>
  );
}
