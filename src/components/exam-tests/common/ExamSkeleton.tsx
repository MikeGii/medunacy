// src/components/exam-tests/common/ExamSkeleton.tsx

"use client";

import React from "react";

interface SkeletonProps {
  className?: string;
}

const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => (
  <div className={`animate-pulse bg-gray-200 rounded ${className}`} />
);

export const CategoryCardSkeleton = () => (
  <div className="p-6 rounded-xl border-2 border-gray-200 bg-white">
    <Skeleton className="h-6 w-3/4 mb-2" />
    <Skeleton className="h-4 w-full mb-1" />
    <Skeleton className="h-4 w-5/6" />
  </div>
);

export const TestCardSkeleton = () => (
  <div className="p-6 rounded-2xl border-2 border-gray-200 bg-white">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-16" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-4/5 mb-4" />
    <div className="flex justify-between">
      <Skeleton className="h-4 w-24" />
      <Skeleton className="h-4 w-24" />
    </div>
  </div>
);

export const QuestionSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-200 p-6">
    <div className="flex justify-between items-start mb-4">
      <Skeleton className="h-6 w-16" />
      <Skeleton className="h-8 w-8 rounded" />
    </div>
    <Skeleton className="h-4 w-full mb-2" />
    <Skeleton className="h-4 w-5/6 mb-6" />

    <div className="space-y-3">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="p-4 rounded-xl border-2 border-gray-200">
          <div className="flex items-center space-x-3">
            <Skeleton className="h-8 w-8 rounded-full" />
            <Skeleton className="h-4 w-full" />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const ExamSessionSkeleton = () => (
  <div className="space-y-6">
    <div className="bg-white rounded-xl shadow-md p-6">
      <Skeleton className="h-8 w-48 mb-4" />
      <QuestionSkeleton />
    </div>

    <div className="flex justify-between">
      <Skeleton className="h-12 w-32 rounded-xl" />
      <Skeleton className="h-12 w-32 rounded-xl" />
    </div>
  </div>
);
