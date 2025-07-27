import { useCallback, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabase";
import { ForumPost } from "@/types/forum.types";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

export function usePost(postId: string) {
  const { user } = useAuth();
  const [post, setPost] = useState<ForumPost | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch single post
  const fetchPost = useCallback(async () => {
    if (!user || !postId) return;

    setLoading(true);
    setError(null);

    try {
      const { data: postData, error: postError } = await supabase
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
        .eq("id", postId)
        .eq("is_deleted", false)
        .single();

      if (postError) throw postError;

      // Fetch likes
      const { data: likesData } = await supabase
        .from("forum_likes")
        .select("user_id")
        .eq("post_id", postId)
        .is("comment_id", null);

      const userHasLiked =
        likesData?.some((like) => like.user_id === user.id) || false;

      const transformedPost: ForumPost = {
        ...postData,
        user: postData.users,
        category: postData.forum_categories,
        likes_count: likesData?.length || 0,
        comments_count: 0, // Will be set by comments component
        user_has_liked: userHasLiked,
      };

      setPost(transformedPost);
    } catch (err) {
      console.error("Error fetching post:", err);
      setError(FORUM_CONSTANTS.ERROR_KEYS.FETCH_POSTS);
      setPost(null);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  // Toggle like
  const toggleLike = useCallback(async () => {
    if (!user || !post) return;

    try {
      if (post.user_has_liked) {
        // Unlike
        await supabase
          .from("forum_likes")
          .delete()
          .eq("post_id", post.id)
          .eq("user_id", user.id)
          .is("comment_id", null);

        setPost({
          ...post,
          likes_count: Math.max(0, post.likes_count - 1),
          user_has_liked: false,
        });
      } else {
        // Like
        await supabase.from("forum_likes").insert({
          post_id: post.id,
          user_id: user.id,
        });

        setPost({
          ...post,
          likes_count: post.likes_count + 1,
          user_has_liked: true,
        });
      }
    } catch (err) {
      console.error("Error toggling like:", err);
      // Revert on error
      await fetchPost();
    }
  }, [user, post, fetchPost]);

  // Update post
  const updatePost = useCallback(
    async (updates: {
      title?: string;
      content?: string;
      category_id?: string;
    }) => {
      // Only check for user, not post - we have postId from the hook
      if (!user) return { success: false, error: "User not authenticated" };
      if (!postId) return { success: false, error: "No post ID provided" };

      setLoading(true);
      setError(null);

      try {
        const { data, error: updateError } = await supabase
          .from("forum_posts")
          .update({
            ...updates,
            updated_at: new Date().toISOString(),
          })
          .eq("id", postId) // Use postId instead of post.id
          .eq("user_id", user.id) // Ensure user owns the post or is admin
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

        if (updateError) throw updateError;

        const updatedPost: ForumPost = {
          ...data,
          user: data.users,
          category: data.forum_categories,
          likes_count: post?.likes_count || 0, // Use optional chaining
          comments_count: post?.comments_count || 0,
          user_has_liked: post?.user_has_liked || false,
        };

        setPost(updatedPost);
        return { success: true, data: updatedPost };
      } catch (err) {
        console.error("Error updating post:", err);
        setError(FORUM_CONSTANTS.ERROR_KEYS.UPDATE_POST);
        return { success: false, error: err };
      } finally {
        setLoading(false);
      }
    },
    [
      user,
      postId,
      post?.likes_count,
      post?.comments_count,
      post?.user_has_liked,
    ]
  );

  // Delete post
  const deletePost = useCallback(async () => {
    if (!user || !post) return { success: false, error: "Not authenticated" };

    setLoading(true);
    setError(null);

    try {
      const { data, error: deleteError } = await supabase.rpc(
        "soft_delete_post",
        {
          post_id: post.id,
        }
      );

      if (deleteError) throw deleteError;

      if (data && !data.success) {
        throw new Error(data.error || "Failed to delete post");
      }

      return { success: true };
    } catch (err) {
      console.error("Error deleting post:", err);
      setError(FORUM_CONSTANTS.ERROR_KEYS.DELETE_POST);
      return { success: false, error: err };
    } finally {
      setLoading(false);
    }
  }, [user, post]);

  // Check permissions
  const canEdit = user?.id === post?.user_id;
  const canDelete = user?.id === post?.user_id || user?.role === "admin";

  return {
    post,
    loading,
    error,
    canEdit,
    canDelete,
    fetchPost,
    toggleLike,
    updatePost,
    deletePost,
    clearError: () => setError(null),
  };
}
