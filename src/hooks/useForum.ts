// src/hooks/useForum.ts - WITH MEMORY LEAK FIXES
import { useCallback, useEffect, useRef } from "react";
import { useForumContext } from "@/contexts/ForumContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ForumPost, ForumCategory } from "@/types/forum.types";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";
import { useCleanup } from "@/hooks/useCleanup";

export function useForum() {
  const { state, dispatch } = useForumContext();
  const { user } = useAuth();
  const { addCleanup, isMounted } = useCleanup();

  // Abort controller for request cancellation
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup function
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  // Fetch categories with mount check
  const fetchCategories = useCallback(async () => {
    if (!isMounted()) return;

    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("name");

      if (!isMounted()) return;

      if (error) throw error;

      // Get post counts
      const { data: postsData } = await supabase
        .from("forum_posts")
        .select("category_id")
        .eq("is_deleted", false);

      if (!isMounted()) return;

      const postCounts =
        postsData?.reduce(
          (acc: Record<string, number>, post: { category_id: string }) => {
            acc[post.category_id] = (acc[post.category_id] || 0) + 1;
            return acc;
          },
          {} as Record<string, number>
        ) || {};

      const categoriesWithCount: ForumCategory[] = (data || []).map((cat) => ({
        ...cat,
        post_count: postCounts[cat.id] || 0,
      }));

      if (isMounted()) {
        dispatch({ type: "SET_CATEGORIES", payload: categoriesWithCount });
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
      if (isMounted()) {
        dispatch({
          type: "SET_ERROR",
          payload: FORUM_CONSTANTS.ERROR_KEYS.FETCH_POSTS,
        });
      }
    }
  }, [dispatch, isMounted]);

  // Fetch posts with pagination and mount checks
  const fetchPosts = useCallback(
    async (page: number, append: boolean = false) => {
      if (!user || !isMounted()) return;

      // Cancel any existing request
      cleanup();

      // Don't use cache for pagination
      const cacheKey = `${state.selectedCategory}-${state.searchQuery}-${page}`;
      const cached = state.postsCache.get(cacheKey);

      // Use cache only for page 1 and if not appending
      if (
        !append &&
        page === 1 &&
        cached &&
        Date.now() - cached.timestamp < FORUM_CONSTANTS.CACHE_DURATION
      ) {
        if (isMounted()) {
          dispatch({ type: "SET_POSTS", payload: cached.data });
        }
        return;
      }

      // Create new abort controller
      abortControllerRef.current = new AbortController();

      if (!append && isMounted()) {
        dispatch({ type: "SET_LOADING", payload: true });
      }
      if (isMounted()) {
        dispatch({ type: "SET_ERROR", payload: null });
      }

      try {
        // Calculate offset
        const from = (page - 1) * FORUM_CONSTANTS.POSTS_PER_PAGE;
        const to = from + FORUM_CONSTANTS.POSTS_PER_PAGE - 1;

        // Build query
        let query = supabase
          .from("forum_posts")
          .select(
            `
          *,
          users!user_id (
            user_id,
            first_name,
            last_name,
            role
          ),
          forum_categories (
            id,
            name
          )
        `,
            { count: "exact" } // Get total count for pagination
          )
          .eq("is_deleted", false)
          .order("created_at", { ascending: false })
          .range(from, to);

        if (state.selectedCategory) {
          query = query.eq("category_id", state.selectedCategory);
        }

        if (state.searchQuery) {
          query = query.or(
            `title.ilike.%${state.searchQuery}%,content.ilike.%${state.searchQuery}%`
          );
        }

        const { data: postsData, error, count } = await query;

        // Check if request was cancelled or component unmounted
        if (abortControllerRef.current?.signal.aborted || !isMounted()) {
          return;
        }

        if (error) throw error;

        // Calculate pagination info
        const totalPosts = count || 0;
        const totalPages = Math.ceil(
          totalPosts / FORUM_CONSTANTS.POSTS_PER_PAGE
        );
        const hasMore = page < totalPages;

        // Fetch likes and comments count in parallel
        const postIds = postsData?.map((post) => post.id) || [];

        if (postIds.length > 0) {
          const [likesResponse, commentsResponse] = await Promise.all([
            supabase
              .from("forum_likes")
              .select("post_id, user_id")
              .in("post_id", postIds)
              .is("comment_id", null),
            supabase
              .from("forum_comments")
              .select("post_id")
              .in("post_id", postIds)
              .eq("is_deleted", false),
          ]);

          // Check if request was cancelled or component unmounted
          if (abortControllerRef.current?.signal.aborted || !isMounted()) {
            return;
          }

          // Process the data
          const likesMap = new Map<string, string[]>();
          likesResponse.data?.forEach((like) => {
            if (!likesMap.has(like.post_id)) {
              likesMap.set(like.post_id, []);
            }
            likesMap.get(like.post_id)!.push(like.user_id);
          });

          const commentsCount = new Map<string, number>();
          commentsResponse.data?.forEach((comment) => {
            commentsCount.set(
              comment.post_id,
              (commentsCount.get(comment.post_id) || 0) + 1
            );
          });

          // Transform posts
          const transformedPosts: ForumPost[] = (postsData || []).map(
            (post) => ({
              ...post,
              user: post.users,
              category: post.forum_categories,
              likes_count: likesMap.get(post.id)?.length || 0,
              comments_count: commentsCount.get(post.id) || 0,
              user_has_liked: likesMap.get(post.id)?.includes(user.id) || false,
            })
          );

          // Update state only if still mounted
          if (isMounted()) {
            if (append && state.posts.length > 0) {
              // For infinite scroll - use APPEND_POSTS action
              dispatch({ type: "APPEND_POSTS", payload: transformedPosts });
            } else {
              // For page navigation - replace all posts
              dispatch({ type: "SET_POSTS", payload: transformedPosts });
            }

            // Update pagination info
            dispatch({
              type: "SET_PAGINATION",
              payload: {
                currentPage: page,
                totalPages,
                totalPosts,
                hasMore,
              },
            });

            // Cache the results for page 1
            if (page === 1) {
              dispatch({
                type: "CACHE_POSTS",
                payload: { key: cacheKey, data: transformedPosts },
              });
            }
          }
        } else {
          // No posts found - only update if mounted
          if (isMounted()) {
            dispatch({ type: "SET_POSTS", payload: [] });
            dispatch({
              type: "SET_PAGINATION",
              payload: {
                currentPage: page,
                totalPages: 0,
                totalPosts: 0,
                hasMore: false,
              },
            });
          }
        }
      } catch (error: any) {
        // Ignore abort errors
        if (error.name === "AbortError") {
          return;
        }

        console.error("Error fetching posts:", error);
        if (isMounted()) {
          dispatch({
            type: "SET_ERROR",
            payload: FORUM_CONSTANTS.ERROR_KEYS.FETCH_POSTS,
          });
        }
      } finally {
        if (!append && isMounted()) {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    },
    [
      user,
      state.selectedCategory,
      state.searchQuery,
      state.postsCache,
      state.posts.length,
      dispatch,
      cleanup,
      isMounted,
    ]
  );

  // Load more posts (for infinite scroll)
  const loadMorePosts = useCallback(async () => {
    if (state.hasMore && !state.isLoading && isMounted()) {
      await fetchPosts(state.currentPage + 1, true);
    }
  }, [
    state.hasMore,
    state.isLoading,
    state.currentPage,
    fetchPosts,
    isMounted,
  ]);

  // Go to specific page
  const goToPage = useCallback(
    async (page: number) => {
      if (
        page >= 1 &&
        page <= state.totalPages &&
        page !== state.currentPage &&
        isMounted()
      ) {
        await fetchPosts(page, false);
      }
    },
    [state.totalPages, state.currentPage, fetchPosts, isMounted]
  );

  // Reset and fetch first page
  const resetAndFetch = useCallback(async () => {
    if (!isMounted()) return;

    dispatch({ type: "RESET_PAGINATION" });
    await fetchPosts(1, false);
  }, [fetchPosts, dispatch, isMounted]);

  // Create post with pagination reset and mount checks
  const createPost = useCallback(
    async (title: string, content: string, categoryId: string) => {
      if (!user) throw new Error("User not authenticated");
      if (!isMounted()) return { success: false, error: "Component unmounted" };

      dispatch({ type: "SET_LOADING", payload: true });
      dispatch({ type: "SET_ERROR", payload: null });

      try {
        const { data, error } = await supabase
          .from("forum_posts")
          .insert({
            user_id: user.id,
            title: title.trim(),
            content: content.trim(),
            category_id: categoryId,
          })
          .select(
            `
          *,
          users!user_id (
            user_id,
            first_name,
            last_name,
            role
          ),
          forum_categories (
            id,
            name
          )
        `
          )
          .single();

        if (!isMounted()) {
          return { success: false, error: "Component unmounted" };
        }

        if (error) throw error;

        const newPost: ForumPost = {
          ...data,
          user: data.users,
          category: data.forum_categories,
          likes_count: 0,
          comments_count: 0,
          user_has_liked: false,
        };

        if (isMounted()) {
          // Add post and reset to first page
          dispatch({ type: "ADD_POST", payload: newPost });
          dispatch({ type: "CLEAR_CACHE" });

          // Refresh to show new post at the top
          await resetAndFetch();
        }

        return { success: true, data: newPost };
      } catch (error) {
        console.error("Error creating post:", error);
        if (isMounted()) {
          dispatch({
            type: "SET_ERROR",
            payload: FORUM_CONSTANTS.ERROR_KEYS.CREATE_POST,
          });
        }
        return { success: false, error };
      } finally {
        if (isMounted()) {
          dispatch({ type: "SET_LOADING", payload: false });
        }
      }
    },
    [user, dispatch, resetAndFetch, isMounted]
  );

  // Update post with mount checks
  const updatePost = useCallback(
    async (
      postId: string,
      updates: { title?: string; content?: string; category_id?: string }
    ) => {
      if (!user) throw new Error("User not authenticated");
      if (!isMounted()) return { success: false, error: "Component unmounted" };

      try {
        const { data, error } = await supabase
          .from("forum_posts")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", postId)
          .select(
            `
          *,
          users!user_id (
            user_id,
            first_name,
            last_name,
            role
          ),
          forum_categories (
            id,
            name
          )
        `
          )
          .single();

        if (!isMounted()) {
          return { success: false, error: "Component unmounted" };
        }

        if (error) throw error;

        const currentPost = state.posts.find((p) => p.id === postId);
        const updatedPost: ForumPost = {
          ...data,
          user: data.users,
          category: data.forum_categories,
          likes_count: currentPost?.likes_count || 0,
          comments_count: currentPost?.comments_count || 0,
          user_has_liked: currentPost?.user_has_liked || false,
        };

        if (isMounted()) {
          dispatch({ type: "UPDATE_POST", payload: updatedPost });
          dispatch({ type: "CLEAR_CACHE" });
        }

        return { success: true, data: updatedPost };
      } catch (error) {
        console.error("Error updating post:", error);
        if (isMounted()) {
          dispatch({
            type: "SET_ERROR",
            payload: FORUM_CONSTANTS.ERROR_KEYS.UPDATE_POST,
          });
        }
        return { success: false, error };
      }
    },
    [user, state.posts, dispatch, isMounted]
  );

  // Delete post with mount checks
  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) throw new Error("User not authenticated");
      if (!isMounted()) return { success: false, error: "Component unmounted" };

      try {
        const { data, error } = await supabase.rpc("soft_delete_post", {
          post_id: postId,
        });

        if (!isMounted()) {
          return { success: false, error: "Component unmounted" };
        }

        if (error) throw error;

        if (data && !data.success) {
          throw new Error(data.error || "Failed to delete post");
        }

        if (isMounted()) {
          dispatch({ type: "DELETE_POST", payload: postId });
          dispatch({ type: "CLEAR_CACHE" });

          // If we deleted the last post on this page, go to previous page
          if (state.posts.length === 1 && state.currentPage > 1) {
            await goToPage(state.currentPage - 1);
          }
        }

        return { success: true };
      } catch (error) {
        console.error("Error deleting post:", error);
        if (isMounted()) {
          dispatch({
            type: "SET_ERROR",
            payload: FORUM_CONSTANTS.ERROR_KEYS.DELETE_POST,
          });
        }
        return { success: false, error };
      }
    },
    [user, dispatch, state.posts.length, state.currentPage, goToPage, isMounted]
  );

  // Search posts with mount check
  const searchPosts = useCallback(
    (query: string) => {
      if (!isMounted()) return;

      dispatch({ type: "SET_SEARCH_QUERY", payload: query });
      dispatch({ type: "SET_POSTS", payload: [] });
      dispatch({ type: "RESET_PAGINATION" });
    },
    [dispatch, isMounted]
  );

  // Clean up on unmount
  useEffect(() => {
    // Add cleanup to the cleanup hook
    addCleanup(cleanup);

    return () => {
      cleanup();
    };
  }, [cleanup, addCleanup]);

  // Load initial data
  useEffect(() => {
    if (user && isMounted()) {
      fetchCategories();
      fetchPosts(1, false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, fetchCategories, isMounted]); // Remove fetchPosts from deps to prevent loops

  return {
    // State
    posts: state.posts,
    categories: state.categories,
    selectedCategory: state.selectedCategory,
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    error: state.error,

    // Pagination state
    currentPage: state.currentPage,
    totalPages: state.totalPages,
    totalPosts: state.totalPosts,
    hasMore: state.hasMore,

    // Actions
    fetchPosts,
    fetchCategories,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    loadMorePosts,
    goToPage,
    resetAndFetch,
    setSelectedCategory: (id: string | null) => {
      if (isMounted()) {
        dispatch({ type: "SET_SELECTED_CATEGORY", payload: id });
      }
    },
    clearError: () => {
      if (isMounted()) {
        dispatch({ type: "SET_ERROR", payload: null });
      }
    },
    cleanup,
  };
}
