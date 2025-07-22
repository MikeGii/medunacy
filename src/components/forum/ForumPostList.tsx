// src/components/forum/ForumPostList.tsx
"use client";

import { useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useForum } from "@/hooks/useForum";
import { useForumContext } from "@/contexts/ForumContext";
import ForumPostCard from "./ForumPostCard";
import ForumPagination from "./ForumPagination";

interface ForumPostListProps {
  selectedCategory: string | null;
  searchQuery?: string;
  refreshTrigger?: number;
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
  const { fetchPosts, goToPage, currentPage, totalPages, totalPosts } =
    useForum();

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
    fetchPosts(1, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedCategory, state.searchQuery, refreshTrigger]);

  const handlePostClick = useCallback(
    (postId: string) => {
      router.push(`/${currentLocale}/forum/${postId}`);
    },
    [router, currentLocale]
  );

  const handlePageChange = useCallback(
    (page: number) => {
      goToPage(page);
      // Scroll to top of posts list
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [goToPage]
  );

  // Loading state
  if (state.isLoading && state.posts.length === 0) {
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
        </div>
      </div>
    );
  }

  // Empty state
  if (!state.isLoading && state.posts.length === 0) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
        <div className="text-center py-12">
          <svg
            className="w-20 h-20 mx-auto text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
            />
          </svg>
          <p className="text-lg text-gray-600 mb-2">
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

  return (
    <div>
      {/* Posts count */}
      {totalPosts > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          {t("showing_posts", {
            from: (currentPage - 1) * 10 + 1,
            to: Math.min(currentPage * 10, totalPosts),
            total: totalPosts,
          })}
        </div>
      )}

      {/* Posts list */}
      <div className="space-y-4">
        {state.posts.map((post) => (
          <ForumPostCard
            key={post.id}
            post={post}
            onClick={() => handlePostClick(post.id)}
          />
        ))}
      </div>

      {/* Pagination */}
      <ForumPagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
        isLoading={state.isLoading}
      />
    </div>
  );
});

export default ForumPostList;
