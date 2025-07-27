// src/hooks/useCourses.ts - FIXED VERSION WITH MEMORY LEAK PREVENTION
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

  // Track mount status
  const isMountedRef = useRef(true);
  const abortControllerRef = useRef<AbortController | null>(null);

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

  // Set mount status
  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
      // Cancel any pending requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const fetchCourses = useCallback(async () => {
    // Cancel previous request if any
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const [coursesData, categoriesData] = await Promise.all([
        getCourses({ ...filtersRef.current, user_id: userIdRef.current }),
        getCourseCategories(),
      ]);

      // Check if component is still mounted before updating state
      if (isMountedRef.current) {
        setCourses(coursesData || []); // Ensure we always set an array
        setCategories(categoriesData || []); // Ensure we always set an array
      }
    } catch (err: any) {
      // Ignore abort errors
      if (err.name !== "AbortError" && isMountedRef.current) {
        setError(
          err instanceof Error ? err.message : "Failed to fetch courses"
        );
        console.error("Error fetching courses:", err);
        // Set empty arrays on error to prevent undefined issues
        setCourses([]);
        setCategories([]);
      }
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, []); // Remove dependencies to make it stable

  useEffect(() => {
    fetchCourses();
  }, []); // Only run once on mount

  const handleEnroll = async (courseId: string) => {
    if (!isMountedRef.current)
      return { success: false, error: "Component unmounted" };

    try {
      await enrollInCourse(courseId);

      // Update local state only if still mounted
      if (isMountedRef.current) {
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
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to enroll";
      return { success: false, error: message };
    }
  };

  const handleUnenroll = async (courseId: string) => {
    if (!isMountedRef.current)
      return { success: false, error: "Component unmounted" };

    try {
      await unenrollFromCourse(courseId);

      // Update local state only if still mounted
      if (isMountedRef.current) {
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
      }
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to unenroll";
      return { success: false, error: message };
    }
  };

  // Create a manual refetch function that can be called when filters change
  const refetch = useCallback(async () => {
    if (isMountedRef.current) {
      await fetchCourses();
    }
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

  // Track mount status
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

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

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setEnrollments(data);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(
            err instanceof Error ? err.message : "Failed to fetch enrollments"
          );
          console.error("Error fetching enrollments:", err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
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

  // Track mount status
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    return () => {
      isMountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getCourse(courseId);

        // Only update state if component is still mounted
        if (isMountedRef.current) {
          setCourse(data);
          setEnrollments(data.enrollments || []);
        }
      } catch (err) {
        if (isMountedRef.current) {
          setError(
            err instanceof Error
              ? err.message
              : "Failed to fetch course details"
          );
          console.error("Error fetching course details:", err);
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
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
