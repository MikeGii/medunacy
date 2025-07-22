"use client";

import { memo } from 'react';
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePathname } from "next/navigation";
import { ForumPost } from '@/types/forum.types';

interface ForumPostCardProps {
  post: ForumPost;
  onClick: () => void;
}

const ForumPostCard = memo(function ForumPostCard({ post, onClick }: ForumPostCardProps) {
  const t = useTranslations("forum.posts");
  const pathname = usePathname();
  const locale = pathname.includes("/ukr") ? "uk" : "et";
  const dateLocale = locale === "uk" ? uk : et;

  const getRoleBadge = (role: string) => {
    const badges = {
      admin: { text: "Admin", color: "from-red-500 to-red-600" },
      doctor: { text: "Arst", color: "from-[#118B50] to-[#5DB996]" },
      user: null
    };
    return badges[role as keyof typeof badges];
  };

  const badge = getRoleBadge(post.user.role);

  return (
    <article
      onClick={onClick}
      className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 shadow-md p-4 md:p-6 
                 hover:shadow-lg hover:border-[#118B50]/30 transition-all duration-300 cursor-pointer
                 transform hover:-translate-y-0.5"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <h3 className="text-lg md:text-xl font-semibold text-gray-800 hover:text-[#118B50] transition-colors line-clamp-2">
            {post.title}
          </h3>
          <div className="flex items-center space-x-3 mt-2 text-sm text-gray-600">
            <span className="flex items-center space-x-1">
              <span>{t("by")}</span>
              <span className="font-medium">
                {post.user.first_name} {post.user.last_name}
              </span>
              {badge && (
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${badge.color}`}>
                  {badge.text}
                </span>
              )}
            </span>
            <span>•</span>
            <time className="text-gray-500">
              {formatDistanceToNow(new Date(post.created_at), { 
                addSuffix: true, 
                locale: dateLocale 
              })}
            </time>
          </div>
        </div>
        <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E3F0AF] text-[#118B50] text-xs font-medium shrink-0 ml-3">
          {post.category.name}
        </div>
      </div>

      {/* Content Preview */}
      <p className="text-gray-700 line-clamp-3 mb-4">
        {post.content}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1 text-gray-600">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
            <span>{post.comments_count} {t("comments")}</span>
          </span>
          <span className="flex items-center space-x-1 text-gray-600">
            <svg 
              className={`w-5 h-5 transition-colors ${post.user_has_liked ? 'fill-red-500 text-red-500' : ''}`} 
              fill={post.user_has_liked ? 'currentColor' : 'none'} 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
            <span>{post.likes_count} {t("likes")}</span>
          </span>
        </div>
      </div>
    </article>
  );
});

export default ForumPostCard;