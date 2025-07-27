// src/components/common/LazyComponents.tsx - CORRECTED VERSION
import { lazy, Suspense, ComponentType } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Helper function for consistent lazy loading
export function lazyLoad<T extends ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>
) {
  return lazy(importFunc);
}

// Admin/Doctor Components - Only load for authorized users
export const LazyTestCreationPage = lazyLoad(
  () => import("@/components/exam-tests/TestCreationPage")
);

export const LazyQuestionManagementPage = lazyLoad(
  () => import("@/components/exam-tests/creation/QuestionManagementPage")
);

export const LazyExamSessionResultsPage = lazyLoad(
  () => import("@/components/exam-session-results/ExamSessionResultsPage")
);

export const LazyCoursesPanel = lazyLoad(
  () => import("@/components/courses-panel/CoursesPanel")
);

export const LazyRolesPage = lazyLoad(
  () => import("@/components/roles/RolesPage")
);

// Heavy Modal Components
export const LazyCourseDetailsModal = lazyLoad(
  () => import("@/components/courses/CourseDetailsModal")
);

export const LazyCreatePostModal = lazyLoad(
  () => import("@/components/forum/CreatePostModal")
);

export const LazyEditPostModal = lazyLoad(
  () => import("@/components/forum/EditPostModal")
);

// Exam Components - REMOVED non-existent ones
export const LazyExamQuestion = lazyLoad(
  () => import("@/components/exam-tests/ExamQuestion")
);


// Additional modals that exist
export const LazyCreateCategoryModal = lazyLoad(
  () => import("@/components/forum/CreateCategoryModal")
);

// Wrapper component for lazy loading with custom fallback
interface LazyLoadWrapperProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  className?: string;
}

export function LazyLoadWrapper({
  children,
  fallback,
  className,
}: LazyLoadWrapperProps) {
  return (
    <Suspense
      fallback={
        fallback || (
          <div
            className={
              className || "flex items-center justify-center min-h-[200px]"
            }
          >
            <LoadingSpinner />
          </div>
        )
      }
    >
      {children}
    </Suspense>
  );
}

// Page-level lazy loading wrapper with better UX
export function LazyPageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
          <div className="text-center">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}

// Modal loading wrapper with backdrop
export function LazyModalWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense
      fallback={
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8">
            <LoadingSpinner />
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      {children}
    </Suspense>
  );
}
