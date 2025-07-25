// src/components/common/LazyComponents.tsx
import { lazy, Suspense } from "react";
import LoadingSpinner from "./LoadingSpinner";

// Lazy load heavy components
export const LazyForumPostList = lazy(() => 
  import("@/components/forum/ForumPostList")
);

export const LazyExamQuestion = lazy(() => 
  import("@/components/exam-tests/ExamQuestion")
);

export const LazyCreatePostModal = lazy(() => 
  import("@/components/forum/CreatePostModal")
);

// Wrapper component for lazy loading
export function LazyLoad({ 
  children, 
  fallback = <LoadingSpinner /> 
}: { 
  children: React.ReactNode;
  fallback?: React.ReactNode;
}) {
  return <Suspense fallback={fallback}>{children}</Suspense>;
}