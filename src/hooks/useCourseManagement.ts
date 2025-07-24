import { useState, useCallback } from 'react';
import {
  createCourse,
  updateCourse,
  deleteCourse,
  createCourseCategory,
  updateCourseCategory,
  deleteCourseCategory,
  getCourseEnrollments
} from '@/lib/courses';
import { 
  Course, 
  CourseCategory, 
  CourseFormData, 
  CategoryFormData 
} from '@/types/course.types';

export function useCourseManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Course management
  const handleCreateCourse = useCallback(async (data: CourseFormData) => {
    try {
      setLoading(true);
      setError(null);
      const course = await createCourse(data);
      return { success: true, data: course };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create course';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateCourse = useCallback(async (id: string, data: Partial<CourseFormData>) => {
    try {
      setLoading(true);
      setError(null);
      const course = await updateCourse(id, data);
      return { success: true, data: course };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update course';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteCourse = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCourse(id);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete course';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Category management
  const handleCreateCategory = useCallback(async (data: CategoryFormData) => {
    try {
      setLoading(true);
      setError(null);
      const category = await createCourseCategory(data);
      return { success: true, data: category };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create category';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleUpdateCategory = useCallback(async (id: string, data: Partial<CategoryFormData>) => {
    try {
      setLoading(true);
      setError(null);
      const category = await updateCourseCategory(id, data);
      return { success: true, data: category };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  const handleDeleteCategory = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      await deleteCourseCategory(id);
      return { success: true };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete category';
      setError(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get course enrollments
  const fetchCourseEnrollments = useCallback(async (courseId: string) => {
    try {
      setLoading(true);
      setError(null);
      const enrollments = await getCourseEnrollments(courseId);
      return { success: true, data: enrollments };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch enrollments';
      setError(message);
      return { success: false, error: message, data: [] };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    // Course operations
    createCourse: handleCreateCourse,
    updateCourse: handleUpdateCourse,
    deleteCourse: handleDeleteCourse,
    // Category operations
    createCategory: handleCreateCategory,
    updateCategory: handleUpdateCategory,
    deleteCategory: handleDeleteCategory,
    // Enrollments
    fetchCourseEnrollments,
    // Clear error
    clearError: () => setError(null)
  };
}