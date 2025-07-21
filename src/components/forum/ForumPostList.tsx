"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import ForumPostCard from "./ForumPostCard";
import { useRouter, usePathname } from "next/navigation";

interface ForumPostListProps {
  selectedCategory: string | null;
  searchQuery?: string;
}

export default function ForumPostList({
  selectedCategory,
  searchQuery,
}: ForumPostListProps) {
  const t = useTranslations("forum.posts");
  const { user } = useAuth();
  const [posts, setPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = pathname.startsWith("/ukr") ? "ukr" : "et";

  useEffect(() => {
    fetchPosts();
  }, [selectedCategory, searchQuery, user]);

  const fetchPosts = async () => {
    if (!user) return;

    try {
      let query = supabase
        .from("forum_posts")
        .select(
          `
        id,
        title,
        content,
        created_at,
        user_id,
        category_id,
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
        .eq("is_deleted", false)
        .order("created_at", { ascending: false });

      // Apply category filter
      if (selectedCategory) {
        query = query.eq("category_id", selectedCategory);
      }

      // Apply search filter
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,content.ilike.%${searchQuery}%`
        );
      }

      const { data: postsData, error } = await query;

      if (error) throw error;

      // Fetch comment counts
      const postIds = postsData?.map((post) => post.id) || [];
      const { data: commentsCount } = await supabase
        .from("forum_comments")
        .select("post_id")
        .in("post_id", postIds)
        .eq("is_deleted", false);

      // Fetch like counts and user's likes
      const { data: likesData } = await supabase
        .from("forum_likes")
        .select("post_id, user_id")
        .in("post_id", postIds)
        .is("comment_id", null);

      // Transform data - Fixed to handle single objects instead of arrays
      const transformedPosts =
        postsData?.map((post) => {
          const postComments =
            commentsCount?.filter((c) => c.post_id === post.id) || [];
          const postLikes =
            likesData?.filter((l) => l.post_id === post.id) || [];
          const userHasLiked = postLikes.some((l) => l.user_id === user.id);

          // Handle arrays returned by Supabase
          const userData = Array.isArray(post.users)
            ? post.users[0]
            : post.users;
          const categoryData = Array.isArray(post.forum_categories)
            ? post.forum_categories[0]
            : post.forum_categories;

          return {
            id: post.id,
            title: post.title,
            content: post.content,
            created_at: post.created_at,
            user: {
              first_name: userData?.first_name || "",
              last_name: userData?.last_name || "",
              role: userData?.role || "user",
            },
            category: {
              id: categoryData?.id || "",
              name: categoryData?.name || "",
            },
            _count: {
              comments: postComments.length,
              likes: postLikes.length,
            },
            user_has_liked: userHasLiked,
          };
        }) || [];

      setPosts(transformedPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostClick = (postId: string) => {
    router.push(`/${currentLocale}/forum/${postId}`);
  };

  if (loading) {
    return (
      <div className="bg-white/40 backdrop-blur-md rounded-2xl md:rounded-3xl border border-white/50 shadow-lg p-8">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-4 border-[#118B50] border-t-transparent rounded-full"></div>
          <span className="ml-3 text-[#118B50]">{t("loading")}</span>
        </div>
      </div>
    );
  }

  if (posts.length === 0) {
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
          <p className="text-gray-600 text-lg">{t("no_posts")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <ForumPostCard
          key={post.id}
          post={post}
          onClick={() => handlePostClick(post.id)}
        />
      ))}
    </div>
  );
}
