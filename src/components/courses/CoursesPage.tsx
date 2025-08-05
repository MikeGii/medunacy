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
import CoursesTableView from "./CoursesTableView";
import CoursesFilters from "./CoursesFilters";
import CourseTabs from "./CourseTabs";
import { useCourseAccess } from "@/hooks/useCourseAccess";
import { useRouter } from "next/navigation";
import { useLocale } from "next-intl";
import { supabase } from "@/lib/supabase";

function CoursesPageContent() {
  const t = useTranslations("courses");
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"courses" | "enrollments">(
    "courses"
  );
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();
  const locale = useLocale();

  const { checkCourseAccess } = useCourseAccess();
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [selectedPremiumCourse, setSelectedPremiumCourse] =
    useState<Course | null>(null);

  // Fetch categories once on mount
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // ADD THIS: Check session before fetching
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error in fetchCategories:", sessionError);
          return;
        }

        if (!session) {
          console.log("No session in fetchCategories - waiting for auth");
          return;
        }

        // EXISTING CODE continues here
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
    // Don't just check for user, also ensure session is ready
    if (!user) {
      console.log("No user in fetchCourses - waiting for auth");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // ADD THIS: Verify session before fetching
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Session error in fetchCourses:", sessionError);
        throw new Error("Authentication error");
      }

      if (!session) {
        console.log("No session in fetchCourses - auth not ready");
        setLoading(false);
        return;
      }

      let coursesData: Course[] = [];

      if (activeTab === "enrollments") {
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
        coursesData = allCourses;
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
      if (activeTab === "enrollments") {
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
      if (activeTab === "enrollments") {
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
  const handleTabChange = (tab: "courses" | "enrollments") => {
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
        {(activeTab === "courses" || filteredCourses.length > 0) && (
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
          <CoursesTableView
            courses={filteredCourses}
            categories={categories}
            activeTab={activeTab}
            onEnroll={handleEnroll}
            onUnenroll={handleUnenroll}
          />
        )}
      </main>

      {/* ADD THE PREMIUM MODAL HERE - before the closing div */}
      {showPremiumModal && (
        <div className="fixed inset-0 bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-xl">
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
                    router.push(`/${locale}/premium`);
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
