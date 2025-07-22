"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ForumCommentCard from "./ForumCommentCard";
import CreateCommentForm from "./CreateCommentForm";

interface ForumCommentsListProps {
  postId: string;
}

export default function ForumCommentsList({ postId }: ForumCommentsListProps) {
  const t = useTranslations("forum.post_detail.comments");
  const { user } = useAuth();

  interface Comment {
    id: string;
    content: string;
    created_at: string;
    user: {
      id: string;
      first_name: string;
      last_name: string;
      role: string;
    };
    likes_count: number;
    user_has_liked: boolean;
  }

  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchComments = useCallback(async () => {
    if (!user) return;

    try {
      // Fetch comments
      const { data: commentsData, error } = await supabase
        .from("forum_comments")
        .select(
          `
          id,
          content,
          created_at,
          user_id,
          users (
            user_id,
            first_name,
            last_name,
            role
          )
        `
        )
        .eq("post_id", postId)
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Fetch likes for comments
      const commentIds = commentsData?.map((c) => c.id) || [];
      const { data: likesData } = await supabase
        .from("forum_likes")
        .select("comment_id, user_id")
        .in("comment_id", commentIds)
        .not("comment_id", "is", null);

      // Transform data
      const transformedComments =
        commentsData?.map((comment) => {
          const commentLikes =
            likesData?.filter((l) => l.comment_id === comment.id) || [];
          const userHasLiked = commentLikes.some((l) => l.user_id === user.id);

          // Handle potential array response
          const userData = Array.isArray(comment.users)
            ? comment.users[0]
            : comment.users;

          return {
            id: comment.id,
            content: comment.content,
            created_at: comment.created_at,
            user: {
              id: userData?.user_id || "",
              first_name: userData?.first_name || "",
              last_name: userData?.last_name || "",
              role: userData?.role || "user",
            },
            likes_count: commentLikes.length,
            user_has_liked: userHasLiked,
          };
        }) || [];

      setComments(transformedComments);
    } catch (error) {
      console.error("Error fetching comments:", error);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleLike = async (commentId: string) => {
    if (!user) return;

    const comment = comments.find((c) => c.id === commentId);
    if (!comment) return;

    try {
      if (comment.user_has_liked) {
        // Unlike
        await supabase
          .from("forum_likes")
          .delete()
          .eq("comment_id", commentId)
          .eq("user_id", user.id);
      } else {
        // Like
        await supabase.from("forum_likes").insert({
          comment_id: commentId,
          user_id: user.id,
        });
      }

      // Refresh comments
      await fetchComments();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!user) return;

    if (confirm("Are you sure you want to delete this comment?")) {
      try {
        const { data, error } = await supabase.rpc("soft_delete_comment", {
          comment_id: commentId,
        });

        if (error) {
          alert(`Failed to delete comment: ${error.message}`);
          return;
        }

        if (data && !data.success) {
          alert(`Failed to delete comment: ${data.error}`);
          return;
        }

        await fetchComments();
      } catch (error) {
        console.error("Error deleting comment:", error);
        alert("An unexpected error occurred while deleting the comment");
      }
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold text-[#118B50] mb-6">{t("title")}</h2>

      {/* Comment Form */}
      <CreateCommentForm postId={postId} onCommentCreated={fetchComments} />

      {/* Comments List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-6 h-6 border-3 border-[#118B50] border-t-transparent rounded-full mx-auto"></div>
          </div>
        ) : comments.length === 0 ? (
          <p className="text-center text-gray-500 py-8">{t("empty")}</p>
        ) : (
          comments.map((comment) => (
            <ForumCommentCard
              key={comment.id}
              comment={comment}
              onLike={handleLike}
              onDelete={handleDelete}
              onUpdate={fetchComments}
            />
          ))
        )}
      </div>
    </div>
  );
}
