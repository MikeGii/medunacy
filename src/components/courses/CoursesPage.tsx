"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCourses } from "@/hooks/useCourses";
import CoursesList from "./CoursesList";
import CoursesFilters from "./CoursesFilters";
import CourseTabs from "./CourseTabs";

export default function CoursesPage() {
  const t = useTranslations("courses");
  const [activeTab, setActiveTab] = useState<
    "upcoming" | "past" | "my_courses"
  >("upcoming");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  const { courses, categories, loading, error, handleEnroll, handleUnenroll } =
    useCourses({
      status: activeTab === "my_courses" ? undefined : activeTab,
      category_id: selectedCategory || undefined,
    });

  // Filter courses based on tab and search
  const filteredCourses = courses.filter((course) => {
    // For "my_courses" tab, show only enrolled courses
    if (activeTab === "my_courses" && !course.is_enrolled) {
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
            {t("title")}
          </h1>
          <p className="text-gray-600 mt-2">{t("description")}</p>
        </div>

        {/* Tabs */}
        <CourseTabs activeTab={activeTab} onTabChange={setActiveTab} />

        {/* Filters */}
        <CoursesFilters
          categories={categories}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
        />

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
      </div>
    </div>
  );
}
