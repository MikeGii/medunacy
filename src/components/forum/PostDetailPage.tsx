// src/components/forum/PostDetailPage.tsx
"use client";

import { useEffect, useCallback, memo, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePost } from "@/hooks/usePost";
import { useForumContext } from "@/contexts/ForumContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import ForumCommentsList from "./ForumCommentsList";
import EditPostModal from "./EditPostModal";
import { useAuthorization } from "@/hooks/useAuthorization";

interface PostDetailPageProps {
  postId: string;
}

const PostDetailPage = memo(function PostDetailPage({
  postId,
}: PostDetailPageProps) {
  const {
    isAuthorized,
    isLoading: authLoading,
    user,
  } = useAuthorization({
    requireAuth: true,
    allowedRoles: ["user", "doctor", "admin"],
    redirectOnUnauthorized: true,
  });

  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("forum.post_detail");
  const { dispatch } = useForumContext();

  const {
    post,
    loading,
    error,
    canEdit,
    canDelete,
    fetchPost,
    toggleLike,
    deletePost,
  } = usePost(postId);

  const [showEditModal, setShowEditModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const currentLocale = pathname.includes("/ukr") ? "ukr" : "et";
  const dateLocale = currentLocale === "ukr" ? uk : et;

  // Fetch post when authorized
  useEffect(() => {
    if (isAuthorized && user) {
      fetchPost();
    }
  }, [isAuthorized, user, fetchPost]);

  // Handle delete with confirmation
  const handleDelete = useCallback(async () => {
    if (!canDelete || isDeleting) return;

    const confirmMessage = t("confirm_delete");
    if (!window.confirm(confirmMessage)) return;

    setIsDeleting(true);
    const result = await deletePost();

    if (result.success) {
      // Update the posts list in context
      dispatch({ type: "DELETE_POST", payload: postId });
      router.push(`/${currentLocale}/forum`);
    } else {
      // Show error (in production, use toast instead)
      console.error("Failed to delete post");
      setIsDeleting(false);
    }
  }, [
    canDelete,
    isDeleting,
    deletePost,
    postId,
    currentLocale,
    router,
    dispatch,
    t,
  ]);

  // Handle post update
  const handlePostUpdate = useCallback(() => {
    fetchPost();
    setShowEditModal(false);
  }, [fetchPost]);

  // Handle back navigation
  const handleBack = useCallback(() => {
    router.push(`/${currentLocale}/forum`);
  }, [router, currentLocale]);

  // Get role badge
  const getRoleBadge = useCallback((role: string) => {
    const badges = {
      admin: { text: "Admin", color: "from-red-500 to-red-600" },
      doctor: { text: "Arst", color: "from-[#118B50] to-[#5DB996]" },
      user: null,
    };
    return badges[role as keyof typeof badges];
  }, []);

  // Loading state
  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">{t("loading")}</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!isAuthorized) {
    return null;
  }

  const badge = post ? getRoleBadge(post.user.role) : null;

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center space-x-2 text-[#118B50] hover:text-[#0F7A43] mb-6 transition-colors group"
          >
            <svg
              className="w-5 h-5 transition-transform group-hover:-translate-x-1"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span>{t("back")}</span>
          </button>

          {/* Error State */}
          {error && !post && (
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
                <p className="text-gray-600 mb-4">{t("error_loading")}</p>
                <button
                  onClick={fetchPost}
                  className="px-4 py-2 bg-[#118B50] text-white rounded-lg hover:bg-[#0F7A43] transition-colors"
                >
                  {t("retry")}
                </button>
              </div>
            </div>
          )}

          {/* Post Not Found */}
          {!loading && !post && !error && (
            <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
              <p className="text-center text-gray-600">{t("not_found")}</p>
            </div>
          )}

          {/* Post Content */}
          {post && (
            <>
              <article className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 md:p-8 mb-6">
                {/* Header */}
                <header className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#118B50] flex-1 mr-4">
                      {post.title}
                    </h1>
                    <div className="flex items-center space-x-2 shrink-0">
                      {canEdit && (
                        <button
                          onClick={() => setShowEditModal(true)}
                          className="px-3 py-1 bg-[#118B50] hover:bg-[#0F7A43] text-white text-sm rounded-lg transition-colors font-medium"
                        >
                          {t("edit")}
                        </button>
                      )}
                      {canDelete && (
                        <button
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {isDeleting ? t("deleting") : t("delete")}
                        </button>
                      )}
                    </div>
                  </div>

                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E3F0AF] text-[#118B50] text-sm font-medium">
                    {post.category.name}
                  </div>
                </header>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full flex items-center justify-center text-white font-semibold">
                      {post.user.first_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 flex items-center space-x-2">
                        <span>
                          {post.user.first_name} {post.user.last_name}
                        </span>
                        {badge && (
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${badge.color}`}
                          >
                            {badge.text}
                          </span>
                        )}
                      </p>
                      <time className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </time>
                    </div>
                  </div>

                  <button
                    onClick={toggleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm transition-all transform active:scale-95 ${
                      post.user_has_liked
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                    aria-label={post.user_has_liked ? t("unlike") : t("like")}
                    aria-pressed={post.user_has_liked}
                  >
                    <svg
                      className={`w-5 h-5 transition-transform ${
                        post.user_has_liked
                          ? "fill-current scale-110"
                          : "hover:scale-110"
                      }`}
                      fill={post.user_has_liked ? "currentColor" : "none"}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="font-medium">{post.likes_count}</span>
                  </button>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg max-w-none">
                  <p className="text-gray-700 whitespace-pre-wrap break-words">
                    {post.content}
                  </p>
                </div>
              </article>

              {/* Comments Section */}
              <section className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 md:p-8">
                <ForumCommentsList postId={postId} />
              </section>

              {/* Edit Post Modal */}
              <EditPostModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                post={post}
                onUpdate={handlePostUpdate}
              />
            </>
          )}
        </main>
      </div>
    </AuthModalProvider>
  );
});

export default PostDetailPage;
