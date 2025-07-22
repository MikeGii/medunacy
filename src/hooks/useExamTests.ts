// src/hooks/useExamTests.ts - ENHANCED VERSION

"use client";

import { useState, useEffect, useMemo, useCallback, useRef } from "react";
import { useExam } from "@/contexts/ExamContext";
import { Test, TestCategory } from "@/types/exam";
import { debounce } from "@/utils/debounce";

interface UseExamTestsOptions {
  categoryId?: string;
  includeUnpublished?: boolean;
  searchQuery?: string;
  pageSize?: number;
}

interface UseExamTestsReturn {
  // Paginated tests
  tests: Test[];
  testsByCategory: Map<string, Test[]>;

  // Pagination
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;

  // Stats
  stats: {
    totalTests: number;
    publishedTests: number;
    unpublishedTests: number;
    totalQuestions: number;
    averageQuestionsPerTest: number;
  };

  // State
  loading: boolean;
  error: string | null;
  searchQuery: string;

  // Actions
  setSearchQuery: (query: string) => void;
  goToPage: (page: number) => void;
  nextPage: () => void;
  previousPage: () => void;
  refetch: () => void;

  // Filters
  selectedCategory: TestCategory | null;
  setSelectedCategory: (category: TestCategory | null) => void;
}

export function useExamTests(
  options: UseExamTestsOptions = {}
): UseExamTestsReturn {
  const { tests: allTests, categories, fetchTests, loading, error } = useExam();

  // Local state
  const [localSearchQuery, setLocalSearchQuery] = useState(
    options.searchQuery || ""
  );
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedCategory, setSelectedCategory] = useState<TestCategory | null>(
    null
  );

  const pageSize = options.pageSize || 10;
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounced search
  const debouncedSearch = useMemo(
    () =>
      debounce((query: string) => {
        setDebouncedSearchQuery(query);
        setCurrentPage(1); // Reset to first page on search
      }, 300),
    []
  );

  // Update debounced search when local search changes
  useEffect(() => {
    debouncedSearch(localSearchQuery);
  }, [localSearchQuery, debouncedSearch]);

  // Fetch tests with abort support
  useEffect(() => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    fetchTests(options.categoryId || selectedCategory?.id);

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [options.categoryId, selectedCategory, fetchTests]);

  // Filter and sort tests
  const filteredTests = useMemo(() => {
    let filtered = allTests;

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter(
        (test) => test.category_id === selectedCategory.id
      );
    }

    // Filter by publish status
    if (!options.includeUnpublished) {
      filtered = filtered.filter((test) => test.is_published);
    }

    // Filter by search query
    if (debouncedSearchQuery) {
      const query = debouncedSearchQuery.toLowerCase();
      filtered = filtered.filter(
        (test) =>
          test.title.toLowerCase().includes(query) ||
          test.description?.toLowerCase().includes(query) ||
          test.category?.name.toLowerCase().includes(query)
      );
    }

    // Sort by creation date (newest first)
    filtered.sort(
      (a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

    return filtered;
  }, [
    allTests,
    selectedCategory,
    options.includeUnpublished,
    debouncedSearchQuery,
  ]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredTests.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginatedTests = filteredTests.slice(startIndex, endIndex);

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

  // Calculate stats
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

  // Navigation functions
  const goToPage = useCallback(
    (page: number) => {
      if (page >= 1 && page <= totalPages) {
        setCurrentPage(page);
      }
    },
    [totalPages]
  );

  const nextPage = useCallback(() => {
    goToPage(currentPage + 1);
  }, [currentPage, goToPage]);

  const previousPage = useCallback(() => {
    goToPage(currentPage - 1);
  }, [currentPage, goToPage]);

  // Refetch function
  const refetch = useCallback(() => {
    fetchTests(options.categoryId || selectedCategory?.id);
  }, [fetchTests, options.categoryId, selectedCategory]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, options.includeUnpublished]);

  return {
    tests: paginatedTests,
    testsByCategory,
    currentPage,
    totalPages,
    hasNextPage: currentPage < totalPages,
    hasPreviousPage: currentPage > 1,
    stats,
    loading,
    error,
    searchQuery: localSearchQuery,
    setSearchQuery: setLocalSearchQuery,
    goToPage,
    nextPage,
    previousPage,
    refetch,
    selectedCategory,
    setSelectedCategory,
  };
}
