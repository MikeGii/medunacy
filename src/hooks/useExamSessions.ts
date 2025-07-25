// src/hooks/useExamSessions.ts

"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { useOptimizedQuery } from "./useOptimizedQuery";
import { dataFetcher } from "@/utils/dataFetcher";

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
      let query = supabase.from("exam_sessions").select(
        `
        *,
        user:users!exam_sessions_user_id_fkey(
          user_id,
          first_name,
          last_name
        ),
        test:tests!exam_sessions_test_id_fkey(
          id,
          title,
          category_id,
          category:test_categories(
            id,
            name
          )
        )
      `,
        { count: "exact" }
      );

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

      // Transform the data
      const transformedData: ExamSessionWithDetails[] = sessionData.map(
        (session) => ({
          ...session,
          user: session.user || undefined,
          test: session.test
            ? {
                id: session.test.id,
                title: session.test.title,
                category: session.test.category || undefined,
              }
            : undefined,
        })
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
