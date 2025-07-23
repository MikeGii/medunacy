// src/hooks/useExamSessions.ts

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UserInfo {
  user_id: string;
  first_name: string;
  last_name: string;
}

interface ExamSessionWithDetails {
  id: string;
  user_id: string;
  test_id: string;
  mode: "training" | "exam";
  started_at: string;
  completed_at?: string;
  score_percentage?: number;
  correct_answers?: number;
  total_questions?: number;
  time_spent?: number;
  passed?: boolean;
  created_at: string;
  // Relations with simplified types
  user?: UserInfo;
  test?: {
    id: string;
    title: string;
    category?: {
      id: string;
      name: string;
    };
  };
}

interface UseExamSessionsOptions {
  mode?: "exam" | "training" | "all";
  limit?: number;
  offset?: number;
}

interface UseExamSessionsReturn {
  sessions: ExamSessionWithDetails[];
  loading: boolean;
  error: string | null;
  totalCount: number;
  currentPage: number;
  totalPages: number;
  pageSize: number;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  refresh: () => Promise<void>;
}

export function useExamSessions(
  options: UseExamSessionsOptions = {}
): UseExamSessionsReturn {
  const { user } = useAuth();
  const [sessions, setSessions] = useState<ExamSessionWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");

  const pageSize = options.limit || 10;
  const abortControllerRef = useRef<AbortController | null>(null);

  // Debounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setCurrentPage(1); // Reset to first page on search
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const fetchSessions = useCallback(async () => {
    // Only allow doctors and admins to fetch
    if (!user || (user.role !== "doctor" && user.role !== "admin")) {
      setError("Unauthorized access");
      setLoading(false);
      return;
    }

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      setError(null);

      const offset = (currentPage - 1) * pageSize;

      // First, fetch exam sessions
      let query = supabase
        .from("exam_sessions")
        .select("*", { count: "exact" });

      // Filter by mode
      if (options.mode && options.mode !== "all") {
        query = query.eq("mode", options.mode);
      } else if (!options.mode) {
        // Default to showing only exam mode
        query = query.eq("mode", "exam");
      }

      // Only show completed sessions
      query = query.not("completed_at", "is", null);

      // Apply pagination and ordering
      query = query
        .order("completed_at", { ascending: false })
        .range(offset, offset + pageSize - 1);

      const { data: sessionData, error: fetchError, count } = await query;

      if (fetchError) {
        console.error("Supabase query error:", fetchError);
        throw fetchError;
      }

      if (!sessionData || sessionData.length === 0) {
        setSessions([]);
        setTotalCount(0);
        return;
      }

      // Get unique user and test IDs
      const userIds = [...new Set(sessionData.map((s) => s.user_id))];
      const testIds = [...new Set(sessionData.map((s) => s.test_id))];

      // Fetch users
      const { data: users } = await supabase
        .from("users")
        .select("user_id, first_name, last_name")
        .in("user_id", userIds);

      // Fetch tests
      const { data: tests } = await supabase
        .from("tests")
        .select("id, title, category_id")
        .in("id", testIds);

      // Fetch categories if we have tests
      let categories: any[] = [];
      if (tests && tests.length > 0) {
        const categoryIds = [
          ...new Set(tests.map((t) => t.category_id).filter(Boolean)),
        ];
        if (categoryIds.length > 0) {
          const { data: categoriesData } = await supabase
            .from("test_categories")
            .select("id, name")
            .in("id", categoryIds);
          categories = categoriesData || [];
        }
      }

      // Create lookup maps
      const userMap = new Map(users?.map((u) => [u.user_id, u]) || []);
      const testMap = new Map(tests?.map((t) => [t.id, t]) || []);
      const categoryMap = new Map(categories.map((c) => [c.id, c]));

      // Transform the data
      const transformedData: ExamSessionWithDetails[] = sessionData.map(
        (session) => {
          const user = userMap.get(session.user_id);
          const test = testMap.get(session.test_id);
          const category = test?.category_id
            ? categoryMap.get(test.category_id)
            : undefined;

          return {
            ...session,
            user: user || undefined,
            test: test
              ? {
                  id: test.id,
                  title: test.title,
                  category: category || undefined,
                }
              : undefined,
          };
        }
      );

      // Client-side filtering for search
      let filteredData = transformedData;
      if (debouncedSearchQuery) {
        const searchTerm = debouncedSearchQuery.toLowerCase();
        filteredData = transformedData.filter((session) => {
          const userName = `${session.user?.first_name || ""} ${
            session.user?.last_name || ""
          }`.toLowerCase();
          const testTitle = session.test?.title?.toLowerCase() || "";
          const categoryName =
            session.test?.category?.name?.toLowerCase() || "";

          return (
            userName.includes(searchTerm) ||
            testTitle.includes(searchTerm) ||
            categoryName.includes(searchTerm)
          );
        });
      }

      setSessions(filteredData);
      setTotalCount(count || 0);
    } catch (err: any) {
      if (err.name !== "AbortError") {
        console.error("Error fetching exam sessions:", err);
        setError(err.message || "Failed to fetch exam sessions");
      }
    } finally {
      setLoading(false);
    }
  }, [user, currentPage, pageSize, options.mode, debouncedSearchQuery]);

  // Fetch sessions when dependencies change
  useEffect(() => {
    fetchSessions();

    // Cleanup on unmount
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchSessions]);

  // Calculate total pages
  const totalPages = useMemo(() => {
    return Math.ceil(totalCount / pageSize);
  }, [totalCount, pageSize]);

  return {
    sessions,
    loading,
    error,
    totalCount,
    currentPage,
    totalPages,
    pageSize,
    searchQuery,
    setSearchQuery,
    setCurrentPage,
    refresh: fetchSessions,
  };
}
