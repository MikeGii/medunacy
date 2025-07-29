// src/components/courses-panel/EnrollmentsView.tsx
"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { getCourses, getCourseEnrollments } from "@/lib/courses";
import { Course } from "@/types/course.types";
import { format } from "date-fns";
import { et, uk } from "date-fns/locale";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface Enrollment {
  id: string;
  user_id: string;
  course_id: string;
  enrolled_at: string;
  user: {
    user_id: string;
    first_name: string;
    last_name: string;
    email: string;
  };
}

export default function EnrollmentsView() {
  const t = useTranslations("courses_panel.enrollments");
  const locale = useLocale();
  const dateLocale = locale === "ukr" ? uk : et;

  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingEnrollments, setLoadingEnrollments] = useState(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  useEffect(() => {
    if (selectedCourseId) {
      fetchEnrollments(selectedCourseId);
    }
  }, [selectedCourseId]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      const data = await getCourses();
      setCourses(data);

      if (data.length > 0 && !selectedCourseId) {
        setSelectedCourseId(data[0].id);
      }
    } catch (error) {
      console.error("Error fetching courses:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchEnrollments = async (courseId: string) => {
    try {
      setLoadingEnrollments(true);
      const data = await getCourseEnrollments(courseId);
      setEnrollments(data as any);
    } catch (error) {
      console.error("Error fetching enrollments:", error);
    } finally {
      setLoadingEnrollments(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Course Selector */}
      <div className="bg-gray-50 rounded-lg p-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {t("select_course")}
        </label>
        <select
          value={selectedCourseId}
          onChange={(e) => setSelectedCourseId(e.target.value)}
          className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5DB996] focus:border-transparent"
        >
          <option value="">{t("select_course_to_view")}</option>
          {courses.map((course) => (
            <option key={course.id} value={course.id}>
              {course.name} ({course.enrollment_count || 0}{" "}
              {t("enrolled").toLowerCase()})
            </option>
          ))}
        </select>
      </div>

      {/* Enrollments Table/Cards */}
      {selectedCourseId ? (
        loadingEnrollments ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : enrollments.length === 0 ? (
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
                  d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t("no_enrollments")}
            </h3>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="hidden md:block bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
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
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {enrollment.user.first_name}{" "}
                          {enrollment.user.last_name}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600">
                          {enrollment.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {format(
                          new Date(enrollment.enrolled_at),
                          "dd.MM.yyyy HH:mm",
                          {
                            locale: dateLocale,
                          }
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-3">
              {enrollments.map((enrollment) => (
                <div
                  key={enrollment.id}
                  className="bg-white rounded-lg border border-gray-200 p-4"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">
                        {enrollment.user.first_name} {enrollment.user.last_name}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {enrollment.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 text-xs text-gray-500">
                    <span>Registreerus: </span>
                    <span className="text-gray-700">
                      {format(
                        new Date(enrollment.enrolled_at),
                        "dd.MM.yyyy HH:mm",
                        {
                          locale: dateLocale,
                        }
                      )}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )
      ) : (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500">{t("select_course_to_view")}</p>
        </div>
      )}
    </div>
  );
}
