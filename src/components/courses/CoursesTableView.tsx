"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Course, CourseCategory } from "@/types/course.types";
import { format } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePathname } from "next/navigation";
import CourseDetailsModal from "./CourseDetailsModal";
import { useSubscription } from "@/hooks/useSubscription";

interface CoursesTableViewProps {
  courses: Course[];
  categories: CourseCategory[];
  onEnroll: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  onUnenroll: (
    courseId: string
  ) => Promise<{ success: boolean; error?: string }>;
  activeTab: "upcoming" | "past" | "my_courses";
}

export default function CoursesTableView({
  courses,
  categories,
  onEnroll,
  onUnenroll,
  activeTab,
}: CoursesTableViewProps) {
  const t = useTranslations("courses");
  const pathname = usePathname();
  const locale = pathname.startsWith("/ukr") ? "ukr" : "et";
  const dateLocale = locale === "ukr" ? uk : et;
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const { isPremium } = useSubscription();

  const handleCourseClick = (course: Course) => {
    if (course.is_premium && !isPremium) {
      setShowPremiumModal(true);
      return;
    }
    setSelectedCourse(course);
    setShowDetailsModal(true);
  };

  // Separate courses into free and premium
  const freeCourses = courses.filter((course) => !course.is_premium);
  const premiumCourses = courses.filter((course) => course.is_premium);

  if (courses.length === 0) {
    const emptyMessage = {
      upcoming: t("messages.no_upcoming"),
      past: t("messages.no_past"),
      my_courses: t("messages.no_enrolled"),
    }[activeTab];

    return (
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
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
        </div>
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  const renderCoursesTable = (
    coursesToRender: Course[],
    isPremiumSection: boolean
  ) => {
    return categories
      .sort((a, b) => {
        const nameA = locale === "ukr" ? a.name_uk : a.name_et;
        const nameB = locale === "ukr" ? b.name_uk : b.name_et;
        return nameA.localeCompare(nameB);
      })
      .map((category) => {
        const categoryCourses = coursesToRender.filter(
          (course) => course.category_id === category.id
        );

        if (categoryCourses.length === 0) return null;

        return (
          <div
            key={`${category.id}-${isPremiumSection ? "premium" : "free"}`}
            className={`bg-white rounded-xl border border-gray-200 overflow-hidden ${
              isPremiumSection && !isPremium ? "relative" : ""
            }`}
          >
            {/* Premium blur overlay - updated for mobile */}
            {isPremiumSection && !isPremium && (
              <div className="absolute inset-0 bg-white/40 backdrop-blur-[1px] z-10">
                <div className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-b border-yellow-200 px-4 py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-5 h-5 text-yellow-600 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {t("premium_required_title")}
                      </p>
                      <p className="text-xs text-gray-600">
                        {t("premium_required_message")}
                      </p>
                    </div>
                  </div>
                  <button
                    className="px-3 py-1.5 bg-yellow-500 text-white text-sm font-medium rounded-lg hover:bg-yellow-600 transition-colors whitespace-nowrap w-full sm:w-auto"
                    onClick={(e) => {
                      e.stopPropagation();
                      setShowPremiumModal(true);
                    }}
                  >
                    {t("upgrade_to_premium")}
                  </button>
                </div>
              </div>
            )}

            {/* Category Header */}
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900">
                {locale === "ukr" ? category.name_uk : category.name_et}
                <span className="ml-2 text-xs font-normal text-gray-500">
                  ({categoryCourses.length}{" "}
                  {categoryCourses.length === 1
                    ? t("counts.course")
                    : t("counts.courses")}
                  )
                </span>
              </h3>
            </div>

            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("table.name")}
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("course.provider")}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("course.date")}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("course.location")}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("course.type")}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("table.enrolled")}
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      {t("table.status")}
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-100">
                  {categoryCourses.map((course) => (
                    <tr
                      key={course.id}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        isPremiumSection && !isPremium ? "opacity-60" : ""
                      }`}
                      onClick={() => handleCourseClick(course)}
                    >
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {course.name}
                            </div>
                            {course.description && (
                              <div className="text-xs text-gray-500 truncate max-w-xs">
                                {course.description}
                              </div>
                            )}
                          </div>
                          {isPremiumSection && (
                            <svg
                              className="w-4 h-4 text-yellow-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-900">
                        {course.provider}
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-900">
                        {format(new Date(course.start_date), "dd.MM.yyyy", {
                          locale: dateLocale,
                        })}
                        {course.end_date && (
                          <>
                            <br />
                            <span className="text-xs text-gray-500">
                              {t("table.until")}{" "}
                              {format(new Date(course.end_date), "dd.MM.yyyy", {
                                locale: dateLocale,
                              })}
                            </span>
                          </>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {t(`location_types.${course.location_type}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            course.course_type === "free"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {t(`course_types.${course.course_type}`)}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-center text-sm text-gray-900">
                        {course.enrollment_count || 0}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {course.is_enrolled ? (
                          <span className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                            {t("table.enrolled")}
                          </span>
                        ) : (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleCourseClick(course);
                            }}
                            className="inline-flex px-3 py-1 text-xs font-medium rounded-full bg-red-100 text-red-800 hover:bg-red-200 transition-colors"
                          >
                            {t("table.view_details")}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-gray-100">
              {categoryCourses.map((course) => (
                <div
                  key={course.id}
                  className={`p-4 hover:bg-gray-50 cursor-pointer transition-colors ${
                    isPremiumSection && !isPremium ? "opacity-60" : ""
                  }`}
                  onClick={() => handleCourseClick(course)}
                >
                  <div className="space-y-3">
                    {/* Course Name and Lock */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                          {course.name}
                          {isPremiumSection && (
                            <svg
                              className="w-4 h-4 text-yellow-500"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                              />
                            </svg>
                          )}
                        </h4>
                        <p className="text-xs text-gray-600 mt-0.5">
                          {course.provider}
                        </p>
                        {course.description && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                            {course.description}
                          </p>
                        )}
                      </div>
                      {course.is_enrolled ? (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                          {t("table.enrolled")}
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                          {t("table.view_details")}
                        </span>
                      )}
                    </div>

                    {/* Course Details Grid */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">
                          {t("course.date")}:
                        </span>
                        <span className="ml-1 text-gray-900">
                          {format(new Date(course.start_date), "dd.MM.yyyy", {
                            locale: dateLocale,
                          })}
                          {course.end_date && (
                            <span className="text-gray-500">
                              {" "}
                              -{" "}
                              {format(new Date(course.end_date), "dd.MM.yyyy", {
                                locale: dateLocale,
                              })}
                            </span>
                          )}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {t("course.location")}:
                        </span>
                        <span className="ml-1 inline-flex px-1.5 py-0.5 text-xs font-medium rounded bg-blue-100 text-blue-800">
                          {t(`location_types.${course.location_type}`)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {t("course.type")}:
                        </span>
                        <span
                          className={`ml-1 inline-flex px-1.5 py-0.5 text-xs font-medium rounded ${
                            course.course_type === "free"
                              ? "bg-green-100 text-green-800"
                              : "bg-yellow-100 text-yellow-800"
                          }`}
                        >
                          {t(`course_types.${course.course_type}`)}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">
                          {t("table.enrolled")}:
                        </span>
                        <span className="ml-1 text-gray-900 font-medium">
                          {course.enrollment_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      });
  };

  return (
    <>
      <div className="space-y-8">
        {/* Free Courses Section */}
        {freeCourses.length > 0 && (
          <div className="space-y-6">
            {renderCoursesTable(freeCourses, false)}
          </div>
        )}

        {/* Premium Courses Section */}
        {premiumCourses.length > 0 && (
          <div className="space-y-6">
            <div className="text-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center justify-center gap-2">
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
                {t("premium_courses_title")}
                <svg
                  className="w-5 h-5 text-yellow-500"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </h2>
              {!isPremium && (
                <p className="text-sm text-gray-600 mt-1">
                  {t("premium_courses_subtitle")}
                </p>
              )}
            </div>
            {renderCoursesTable(premiumCourses, true)}
          </div>
        )}
      </div>

      {/* Course Details Modal - only for accessible courses */}
      {selectedCourse && (
        <CourseDetailsModal
          isOpen={showDetailsModal}
          courseId={selectedCourse.id}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedCourse(null);
          }}
          onEnroll={onEnroll}
          onUnenroll={onUnenroll}
        />
      )}

      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-opacity-20 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="text-center">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-yellow-600"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">
                {t("premium_required_title")}
              </h3>
              <p className="text-gray-600 mb-6">
                {t("premium_required_message")}
              </p>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={() => setShowPremiumModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  {t("close")}
                </button>
                <button
                  onClick={() => {
                    // Later this will redirect to payment page
                    setShowPremiumModal(false);
                  }}
                  className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  {t("upgrade_to_premium")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
