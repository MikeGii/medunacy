// src/components/forum/ForumCommentCard.tsx
"use client";

import { useState, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { formatDistanceToNow } from "date-fns";
import { et, uk } from "date-fns/locale";
import { usePathname } from "next/navigation";
import { ForumComment } from "@/types/forum.types";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

interface ForumCommentCardProps {
  comment: ForumComment;
  currentUserId?: string;
  onLike: () => void;
  onDelete: () => void;
  onUpdate: (newContent: string) => Promise<boolean>;
}

const ForumCommentCard = memo(function ForumCommentCard({
  comment,
  currentUserId,
  onLike,
  onDelete,
  onUpdate,
}: ForumCommentCardProps) {
  const t = useTranslations("forum.post_detail.comments");
  const pathname = usePathname();
  const locale = pathname.includes("/ukr") ? "uk" : "et";
  const dateLocale = locale === "uk" ? uk : et;

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(comment.content);
  const [isSaving, setIsSaving] = useState(false);
  const [editError, setEditError] = useState<string>("");

  // Role badge configuration
  const getRoleBadge = useCallback((role: string) => {
    const badges = {
      admin: { text: "Admin", color: "from-red-500 to-red-600" },
      doctor: { text: "Arst", color: "from-[#118B50] to-[#5DB996]" },
      user: null,
    };
    return badges[role as keyof typeof badges];
  }, []);

  const badge = getRoleBadge(comment.user.role);
  const canEdit = currentUserId === comment.user.id;
  const canDelete =
    currentUserId === comment.user.id || comment.user.role === "admin";

  // Validate edit content
  const validateContent = useCallback(
    (text: string): string => {
      if (!text.trim()) {
        return t("validation.content_required");
      }
      if (text.length < FORUM_CONSTANTS.MIN_CONTENT_LENGTH) {
        return t("validation.content_too_short", {
          min: FORUM_CONSTANTS.MIN_CONTENT_LENGTH,
        });
      }
      if (text.length > FORUM_CONSTANTS.MAX_CONTENT_LENGTH) {
        return t("validation.content_too_long", {
          max: FORUM_CONSTANTS.MAX_CONTENT_LENGTH,
        });
      }
      return "";
    },
    [t]
  );

  // Handle save
  const handleSave = useCallback(async () => {
    const validation = validateContent(editContent);
    if (validation) {
      setEditError(validation);
      return;
    }

    if (editContent.trim() === comment.content) {
      setIsEditing(false);
      return;
    }

    setIsSaving(true);
    setEditError("");

    const success = await onUpdate(editContent.trim());

    if (success) {
      setIsEditing(false);
    } else {
      setEditError(t("edit_error"));
    }

    setIsSaving(false);
  }, [editContent, comment.content, validateContent, onUpdate, t]);

  // Handle cancel
  const handleCancel = useCallback(() => {
    setEditContent(comment.content);
    setEditError("");
    setIsEditing(false);
  }, [comment.content]);

  // Handle edit content change
  const handleEditContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setEditContent(e.target.value);
      if (editError) {
        setEditError("");
      }
    },
    [editError]
  );

  // Start editing
  const startEditing = useCallback(() => {
    setEditContent(comment.content);
    setIsEditing(true);
  }, [comment.content]);

  return (
    <article className="bg-white/40 backdrop-blur-sm rounded-xl border border-white/30 p-4 md:p-6 transition-all hover:border-white/50">
      {/* Header */}
      <header className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-gradient-to-r from-[#118B50] to-[#5DB996] rounded-full flex items-center justify-center text-white font-semibold text-sm shrink-0">
            {comment.user.first_name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-medium text-gray-800 flex items-center space-x-2">
              <span>
                {comment.user.first_name} {comment.user.last_name}
              </span>
              {badge && (
                <span
                  className={`inline-flex px-2 py-0.5 text-xs font-medium text-white rounded-full bg-gradient-to-r ${badge.color}`}
                >
                  {badge.text}
                </span>
              )}
            </p>
            <time className="text-xs text-gray-500">
              {formatDistanceToNow(new Date(comment.created_at), {
                addSuffix: true,
                locale: dateLocale,
              })}
              {comment.updated_at &&
                comment.updated_at !== comment.created_at && (
                  <span className="ml-1">({t("edited")})</span>
                )}
            </time>
          </div>
        </div>

        {!isEditing && currentUserId && (
          <div className="flex items-center space-x-2">
            {canEdit && (
              <button
                onClick={startEditing}
                className="text-[#118B50] hover:text-[#0F7A43] transition-colors p-1 rounded hover:bg-[#118B50]/10"
                title={t("edit")}
                aria-label={t("edit")}
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
                    d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                  />
                </svg>
              </button>
            )}
            {canDelete && (
              <button
                onClick={onDelete}
                className="text-red-500 hover:text-red-600 transition-colors p-1 rounded hover:bg-red-500/10"
                title={t("delete")}
                aria-label={t("delete")}
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
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            )}
          </div>
        )}
      </header>

      {/* Content */}
      {isEditing ? (
        <div className="mb-4">
          <textarea
            value={editContent}
            onChange={handleEditContentChange}
            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-vertical transition-colors ${
              editError ? "border-red-500" : "border-gray-300"
            }`}
            rows={3}
            disabled={isSaving}
            aria-label={t("edit_comment")}
            aria-invalid={!!editError}
            aria-describedby={editError ? "edit-error" : undefined}
          />
          {editError && (
            <p id="edit-error" className="mt-1 text-sm text-red-600">
              {editError}
            </p>
          )}
          <div className="mt-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">
              {editContent.length}/{FORUM_CONSTANTS.MAX_CONTENT_LENGTH}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={handleCancel}
                disabled={isSaving}
                className="px-4 py-1.5 text-gray-600 hover:text-gray-800 transition-colors font-medium"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving || !editContent.trim()}
                className="px-4 py-1.5 bg-[#118B50] text-white rounded-lg hover:bg-[#0F7A43] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium flex items-center space-x-2"
              >
                {isSaving && (
                  <svg
                    className="animate-spin h-3 w-3"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                )}
                <span>{isSaving ? t("saving") : t("save")}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-700 mb-4 whitespace-pre-wrap break-words">
          {comment.content}
        </p>
      )}

      {/* Footer - only show when not editing */}
      {!isEditing && (
        <footer className="flex items-center justify-between">
          <button
            onClick={onLike}
            className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm transition-all transform active:scale-95 ${
              comment.user_has_liked
                ? "bg-red-50 text-red-600 hover:bg-red-100"
                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
            }`}
            aria-label={comment.user_has_liked ? t("unlike") : t("like")}
            aria-pressed={comment.user_has_liked}
          >
            <svg
              className={`w-4 h-4 transition-transform ${
                comment.user_has_liked
                  ? "fill-current scale-110"
                  : "hover:scale-110"
              }`}
              fill={comment.user_has_liked ? "currentColor" : "none"}
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
            <span>{comment.likes_count}</span>
          </button>
        </footer>
      )}
    </article>
  );
});

export default ForumCommentCard;
