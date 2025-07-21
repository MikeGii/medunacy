"use client";

import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePathname } from "next/navigation";

interface ForumPost {
  id: string;
  title: string;
  content: string;
  created_at: string;
  user: {
    first_name: string;
    last_name: string;
    role: string;
  };
  category: {
    id: string;
    name: string;
  };
  _count: {
    comments: number;
    likes: number;
  };
  user_has_liked: boolean;
}

interface ForumPostCardProps {
  post: ForumPost;
  onClick: () => void;
}

export default function ForumPostCard({ post, onClick }: ForumPostCardProps) {
  const t = useTranslations("forum.posts");
  const pathname = usePathname();
  const locale = pathname.startsWith("/ukr") ? "uk" : "et";
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
    <div 
      onClick={onClick}
      className="bg-white/60 backdrop-blur-sm rounded-xl border border-white/50 hover:border-[#5DB996]/50 
                 shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer group"
    >
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-[#118B50] group-hover:text-[#0F7A43] transition-colors mb-2">
              {post.title}
            </h3>
            
            {/* Category */}
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-[#E3F0AF] text-[#118B50] text-sm font-medium">
              {post.category.name}
            </div>
          </div>
        </div>

        {/* Content Preview */}
        <p className="text-gray-600 mb-4 line-clamp-3">
          {post.content}
        </p>

        {/* Footer */}
        <div className="flex items-center justify-between">
          {/* Author Info */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full flex items-center justify-center text-white font-semibold">
              {post.user.first_name.charAt(0)}
            </div>
            <div>
              <p className="text-sm font-medium text-gray-800 flex items-center space-x-2">
                <span>{post.user.first_name} {post.user.last_name}</span>
                {badge && (
                  <span className={`inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${badge.color}`}>
                    {badge.text}
                  </span>
                )}
              </p>
              <p className="text-xs text-gray-500">
                {formatDistanceToNow(new Date(post.created_at), { 
                  addSuffix: true, 
                  locale: dateLocale 
                })}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
              <span>{post._count.comments}</span>
            </div>
            <div className="flex items-center space-x-1">
              <svg 
                className={`w-4 h-4 ${post.user_has_liked ? 'text-red-500 fill-current' : ''}`} 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                      d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
              <span>{post._count.likes}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}