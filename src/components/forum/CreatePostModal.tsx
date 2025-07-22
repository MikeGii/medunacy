// src/components/forum/CreatePostModal.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { useAuth } from "@/contexts/AuthContext";
import { useForum } from "@/hooks/useForum";
import { useForumContext } from "@/contexts/ForumContext";
import CreateCategoryModal from "./CreateCategoryModal";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";
import { ForumCategory } from "@/types/forum.types";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated: () => void;
}

const CreatePostModal = memo(function CreatePostModal({
  isOpen,
  onClose,
  onPostCreated,
}: CreatePostModalProps) {
  const t = useTranslations("forum.create_post");
  const { user } = useAuth();
  const { state } = useForumContext();
  const { createPost, fetchCategories } = useForum();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<{
    title?: string;
    content?: string;
    category?: string;
  }>({});

  // Fetch categories when modal opens
  useEffect(() => {
    if (isOpen && state.categories.length === 0) {
      fetchCategories();
    }
  }, [isOpen, state.categories.length, fetchCategories]);

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      resetForm();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const resetForm = useCallback(() => {
    setTitle("");
    setContent("");
    setSelectedCategory("");
    setError(null);
    setValidationErrors({});
  }, []);

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

    if (!selectedCategory) {
      errors.category = t("validation.category_required");
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [title, content, selectedCategory, t]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user || !validateForm()) return;

      setLoading(true);
      setError(null);

      const result = await createPost(title, content, selectedCategory);

      if (result.success) {
        onPostCreated();
        resetForm();
        onClose();
      } else {
        setError(t("error.create_failed"));
      }

      setLoading(false);
    },
    [
      user,
      validateForm,
      createPost,
      title,
      content,
      selectedCategory,
      onPostCreated,
      resetForm,
      onClose,
      t,
    ]
  );

  const handleCategoryCreated = useCallback(
    (newCategory: ForumCategory) => {
      setSelectedCategory(newCategory.id);
      setShowCategoryModal(false);
      // Categories will be refreshed automatically by the context
      fetchCategories();
    },
    [fetchCategories]
  );

  const handleTitleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setTitle(e.target.value);
      if (validationErrors.title) {
        setValidationErrors((prev) => ({ ...prev, title: undefined }));
      }
    },
    [validationErrors.title]
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (validationErrors.content) {
        setValidationErrors((prev) => ({ ...prev, content: undefined }));
      }
    },
    [validationErrors.content]
  );

  const handleCategoryChange = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      setSelectedCategory(e.target.value);
      if (validationErrors.category) {
        setValidationErrors((prev) => ({ ...prev, category: undefined }));
      }
    },
    [validationErrors.category]
  );

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />

        <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden">
          <div className="p-6 overflow-y-auto max-h-[90vh]">
            <h2 className="text-2xl font-bold text-[#118B50] mb-6">
              {t("modal_title")}
            </h2>

            <form onSubmit={handleSubmit} noValidate>
              {/* Title */}
              <div className="mb-4">
                <label
                  htmlFor="post-title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("form.title")} *
                </label>
                <input
                  type="text"
                  id="post-title"
                  value={title}
                  onChange={handleTitleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-colors ${
                    validationErrors.title
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder={t("form.title_placeholder")}
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
                  htmlFor="post-category"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("form.category")} *
                </label>
                <div className="flex space-x-2">
                  <select
                    id="post-category"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className={`flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-colors ${
                      validationErrors.category
                        ? "border-red-500"
                        : "border-gray-300"
                    }`}
                    aria-invalid={!!validationErrors.category}
                    aria-describedby={
                      validationErrors.category ? "category-error" : undefined
                    }
                  >
                    <option value="">{t("form.category_placeholder")}</option>
                    {state.categories.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(true)}
                    className="px-4 py-2 bg-[#E3F0AF] text-[#118B50] rounded-lg hover:bg-[#d4e19f] transition-colors font-medium"
                  >
                    {t("category.new")}
                  </button>
                </div>
                {validationErrors.category && (
                  <p id="category-error" className="mt-1 text-sm text-red-600">
                    {validationErrors.category}
                  </p>
                )}
              </div>

              {/* Content */}
              <div className="mb-6">
                <label
                  htmlFor="post-content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  {t("form.content")} *
                </label>
                <textarea
                  id="post-content"
                  value={content}
                  onChange={handleContentChange}
                  rows={8}
                  className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-vertical transition-colors ${
                    validationErrors.content
                      ? "border-red-500"
                      : "border-gray-300"
                  }`}
                  placeholder={t("form.content_placeholder")}
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

              {/* General Error */}
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

              {/* Action Buttons */}
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-6 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                  disabled={loading}
                >
                  {t("form.cancel")}
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-6 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                           hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                           disabled:opacity-50 disabled:cursor-not-allowed font-medium
                           flex items-center space-x-2"
                >
                  {loading && (
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
                  <span>{loading ? t("form.creating") : t("form.submit")}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Category Modal */}
      <CreateCategoryModal
        isOpen={showCategoryModal}
        onClose={() => setShowCategoryModal(false)}
        onCategoryCreated={handleCategoryCreated}
      />
    </>
  );
});

export default CreatePostModal;
