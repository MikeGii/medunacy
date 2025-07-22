// src/hooks/useExamTests.ts

"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { useExam } from "@/contexts/ExamContext";
import { Test, TestCategory } from "@/types/exam";

interface UseExamTestsOptions {
  categoryId?: string;
  includeUnpublished?: boolean;
  searchQuery?: string;
}

export function useExamTests(options: UseExamTestsOptions = {}) {
  const { tests, fetchTests, loading, error } = useExam();
  const [localSearchQuery, setLocalSearchQuery] = useState(
    options.searchQuery || ""
  );

  // Fetch tests when options change
  useEffect(() => {
    fetchTests(options.categoryId);
  }, [options.categoryId, fetchTests]);

  // Filter tests based on search query and publish status
  const filteredTests = useMemo(() => {
    let filtered = tests;

    // Filter by publish status unless includeUnpublished is true
    if (!options.includeUnpublished) {
      filtered = filtered.filter((test) => test.is_published);
    }

    // Filter by search query
    if (localSearchQuery) {
      const query = localSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [tests, options.includeUnpublished, localSearchQuery]);

  // Group tests by category
  const testsByCategory = useMemo(() => {
    const grouped = new Map<string, Test[]>();

    filteredTests.forEach((test) => {
      const categoryId = test.category_id;
      if (!grouped.has(categoryId)) {
        grouped.set(categoryId, []);
      }
      grouped.get(categoryId)!.push(test);
    });

    return grouped;
  }, [filteredTests]);

  // Get stats
  const stats = useMemo(() => {
    const totalTests = filteredTests.length;
    const publishedTests = filteredTests.filter((t) => t.is_published).length;
    const totalQuestions = filteredTests.reduce(
      (sum, test) => sum + (test.question_count || 0),
      0
    );

    return {
      totalTests,
      publishedTests,
      unpublishedTests: totalTests - publishedTests,
      totalQuestions,
      averageQuestionsPerTest:
        totalTests > 0 ? Math.round(totalQuestions / totalTests) : 0,
    };
  }, [filteredTests]);

  return {
    tests: filteredTests,
    testsByCategory,
    stats,
    loading,
    error,
    searchQuery: localSearchQuery,
    setSearchQuery: setLocalSearchQuery,
    refetch: () => fetchTests(options.categoryId),
  };
}