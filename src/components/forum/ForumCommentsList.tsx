// src/components/forum/ForumCommentsList.tsx
"use client";

import { useEffect, memo, useCallback } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useComments } from "@/hooks/useComments";
import ForumCommentCard from "./ForumCommentCard";
import CreateCommentForm from "./CreateCommentForm";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

interface ForumCommentsListProps {
  postId: string;
}

const ForumCommentsList = memo(function ForumCommentsList({
  postId,
}: ForumCommentsListProps) {
  const t = useTranslations("forum.post_detail.comments");
  const { user } = useAuth();
  const {
    comments,
    loading,
    error,
    fetchComments,
    createComment,
    updateComment,
    deleteComment,
    toggleCommentLike,
  } = useComments(postId);

  // Fetch comments on mount
  useEffect(() => {
    if (user) {
      fetchComments();
    }
  }, [fetchComments, user]);

  // Handle comment creation
  const handleCommentCreated = useCallback(
    async (content: string) => {
      const result = await createComment(content);
      if (result.success) {
        // Comments are automatically updated in the hook
        return true;
      }
      return false;
    },
    [createComment]
  );

  // Handle like toggle with optimistic update
  const handleLike = useCallback(
    async (commentId: string) => {
      if (!user) return;

      // Optimistic update is handled in the hook
      await toggleCommentLike(commentId);
    },
    [user, toggleCommentLike]
  );

  // Handle delete with confirmation
  const handleDelete = useCallback(
    async (commentId: string) => {
      if (!user) return;

      // Use a better confirmation dialog (could be replaced with a modal)
      const confirmMessage = t("confirm_delete");
      if (!window.confirm(confirmMessage)) return;

      const result = await deleteComment(commentId);
      if (!result.success) {
        // Error is already set in the hook, but we could show a toast here
        console.error("Failed to delete comment");
      }
    },
    [user, deleteComment, t]
  );

  // Handle update
  const handleUpdate = useCallback(
    async (commentId: string, newContent: string) => {
      const result = await updateComment(commentId, newContent);
      return result.success;
    },
    [updateComment]
  );

  // Loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="bg-white/40 rounded-xl p-4 animate-pulse">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-300 rounded w-1/4" />
              <div className="h-3 bg-gray-200 rounded w-full" />
              <div className="h-3 bg-gray-200 rounded w-3/4" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div>
      <h2 className="text-xl font-bold text-[#118B50] mb-6">
        {t("title")} ({comments.length})
      </h2>

      {/* Comment Form - Only show if user is logged in */}
      {user && (
        <CreateCommentForm
          postId={postId}
          onCommentCreated={handleCommentCreated}
        />
      )}

      {/* Error State */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
          <svg
            className="w-5 h-5 mr-2 flex-shrink-0"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <span>{t("error_loading")}</span>
          <button
            onClick={fetchComments}
            className="ml-2 text-red-800 underline hover:no-underline"
          >
            {t("retry")}
          </button>
        </div>
      )}

      {/* Comments List */}
      <div className="mt-8 space-y-4">
        {loading ? (
          renderSkeleton()
        ) : comments.length === 0 ? (
          <div className="text-center py-12">
            <svg
              className="w-16 h-16 mx-auto text-gray-300 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
            <p className="text-gray-500">{t("empty")}</p>
            {!user && (
              <p className="text-sm text-gray-400 mt-2">
                {t("login_to_comment")}
              </p>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {comments.map((comment) => (
              <ForumCommentCard
                key={comment.id}
                comment={comment}
                currentUserId={user?.id}
                onLike={() => handleLike(comment.id)}
                onDelete={() => handleDelete(comment.id)}
                onUpdate={(newContent) => handleUpdate(comment.id, newContent)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Load more button if needed in the future */}
      {comments.length >= FORUM_CONSTANTS.COMMENTS_PER_PAGE && (
        <div className="mt-6 text-center">
          <button
            className="px-6 py-2 text-[#118B50] hover:text-[#0F7A43] font-medium transition-colors"
            onClick={() => {
              // Implement pagination in the future
              console.log("Load more comments");
            }}
          >
            {t("load_more")}
          </button>
        </div>
      )}
    </div>
  );
});

export default ForumCommentsList;
