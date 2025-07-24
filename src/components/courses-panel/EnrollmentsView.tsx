"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCourses } from "@/hooks/useCourses";
import { getCourseEnrollments } from "@/lib/courses";
import { CourseEnrollment } from "@/types/course.types";
import { format } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePathname } from "next/navigation";

export default function EnrollmentsView() {
  const t = useTranslations("courses_panel.enrollments");
  const locale = usePathname().startsWith("/ukr") ? "ukr" : "et";
  const { courses, loading } = useCourses();

  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [enrollmentsLoading, setEnrollmentsLoading] = useState(false);

  const dateLocale = locale === "ukr" ? uk : et;

  const handleCourseSelect = async (courseId: string) => {
    setSelectedCourseId(courseId);

    if (!courseId) {
      setEnrollments([]);
      return;
    }

    try {
      setEnrollmentsLoading(true);
      const data = await getCourseEnrollments(courseId);
      setEnrollments(data);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setEnrollmentsLoading(false);
    }
  };

  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          {t("title")}
        </h2>

        {/* Course Selector */}
        <select
          value={selectedCourseId}
          onChange={(e) => handleCourseSelect(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
        >
          <option value="">{t("select_course")}</option>

          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} -{" "}
              {format(new Date(course.start_date), "d MMM yyyy", {
                locale: dateLocale,
              })}
            </option>
          ))}
        </select>
      </div>

      {/* Selected Course Info */}
      {selectedCourse && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-semibold text-blue-900">{selectedCourse.name}</h3>
          <p className="text-blue-700">
            {selectedCourse.provider} •{" "}
            {format(new Date(selectedCourse.start_date), "d MMMM yyyy", {
              locale: dateLocale,
            })}
          </p>
        </div>
      )}

      {/* Enrollments Table */}
      {enrollmentsLoading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : enrollments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-500">
            {selectedCourseId
              ? t("no_enrollments")
              : t("select_course_to_view")}
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  {t("enrolled_at")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {enrollments.map((enrollment) => (
                <tr key={enrollment.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {enrollment.user?.first_name} {enrollment.user?.last_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {enrollment.user?.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {format(
                      new Date(enrollment.enrolled_at),
                      "d MMM yyyy HH:mm",
                      { locale: dateLocale }
                    )}
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
