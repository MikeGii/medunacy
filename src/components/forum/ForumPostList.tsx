// src/components/forum/ForumPostList.tsx
"use client";

import { useEffect, useCallback, memo, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter, usePathname } from "next/navigation";
import { useForum } from "@/hooks/useForum";
import { useForumContext } from "@/contexts/ForumContext";
import { useInfiniteScroll } from "@/hooks/useInfiniteScroll";
import ForumPostCard from "./ForumPostCard";
import OptimizedPagination from "@/components/common/OptimizedPagination";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface ForumPostListProps {
  selectedCategory: string | null;
  searchQuery?: string;
  refreshTrigger?: number;
  useInfiniteScrollMode?: boolean;
}

const ForumPostList = memo(function ForumPostList({
  selectedCategory,
  searchQuery,
  refreshTrigger,
  useInfiniteScrollMode = false,
}: ForumPostListProps) {
  const t = useTranslations("forum.posts");
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

  const { state, dispatch } = useForumContext();
  const {
    fetchPosts,
    loadMorePosts,
    goToPage,
    currentPage,
    totalPages,
    totalPosts,
  } = useForum();

  const [isLoadingMore, setIsLoadingMore] = useState(false);

  // Infinite scroll hook
  const { setTarget } = useInfiniteScroll({
    hasMore: state.hasMore,
    loading: isLoadingMore,
    onLoadMore: async () => {
      setIsLoadingMore(true);
      await loadMorePosts();
      setIsLoadingMore(false);
    },
  });

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
      // Smooth scroll to top
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [goToPage]
  );

  // Loading state
  if (state.isLoading && state.posts.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner />
      </div>
    );
  }

  // Error state
  if (state.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
        <p className="text-red-600">{t(state.error)}</p>
        <button
          onClick={() => fetchPosts(1, false)}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          {t("try_again")}
        </button>
      </div>
    );
  }

  // No posts state
  if (state.posts.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm p-8 text-center">
        <div className="max-w-md mx-auto">
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
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {t("no_posts_title")}
          </h3>
          <p className="text-gray-600">
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

      {/* Pagination or Infinite Scroll */}
      {useInfiniteScrollMode ? (
        <>
          {/* Infinite scroll trigger */}
          {state.hasMore && (
            <div ref={setTarget} className="mt-8 flex justify-center py-4">
              {isLoadingMore && (
                <div className="flex items-center space-x-2">
                  <LoadingSpinner />
                  <span className="text-gray-600">{t("loading_more")}</span>
                </div>
              )}
            </div>
          )}
        </>
      ) : (
        /* Regular pagination */
        <OptimizedPagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          isLoading={state.isLoading}
          className="mt-8"
        />
      )}
    </div>
  );
});

export default ForumPostList;
