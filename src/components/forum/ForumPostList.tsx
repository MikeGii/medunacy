// src/components/forum/ForumPostList.tsx
"use client";

import { useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useForum } from "@/hooks/useForum";
import { useForumContext } from "@/contexts/ForumContext";
import ForumPostCard from "./ForumPostCard";

interface ForumPostListProps {
  selectedCategory: string | null;
  searchQuery?: string;
  refreshTrigger?: number; // For refreshing posts when new post is created
}

const ForumPostList = memo(function ForumPostList({
  selectedCategory,
  searchQuery,
  refreshTrigger,
}: ForumPostListProps) {
  const t = useTranslations("forum.posts");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

  const { state, dispatch } = useForumContext();
  const { fetchPosts } = useForum();

  // Update context when props change
  useEffect(() => {
    if (selectedCategory !== state.selectedCategory) {
      dispatch({ type: "SET_SELECTED_CATEGORY", payload: selectedCategory });
    }
  }, [selectedCategory, state.selectedCategory, dispatch]);

  useEffect(() => {
    if (searchQuery !== state.searchQuery) {
      dispatch({ type: "SET_SEARCH_QUERY", payload: searchQuery || "" });
    }
  }, [searchQuery, state.searchQuery, dispatch]);

  // Fetch posts when dependencies change or refresh is triggered
  useEffect(() => {
    fetchPosts();
  }, [fetchPosts, refreshTrigger]);

  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(`/${currentLocale}/forum/${postId}`);
    },
    [router, currentLocale]
  );

  // Loading state
  if (state.isLoading) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full"></div>
          <span className="ml-3 text-[#118B50]">{t("loading")}</span>
        </div>
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-red-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <p className="text-gray-600 text-lg mb-4">{t("error_loading")}</p>
          <button
            onClick={() => fetchPosts()}
            className="px-4 py-2 bg-[#118B50] text-white rounded-lg hover:bg-[#0F7A43] transition-colors"
          >
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (state.posts.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
        <div className="text-center">
          <svg
            className="w-16 h-16 mx-auto text-gray-400 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-gray-600 text-lg">
            {searchQuery
              ? t("no_posts_search", { query: searchQuery })
              : selectedCategory
              ? t("no_posts_category")
              : t("no_posts")}
          </p>
        </div>
      </div>
    );
  }

  // Posts list
  return (
    <div className="space-y-4">
      {state.posts.map((post) => (
        <ForumPostCard
          key={post.id}
          post={post}
          onClick={() => handlePostClick(post.id)}
        />
      ))}
    </div>
  );
});

export default ForumPostList;
