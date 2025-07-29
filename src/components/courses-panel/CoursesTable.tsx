// src/components/courses-panel/CoursesTable.tsx
"use client";

import { useTranslations, useLocale } from "next-intl";
import { Course, CourseCategory } from "@/types/course.types";
import { format } from "date-fns";
import { et, uk } from "date-fns/locale";

interface CoursesTableProps {
  courses: Course[];
  categories: CourseCategory[];
  onEdit: (course: Course) => void;
  onDelete: (id: string) => void;
}

export default function CoursesTable({
  courses,
  categories,
  onEdit,
  onDelete,
}: CoursesTableProps) {
  const t = useTranslations("courses_panel.table");
  const tCourses = useTranslations("courses");
  const locale = useLocale();
  const dateLocale = locale === "ukr" ? uk : et;

  if (courses.length === 0) {
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
        <h3 className="text-lg font-semibold text-gray-700 mb-2">
          Koolitusi ei leitud
        </h3>
        <p className="text-gray-500">Lisa esimene koolitus, et alustada.</p>
      </div>
    );
  }

  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden md:block space-y-6">
        {categories
          .sort((a, b) => {
            const nameA = locale === "ukr" ? a.name_uk : a.name_et;
            const nameB = locale === "ukr" ? b.name_uk : b.name_et;
            return nameA.localeCompare(nameB);
          })
          .map((category) => {
            const categoryCourses = courses.filter(
              (course) => course.category_id === category.id
            );

            if (categoryCourses.length === 0) return null;

            return (
              <div
                key={category.id}
                className="bg-white rounded-xl border border-gray-200 overflow-hidden"
              >
                <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900">
                    {locale === "ukr" ? category.name_uk : category.name_et}
                    <span className="ml-2 text-xs font-normal text-gray-500">
                      ({categoryCourses.length}{" "}
                      {categoryCourses.length === 1 ? "koolitus" : "koolitust"})
                    </span>
                  </h3>
                </div>

                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-100">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("name")}
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("provider")}
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("date")}
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("type")}
                      </th>
                      <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("enrolled")}
                      </th>
                      <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                        {t("actions")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-100">
                    {categoryCourses.map((course) => (
                      <tr key={course.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
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
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {course.provider}
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {format(new Date(course.start_date), "dd.MM.yyyy", {
                            locale: dateLocale,
                          })}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                            {tCourses(`location_types.${course.location_type}`)}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-center text-sm text-gray-900">
                          {course.enrollment_count || 0}
                        </td>
                        <td className="px-6 py-3 text-center">
                          <div className="flex items-center justify-center space-x-2">
                            <button
                              onClick={() => onEdit(course)}
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
                              onClick={() => onDelete(course.id)}
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
            );
          })}
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden space-y-6">
        {categories
          .sort((a, b) => {
            const nameA = locale === "ukr" ? a.name_uk : a.name_et;
            const nameB = locale === "ukr" ? b.name_uk : b.name_et;
            return nameA.localeCompare(nameB);
          })
          .map((category) => {
            const categoryCourses = courses.filter(
              (course) => course.category_id === category.id
            );

            if (categoryCourses.length === 0) return null;

            return (
              <div key={category.id} className="space-y-4">
                <h3 className="text-sm font-semibold text-gray-900 px-2">
                  {locale === "ukr" ? category.name_uk : category.name_et}
                  <span className="ml-2 text-xs font-normal text-gray-500">
                    ({categoryCourses.length})
                  </span>
                </h3>

                {categoryCourses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg border border-gray-200 p-4"
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900">
                          {course.name}
                        </h4>
                        <p className="text-xs text-gray-600 mt-1">
                          {course.provider}
                        </p>
                      </div>
                      <div className="flex items-center space-x-2 ml-4">
                        <button
                          onClick={() => onEdit(course)}
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
                          onClick={() => onDelete(course.id)}
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

                    {course.description && (
                      <p className="text-xs text-gray-500 mb-3 line-clamp-2">
                        {course.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-gray-500">Kuupäev:</span>
                        <span className="ml-1 text-gray-900">
                          {format(new Date(course.start_date), "dd.MM.yyyy", {
                            locale: dateLocale,
                          })}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-500">Tüüp:</span>
                        <span className="ml-1 inline-flex px-2 py-0.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                          {tCourses(`location_types.${course.location_type}`)}
                        </span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-gray-500">Registreerunud:</span>
                        <span className="ml-1 text-gray-900 font-medium">
                          {course.enrollment_count || 0}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
      </div>
    </>
  );
}
