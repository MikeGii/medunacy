"use client";

import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

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

interface ForumCommentCardProps {
  comment: Comment;
  onLike: (commentId: string) => void;
  onDelete: (commentId: string) => void;
}

export default function ForumCommentCard({ comment, onLike, onDelete }: ForumCommentCardProps) {
  const t = useTranslations("forum.post_detail.comments");
  const { user } = useAuth();
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

  const badge = getRoleBadge(comment.user.role);
  const canDelete = user?.role === 'admin' || user?.id === comment.user.id;

  return (
    <div className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full flex items-center justify-center text-white font-semibold text-sm">
            {comment.user.first_name.charAt(0)}
          </div>
          <div>
            <p className="font-medium text-gray-800 flex items-center space-x-2">
              <span>{comment.user.first_name} {comment.user.last_name}</span>
              {badge && (
                <span className={`inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${badge.color}`}>
                  {badge.text}
                </span>
              )}
            </p>
            <p className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), { 
                addSuffix: true, 
                locale: dateLocale 
              })}
            </p>
          </div>
        </div>

        {canDelete && (
          <button
            onClick={() => onDelete(comment.id)}
            className="text-red-500 hover:text-red-600 transition-colors"
            title={t("delete")}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        )}
      </div>

      {/* Content */}
      <p className="text-gray-700 mb-4 whitespace-pre-wrap">{comment.content}</p>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onLike(comment.id)}
          className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all ${
            comment.user_has_liked
              ? 'bg-red-50 text-red-600 hover:bg-red-100'
              : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
          }`}
        >
          <svg 
            className={`w-4 h-4 ${comment.user_has_liked ? 'fill-current' : ''}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
                  d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span>{comment.likes_count}</span>
        </button>
      </div>
    </div>
  );
}