"use client";

import { useTranslations } from "next-intl";
import { Course } from "@/types/course.types";
import CourseCard from "./CourseCard";

interface CoursesListProps {
  courses: Course[];
  activeTab: "upcoming" | "past" | "my_courses";
  onEnroll: (courseId: string) => Promise<{ success: boolean; error?: string }>;
  onUnenroll: (courseId: string) => Promise<{ success: boolean; error?: string }>;
}

export default function CoursesList({
  courses,
  activeTab,
  onEnroll,
  onUnenroll,
}: CoursesListProps) {
  const t = useTranslations("courses.messages");

  if (courses.length === 0) {
    const emptyMessage = {
      upcoming: t("no_upcoming"),
      past: t("no_past"),
      my_courses: t("no_enrolled"),
    }[activeTab];

    return (
      <div className="text-center py-12">
        <p className="text-gray-500 text-lg">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {courses.map((course) => (
        <CourseCard
          key={course.id}
          course={course}
          onEnroll={onEnroll}
          onUnenroll={onUnenroll}
        />
      ))}
    </div>
  );
}