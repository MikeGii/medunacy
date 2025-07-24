import { useState, useEffect, useCallback, useRef } from "react";
import {
  getCourses,
  getCourse,
  getCourseCategories,
  enrollInCourse,
  unenrollFromCourse,
  getUserEnrollments,
} from "@/lib/courses";
import { Course, CourseCategory, CourseEnrollment } from "@/types/course.types";
import { useAuth } from "@/contexts/AuthContext";

export function useCourses(filters?: {
  status?: "upcoming" | "past";
  category_id?: string;
}) {
  const { user } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<CourseCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use refs to prevent infinite loops
  const filtersRef = useRef(filters);
  const userIdRef = useRef(user?.id);

  // Update refs when values change
  useEffect(() => {
    filtersRef.current = filters;
  }, [filters]);

  useEffect(() => {
    userIdRef.current = user?.id;
  }, [user?.id]);

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const [coursesData, categoriesData] = await Promise.all([
        getCourses({ ...filtersRef.current, user_id: userIdRef.current }),
        getCourseCategories(),
      ]);

      setCourses(coursesData || []); // Ensure we always set an array
      setCategories(categoriesData || []); // Ensure we always set an array
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch courses");
      console.error("Error fetching courses:", err);
      // Set empty arrays on error to prevent undefined issues
      setCourses([]);
      setCategories([]);
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to make it stable

  useEffect(() => {
    fetchCourses();
  }, []); // Only run once on mount

  const handleEnroll = async (courseId: string) => {
    try {
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
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to enroll";
      return { success: false, error: message };
    }
  };

  const handleUnenroll = async (courseId: string) => {
    try {
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
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unenroll";
      return { success: false, error: message };
    }
  };

  // Create a manual refetch function that can be called when filters change
  const refetch = useCallback(async () => {
    await fetchCourses();
  }, [fetchCourses]);

  return {
    courses,
    categories,
    loading,
    error,
    refetch,
    handleEnroll,
    handleUnenroll,
  };
}

export function useUserEnrollments() {
  const { user } = useAuth();
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEnrollments = async () => {
      if (!user) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await getUserEnrollments(user.id);
        setEnrollments(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch enrollments"
        );
        console.error("Error fetching enrollments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchEnrollments();
  }, [user]);

  return {
    enrollments,
    loading,
    error,
  };
}

export function useCourseDetails(courseId: string) {
  const [course, setCourse] = useState<Course | null>(null);
  const [enrollments, setEnrollments] = useState<CourseEnrollment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCourse(courseId);
        setCourse(data);
        setEnrollments(data.enrollments || []);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch course details"
        );
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  return {
    course,
    enrollments,
    loading,
    error,
  };
}
