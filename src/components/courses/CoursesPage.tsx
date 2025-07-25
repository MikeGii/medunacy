"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import {
  getCourses,
  getCourseCategories,
  getUserEnrollments,
} from "@/lib/courses";
import { Course, CourseCategory, CourseEnrollment } from "@/types/course.types";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import CoursesList from "./CoursesList";
import CoursesFilters from "./CoursesFilters";
import CourseTabs from "./CourseTabs";

function CoursesPageContent() {
  const t = useTranslations("courses");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "my_courses"
  >("upcoming");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getCourseCategories();
        setCategories(data);
      } catch (err) {
        console.error("Error fetching categories:", err);
      }
    };
    fetchCategories();
  }, []);

  // Fetch courses based on active tab
  const fetchCourses = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let coursesData: Course[] = [];

      if (activeTab === "my_courses") {
        // Fetch user's enrolled courses
        const enrollments = await getUserEnrollments(user.id);
        coursesData = enrollments
          .filter((enrollment) => enrollment.course)
          .map((enrollment) => ({
            ...enrollment.course!,
            is_enrolled: true,
          }));
      } else {
        // Fetch all courses and filter by status
        const allCourses = await getCourses({ user_id: user.id });
        coursesData = allCourses.filter(
          (course) => course.status === activeTab
        );
      }

      setCourses(coursesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
      console.error("Error fetching courses:", err);
    } finally {
      setLoading(false);
    }
  }, [activeTab, user]);

  // Fetch courses when tab changes or user logs in
  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [activeTab, user, fetchCourses]);

  // Handle enrollment actions
  const handleEnroll = async (courseId: string) => {
    try {
      const { enrollInCourse } = await import("@/lib/courses");
      await enrollInCourse(courseId);

      // Update local state
      setCourses(
        courses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                is_enrolled: true,
                enrollment_count: (course.enrollment_count || 0) + 1,
              }
            : course
        )
      );

      // If we're on "my_courses" tab, refetch to show the new enrollment
      if (activeTab === "my_courses") {
        fetchCourses();
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to enroll";
      return { success: false, error: message };
    }
  };

  const handleUnenroll = async (courseId: string) => {
    try {
      const { unenrollFromCourse } = await import("@/lib/courses");
      await unenrollFromCourse(courseId);

      // Update local state
      setCourses(
        courses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                is_enrolled: false,
                enrollment_count: Math.max(
                  0,
                  (course.enrollment_count || 1) - 1
                ),
              }
            : course
        )
      );

      // If we're on "my_courses" tab, remove the course from the list
      if (activeTab === "my_courses") {
        setCourses(courses.filter((course) => course.id !== courseId));
      }

      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unenroll";
      return { success: false, error: message };
    }
  };

  // Filter courses based on search and category
  const filteredCourses = courses.filter((course) => {
    // Category filter
    if (selectedCategory && course.category_id !== selectedCategory) {
      return false;
    }

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        course.name.toLowerCase().includes(query) ||
        course.provider.toLowerCase().includes(query) ||
        course.description?.toLowerCase().includes(query)
      );
    }

    return true;
  });

  // Handle tab change
  const handleTabChange = (tab: "upcoming" | "past" | "my_courses") => {
    setActiveTab(tab);
    // Reset filters when changing tabs
    setSelectedCategory("");
    setSearchQuery("");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("description")}</p>
        </div>

        {/* Tabs */}
        <CourseTabs activeTab={activeTab} onTabChange={handleTabChange} />

        {/* Filters - hide on my_courses tab if no courses */}
        {(activeTab !== "my_courses" || filteredCourses.length > 0) && (
          <CoursesFilters
            categories={categories}
            selectedCategory={selectedCategory}
            onCategoryChange={setSelectedCategory}
            searchQuery={searchQuery}
            onSearchChange={setSearchQuery}
          />
        )}

        {/* Courses List */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
            <span className="ml-3 text-gray-600">{t("loading")}</span>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-center">
            {t("error")}
          </div>
        ) : (
          <CoursesList
            courses={filteredCourses}
            activeTab={activeTab}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
          />
        )}
      </main>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <AuthModalProvider>
      <CoursesPageContent />
    </AuthModalProvider>
  );
}
