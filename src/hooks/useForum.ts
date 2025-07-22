import { useCallback, useEffect } from "react";
import { useForumContext } from "@/contexts/ForumContext";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ForumPost, ForumCategory } from "@/types/forum.types";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

export function useForum() {
  const { state, dispatch } = useForumContext();
  const { user } = useAuth();

  // Fetch categories
  const fetchCategories = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("name");

      if (error) throw error;

      // Get post counts
      const { data: postsData } = await supabase
        .from("forum_posts")
        .select("category_id")
        .eq("is_deleted", false);

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

      dispatch({ type: "SET_CATEGORIES", payload: categoriesWithCount });
    } catch (error) {
      console.error("Error fetching categories:", error);
      dispatch({
        type: "SET_ERROR",
        payload: FORUM_CONSTANTS.ERROR_KEYS.FETCH_POSTS,
      });
    }
  }, [dispatch]);

  // Fetch posts
  const fetchPosts = useCallback(async () => {
    if (!user) return;

    const cacheKey = `${state.selectedCategory}-${state.searchQuery}`;
    const cached = state.postsCache.get(cacheKey);

    // Use cache if valid
    if (
      cached &&
      Date.now() - cached.timestamp < FORUM_CONSTANTS.CACHE_DURATION
    ) {
      dispatch({ type: "SET_POSTS", payload: cached.data });
      return;
    }

    dispatch({ type: "SET_LOADING", payload: true });
    dispatch({ type: "SET_ERROR", payload: null });

    try {
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
        `
        )
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (state.selectedCategory) {
        query = query.eq("category_id", state.selectedCategory);
      }

      if (state.searchQuery) {
        query = query.or(
          `title.ilike.%${state.searchQuery}%,content.ilike.%${state.searchQuery}%`
        );
      }

      const { data: postsData, error } = await query;
      if (error) throw error;

      // Fetch likes and comments count in parallel
      const postIds = postsData?.map((post) => post.id) || [];

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
      const transformedPosts: ForumPost[] = (postsData || []).map((post) => ({
        ...post,
        user: post.users,
        category: post.forum_categories,
        likes_count: likesMap.get(post.id)?.length || 0,
        comments_count: commentsCount.get(post.id) || 0,
        user_has_liked: likesMap.get(post.id)?.includes(user.id) || false,
      }));

      dispatch({ type: "SET_POSTS", payload: transformedPosts });
      dispatch({
        type: "CACHE_POSTS",
        payload: { key: cacheKey, data: transformedPosts },
      });
    } catch (error) {
      console.error("Error fetching posts:", error);
      dispatch({
        type: "SET_ERROR",
        payload: FORUM_CONSTANTS.ERROR_KEYS.FETCH_POSTS,
      });
    } finally {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, [
    user,
    state.selectedCategory,
    state.searchQuery,
    state.postsCache,
    dispatch,
  ]);

  // Create post
  const createPost = useCallback(
    async (title: string, content: string, categoryId: string) => {
      if (!user) throw new Error("User not authenticated");

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

        if (error) throw error;

        const newPost: ForumPost = {
          ...data,
          user: data.users,
          category: data.forum_categories,
          likes_count: 0,
          comments_count: 0,
          user_has_liked: false,
        };

        dispatch({ type: "ADD_POST", payload: newPost });

        // Clear cache to force refresh
        dispatch({ type: "CACHE_POSTS", payload: { key: "clear", data: [] } });

        return { success: true, data: newPost };
      } catch (error) {
        console.error("Error creating post:", error);
        dispatch({
          type: "SET_ERROR",
          payload: FORUM_CONSTANTS.ERROR_KEYS.CREATE_POST,
        });
        return { success: false, error };
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    [user, dispatch]
  );

  // Update post
  const updatePost = useCallback(
    async (
      postId: string,
      updates: { title?: string; content?: string; category_id?: string }
    ) => {
      if (!user) throw new Error("User not authenticated");

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

        if (error) throw error;

        // Get current post likes/comments count
        const currentPost = state.posts.find((p) => p.id === postId);

        const updatedPost: ForumPost = {
          ...data,
          user: data.users,
          category: data.forum_categories,
          likes_count: currentPost?.likes_count || 0,
          comments_count: currentPost?.comments_count || 0,
          user_has_liked: currentPost?.user_has_liked || false,
        };

        dispatch({ type: "UPDATE_POST", payload: updatedPost });
        return { success: true, data: updatedPost };
      } catch (error) {
        console.error("Error updating post:", error);
        dispatch({
          type: "SET_ERROR",
          payload: FORUM_CONSTANTS.ERROR_KEYS.UPDATE_POST,
        });
        return { success: false, error };
      }
    },
    [user, state.posts, dispatch]
  );

  // Delete post
  const deletePost = useCallback(
    async (postId: string) => {
      if (!user) throw new Error("User not authenticated");

      try {
        const { data, error } = await supabase.rpc("soft_delete_post", {
          post_id: postId,
        });

        if (error) throw error;

        if (data && !data.success) {
          throw new Error(data.error || "Failed to delete post");
        }

        dispatch({ type: "DELETE_POST", payload: postId });
        return { success: true };
      } catch (error) {
        console.error("Error deleting post:", error);
        dispatch({
          type: "SET_ERROR",
          payload: FORUM_CONSTANTS.ERROR_KEYS.DELETE_POST,
        });
        return { success: false, error };
      }
    },
    [user, dispatch]
  );

  // Search posts
  const searchPosts = useCallback(
    (query: string) => {
      dispatch({ type: "SET_SEARCH_QUERY", payload: query });
    },
    [dispatch]
  );

  // Load initial data
  useEffect(() => {
    if (user) {
      fetchCategories();
      fetchPosts();
    }
  }, [user, fetchCategories, fetchPosts]);

  // Return all functions and state - ONLY ONE RETURN!
  return {
    // State
    posts: state.posts,
    categories: state.categories,
    selectedCategory: state.selectedCategory,
    searchQuery: state.searchQuery,
    isLoading: state.isLoading,
    error: state.error,

    // Actions
    fetchPosts,
    fetchCategories,
    createPost,
    updatePost,
    deletePost,
    searchPosts,
    setSelectedCategory: (id: string | null) =>
      dispatch({ type: "SET_SELECTED_CATEGORY", payload: id }),
    clearError: () => dispatch({ type: "SET_ERROR", payload: null }),
  };
}
