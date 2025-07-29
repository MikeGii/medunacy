// src/components/courses-panel/CoursesManagement.tsx
"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useCourses } from "@/hooks/useCourses";
import { useCourseManagement } from "@/hooks/useCourseManagement";
import { Course } from "@/types/course.types";
import CourseForm from "./CourseForm";
import CoursesTable from "./CoursesTable";
import LoadingSpinner from "@/components/common/LoadingSpinner";

export default function CoursesManagement() {
  const t = useTranslations("courses_panel");
  const { courses, categories, loading, refetch } = useCourses();
  const { createCourse, updateCourse, deleteCourse } = useCourseManagement();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleCreate = async (data: any) => {
    const result = await createCourse(data);
    if (result.success) {
      setIsFormOpen(false);
      setEditingCourse(null);
      refetch();
    }
    return result;
  };

  const handleUpdate = async (data: any) => {
    if (!editingCourse) return { success: false };

    const result = await updateCourse(editingCourse.id, data);
    if (result.success) {
      setEditingCourse(null);
      setIsFormOpen(false);
      refetch();
    }
    return result;
  };

  const handleDelete = async (id: string) => {
    if (!confirm(t("messages.delete_confirm"))) return;

    const result = await deleteCourse(id);
    if (result.success) {
      refetch();
    }
  };

  const handleEdit = (course: Course) => {
    setEditingCourse(course);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingCourse(null);
  };

  return (
    <div className="space-y-6">
      {/* Add Course Button - Only show when form is closed */}
      {!isFormOpen && (
        <div className="flex justify-end">
          <button
            onClick={() => setIsFormOpen(true)}
            className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-[#5DB996] to-[#118B50] text-white font-medium rounded-lg hover:from-[#5DB996] hover:to-[#0F7541] transition-all duration-200 shadow-md"
          >
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            {t("form.create_course")}
          </button>
        </div>
      )}

      {/* Inline Form */}
      {isFormOpen && (
        <CourseForm
          course={editingCourse}
          categories={categories}
          onSubmit={editingCourse ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
          isInline={true}
        />
      )}

      {/* Courses Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <LoadingSpinner />
        </div>
      ) : (
        <CoursesTable
          courses={courses}
          categories={categories}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}
