"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useCourses } from "@/hooks/useCourses";
import { useCourseManagement } from "@/hooks/useCourseManagement";
import { Course } from "@/types/course.types";
import CourseForm from "./CourseForm";
import CoursesTable from "./CoursesTable";

export default function CoursesManagement() {
  const t = useTranslations("courses_panel");
  const { courses, categories, loading, refetch } = useCourses();
  const { createCourse, updateCourse, deleteCourse } = useCourseManagement();
  
  const [showForm, setShowForm] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleCreate = async (data: any) => {
    const result = await createCourse(data);
    if (result.success) {
      setShowForm(false);
      refetch();
    }
    return result;
  };

  const handleUpdate = async (data: any) => {
    if (!editingCourse) return { success: false };
    
    const result = await updateCourse(editingCourse.id, data);
    if (result.success) {
      setEditingCourse(null);
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
    setShowForm(true);
  };

  const handleCloseForm = () => {
    setShowForm(false);
    setEditingCourse(null);
  };

  return (
    <div>
      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {t("tabs.courses")}
        </h2>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          {t("form.create_course")}
        </button>
      </div>

      {/* Form Modal */}
      {showForm && (
        <CourseForm
          course={editingCourse}
          categories={categories}
          onSubmit={editingCourse ? handleUpdate : handleCreate}
          onClose={handleCloseForm}
        />
      )}

      {/* Courses Table */}
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600"></div>
        </div>
      ) : (
        <CoursesTable
          courses={courses}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
}