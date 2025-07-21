"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import Header from "../layout/Header";
import { AuthModalProvider } from "@/contexts/AuthModalContext";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";
import ForumCommentsList from "./ForumCommentsList";

interface PostDetailPageProps {
  postId: string;
}

interface PostDetail {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user: {
    id: string;
    first_name: string;
    last_name: string;
    role: string;
  };
  category: {
    id: string;
    name: string;
  };
  likes_count: number;
  user_has_liked: boolean;
}

export default function PostDetailPage({ postId }: PostDetailPageProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const t = useTranslations("forum.post_detail");
  const [post, setPost] = useState<PostDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState<boolean | null>(null);

  const currentLocale = pathname.includes("/ukr") ? "ukr" : "et";
  const dateLocale = currentLocale === "ukr" ? uk : et;

  useEffect(() => {
    if (!authLoading && user) {
      setIsAuthorized(true);
    } else if (!authLoading && !user) {
      setIsAuthorized(false);
      router.push(`/${currentLocale}`);
    }
  }, [user, authLoading, router, currentLocale]);

  useEffect(() => {
    if (isAuthorized && user) {
      fetchPost();
    }
  }, [isAuthorized, user, postId]);

  const fetchPost = useCallback(async () => {
    try {
      // Fetch post details
      const { data: postData, error: postError } = await supabase
        .from("forum_posts")
        .select(
          `
          id,
          title,
          content,
          created_at,
          user_id,
          users (
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

      if (postError || !postData) {
        console.error("Post not found:", postError);
        setPost(null);
        setLoading(false);
        return;
      }

      // Fetch likes
      const { data: likesData } = await supabase
        .from("forum_likes")
        .select("user_id")
        .eq("post_id", postId)
        .is("comment_id", null);

      const likesCount = likesData?.length || 0;
      const userHasLiked =
        likesData?.some((like) => like.user_id === user?.id) || false;

      // Handle potential array response from joins
      const userData = Array.isArray(postData.users)
        ? postData.users[0]
        : postData.users;
      const categoryData = Array.isArray(postData.forum_categories)
        ? postData.forum_categories[0]
        : postData.forum_categories;

      setPost({
        id: postData.id,
        title: postData.title,
        content: postData.content,
        created_at: postData.created_at,
        user: {
          id: userData?.user_id || "",
          first_name: userData?.first_name || "",
          last_name: userData?.last_name || "",
          role: userData?.role || "user",
        },
        category: {
          id: categoryData?.id || "",
          name: categoryData?.name || "",
        },
        likes_count: likesCount,
        user_has_liked: userHasLiked,
      });
    } catch (error) {
      console.error("Error fetching post:", error);
    } finally {
      setLoading(false);
    }
  }, [postId, user]);

  const handleLike = async () => {
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
      } else {
        // Like
        await supabase.from("forum_likes").insert({
          post_id: post.id,
          user_id: user.id,
        });
      }

      // Refresh post data
      await fetchPost();
    } catch (error) {
      console.error("Error toggling like:", error);
    }
  };

  const handleDelete = async () => {
    if (!user || !post || user.role !== "admin") return;

    if (confirm("Are you sure you want to delete this post?")) {
      try {
        const { data, error } = await supabase.rpc("soft_delete_post", {
          post_id: post.id,
        });

        if (error) {
          console.error("Delete error:", error);
          alert(`Failed to delete post: ${error.message}`);
          return;
        }

        if (data && !data.success) {
          alert(`Failed to delete post: ${data.error}`);
          return;
        }

        router.push(`/${currentLocale}/forum`);
      } catch (error) {
        console.error("Error deleting post:", error);
        alert("An unexpected error occurred while deleting the post");
      }
    }
  };

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { text: "Admin", color: "from-red-500 to-red-600" },
      doctor: { text: "Arst", color: "from-[#118B50] to-[#5DB996]" },
      user: null,
    };
    return badges[role as keyof typeof badges];
  };

  if (authLoading || isAuthorized === null) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-16 h-16 border-4 border-[#118B50] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-[#118B50] font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null;
  }

  return (
    <AuthModalProvider>
      <div className="min-h-screen bg-gradient-to-br from-[#FBF6E9] via-white to-[#F8F9FA]">
        <Header />

        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Back Button */}
          <button
            onClick={() => router.push(`/${currentLocale}/forum`)}
            className="flex items-center space-x-2 text-[#118B50] hover:text-[#0F7A43] mb-6 transition-colors"
          >
            <svg
              className="w-5 h-5"
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

          {loading ? (
            <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
              <div className="flex items-center justify-center">
                <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full"></div>
                <span className="ml-3 text-[#118B50]">{t("loading")}</span>
              </div>
            </div>
          ) : !post ? (
            <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
              <p className="text-center text-gray-600">{t("not_found")}</p>
            </div>
          ) : (
            <>
              {/* Post Content */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 md:p-8 mb-6">
                {/* Header */}
                <div className="mb-6">
                  <div className="flex items-start justify-between mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-[#118B50]">
                      {post.title}
                    </h1>
                    {user?.role === "admin" && (
                      <button
                        onClick={handleDelete}
                        className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white text-sm rounded-lg transition-colors"
                      >
                        {t("delete")}
                      </button>
                    )}
                  </div>

                  <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E3F0AF] text-[#118B50] text-sm font-medium">
                    {post.category.name}
                  </div>
                </div>

                {/* Author Info */}
                <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-200">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full flex items-center justify-center text-white font-semibold">
                      {post.user.first_name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 flex items-center space-x-2">
                        <span>
                          {post.user.first_name} {post.user.last_name}
                        </span>
                        {getRoleBadge(post.user.role) && (
                          <span
                            className={`inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${
                              getRoleBadge(post.user.role)!.color
                            }`}
                          >
                            {getRoleBadge(post.user.role)!.text}
                          </span>
                        )}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(post.created_at), {
                          addSuffix: true,
                          locale: dateLocale,
                        })}
                      </p>
                    </div>
                  </div>

                  {/* Like Button */}
                  <button
                    onClick={handleLike}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all ${
                      post.user_has_liked
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                    }`}
                  >
                    <svg
                      className={`w-5 h-5 ${
                        post.user_has_liked ? "fill-current" : ""
                      }`}
                      fill="none"
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
                    <span>{post.likes_count}</span>
                  </button>
                </div>

                {/* Post Content */}
                <div className="prose prose-lg max-w-none">
                  {/* For now, just display as text. We'll add markdown rendering later */}
                  <p className="text-gray-700 whitespace-pre-wrap">
                    {post.content}
                  </p>
                </div>
              </div>

              {/* Comments Section */}
              <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-white/50 shadow-lg p-6 md:p-8">
                <ForumCommentsList postId={postId} />
              </div>
            </>
          )}
        </main>
      </div>
    </AuthModalProvider>
  );
}
