// src/components/forum/EditPostModal.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { usePost } from "@/hooks/usePost";
import { useForumContext } from "@/contexts/ForumContext";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";
import { ForumPost } from "@/types/forum.types";
import { supabase } from "@/lib/supabase";
import { useSubmissionGuard } from "@/hooks/useSubmissionGuard";
import { useCleanup } from "@/hooks/useCleanup";
import { sanitizeInput, sanitizeForumContent } from "@/utils/sanitization";
import { useRateLimit, RATE_LIMITS } from "@/utils/rateLimiter";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface EditPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: ForumPost;
  onUpdate: () => void;
}

const EditPostModal = memo(function EditPostModal({
  isOpen,
  onClose,
  post,
  onUpdate,
}: EditPostModalProps) {
  const t = useTranslations("forum.edit_post");
  const { user } = useAuth();
  const { state, dispatch } = useForumContext();
  const { isMounted } = useCleanup();
  const { guardedSubmit, isSubmitting } = useSubmissionGuard();
  const updatePostRateLimit = useRateLimit(RATE_LIMITS.UPDATE_POST);

  const postHook = usePost(post.id);

  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [categoryId, setCategoryId] = useState(post.category_id);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
  }>({});

  // Reset form when modal opens with new post
  useEffect(() => {
    if (isOpen) {
      setTitle(post.title);
      setContent(post.content);
      setCategoryId(post.category_id);
      setError(null);
      setValidationErrors({});
    }
  }, [isOpen, post]);

  // Fetch categories if needed
  useEffect(() => {
    if (isOpen && state.categories.length === 0 && isMounted()) {
      const fetchCategoriesData = async () => {
        try {
          const { data, error } = await supabase
            .from("forum_categories")
            .select("*")
            .order("name");

          if (data && !error && isMounted()) {
            dispatch({ type: "SET_CATEGORIES", payload: data });
          }
        } catch (err) {
          console.error("Error fetching categories:", err);
        }
      };

      fetchCategoriesData();
    }
  }, [isOpen, state.categories.length, dispatch, isMounted]);

  // Validation
  const validateForm = useCallback(() => {
    const errors: typeof validationErrors = {};

    if (!title.trim()) {
      errors.title = t("validation.title_required");
    } else if (title.length < FORUM_CONSTANTS.MIN_TITLE_LENGTH) {
      errors.title = t("validation.title_too_short", {
        min: FORUM_CONSTANTS.MIN_TITLE_LENGTH,
      });
    } else if (title.length > FORUM_CONSTANTS.MAX_TITLE_LENGTH) {
      errors.title = t("validation.title_too_long", {
        max: FORUM_CONSTANTS.MAX_TITLE_LENGTH,
      });
    }

    if (!content.trim()) {
      errors.content = t("validation.content_required");
    } else if (content.length < FORUM_CONSTANTS.MIN_CONTENT_LENGTH) {
      errors.content = t("validation.content_too_short", {
        min: FORUM_CONSTANTS.MIN_CONTENT_LENGTH,
      });
    } else if (content.length > FORUM_CONSTANTS.MAX_CONTENT_LENGTH) {
      errors.content = t("validation.content_too_long", {
        max: FORUM_CONSTANTS.MAX_CONTENT_LENGTH,
      });
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, content, t]);

  // Check if user can edit
  const canEdit = useCallback(() => {
    if (!user) return false;
    return user.id === post.user_id || user.role === "admin";
  }, [user, post.user_id]);

  // Handle save
  const handleSave = useCallback(async () => {
    if (!canEdit() || !validateForm()) return;

    // Check rate limit
    if (!updatePostRateLimit.checkLimit()) {
      const remainingTime = updatePostRateLimit.getRemainingTime();
      setError(
        t("error.rate_limit", { minutes: Math.ceil(remainingTime / 60000) })
      );
      return;
    }

    setError(null);

    const performUpdate = async () => {
      try {
        // Sanitize inputs ✅
        const sanitizedTitle = sanitizeInput(title.trim());
        const sanitizedContent = sanitizeForumContent(content.trim());

        // Use the hook's updatePost method
        const result = await postHook.updatePost({
          title: sanitizedTitle,
          content: sanitizedContent,
          category_id: categoryId,
        });

        if (!isMounted()) return;

        if (result.success) {
          updatePostRateLimit.recordAction();
          onUpdate();
          onClose();
        } else {
          console.error("Update failed:", result.error);
          setError(t("error.update_failed"));
        }
      } catch (err) {
        console.error("Unexpected error in handleSave:", err);
        if (isMounted()) {
          setError(t("error.update_failed"));
        }
      }
    };

    // Use submission guard to prevent double submission ✅
    await guardedSubmit(performUpdate);
  }, [
    canEdit,
    validateForm,
    guardedSubmit,
    updatePostRateLimit,
    title,
    content,
    categoryId,
    postHook,
    onUpdate,
    onClose,
    t,
    isMounted,
  ]);

  // Handle input changes with sanitization
  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const sanitized = sanitizeInput(e.target.value); // ✅ Sanitize on input
      setTitle(sanitized);
      if (validationErrors.title) {
        setValidationErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [validationErrors.title]
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value); // Don't sanitize markdown while typing
      if (validationErrors.content) {
        setValidationErrors((prev) => ({ ...prev, content: undefined }));
      }
    },
    [validationErrors.content]
  );

  // Handle close with confirmation
  const handleClose = useCallback(() => {
    const hasChanges =
      title !== post.title ||
      content !== post.content ||
      categoryId !== post.category_id;

    if (hasChanges && !isSaving) {
      const confirmClose = window.confirm(t("confirm_close"));
      if (!confirmClose) return;
    }

    onClose();
  }, [title, content, categoryId, post, isSaving, onClose, t]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isSaving) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, isSaving, handleClose]);

  if (!isOpen || !canEdit()) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
        <div className="p-6 overflow-y-auto max-h-[90vh]">
          <h2 className="text-2xl font-bold text-[#118B50] mb-6">
            {t("title")}
          </h2>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
            noValidate
          >
            {/* Title */}
            <div className="mb-4">
              <label
                htmlFor="edit-title"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("form.title")} *
              </label>
              <input
                type="text"
                id="edit-title"
                value={title}
                onChange={handleTitleChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-colors ${
                  validationErrors.title ? "border-red-500" : "border-gray-300"
                }`}
                disabled={isSaving}
                aria-invalid={!!validationErrors.title}
                aria-describedby={
                  validationErrors.title ? "title-error" : undefined
                }
              />
              {validationErrors.title && (
                <p id="title-error" className="mt-1 text-sm text-red-600">
                  {validationErrors.title}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {title.length}/{FORUM_CONSTANTS.MAX_TITLE_LENGTH}
              </p>
            </div>

            {/* Category */}
            <div className="mb-4">
              <label
                htmlFor="edit-category"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("form.category")}
              </label>
              <select
                id="edit-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-colors"
                disabled={isSaving || state.categories.length === 0}
              >
                {state.categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Content */}
            <div className="mb-6">
              <label
                htmlFor="edit-content"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("form.content")} *
              </label>
              <textarea
                id="edit-content"
                value={content}
                onChange={handleContentChange}
                rows={10}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-vertical transition-colors ${
                  validationErrors.content
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                disabled={isSaving}
                aria-invalid={!!validationErrors.content}
                aria-describedby={
                  validationErrors.content ? "content-error" : undefined
                }
              />
              {validationErrors.content && (
                <p id="content-error" className="mt-1 text-sm text-red-600">
                  {validationErrors.content}
                </p>
              )}
              <div className="mt-1 flex justify-between text-xs text-gray-500">
                <span>{t("form.markdown_supported")}</span>
                <span>
                  {content.length}/{FORUM_CONSTANTS.MAX_CONTENT_LENGTH}
                </span>
              </div>
            </div>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center">
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
                {error}
              </div>
            )}

            {/* Buttons */}
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                disabled={isSaving}
                className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
              >
                {t("form.cancel")}
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="px-6 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                         hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                         disabled:opacity-50 disabled:cursor-not-allowed font-medium
                         flex items-center space-x-2"
              >
                {isSaving && (
                  <svg
                    className="animate-spin h-4 w-4"
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
                <span>{isSaving ? t("form.saving") : t("form.save")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default EditPostModal;
