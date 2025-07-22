// src/components/forum/CreateCommentForm.tsx
"use client";

import { useState, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";

interface CreateCommentFormProps {
  postId: string;
  onCommentCreated: (content: string) => Promise<boolean>;
}

const CreateCommentForm = memo(function CreateCommentForm({
  postId,
  onCommentCreated,
}: CreateCommentFormProps) {
  const t = useTranslations("forum.post_detail.comments");
  const [content, setContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

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

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      const validation = validateContent(content);
      if (validation) {
        setError(validation);
        return;
      }

      setIsSubmitting(true);
      setError("");

      const success = await onCommentCreated(content);

      if (success) {
        setContent("");
      } else {
        setError(t("error.create_failed"));
      }

      setIsSubmitting(false);
    },
    [content, validateContent, onCommentCreated, t]
  );

  const handleContentChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setContent(e.target.value);
      if (error) {
        setError("");
      }
    },
    [error]
  );

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white/40 backdrop-blur-sm rounded-xl p-4"
    >
      <div className="space-y-3">
        <textarea
          value={content}
          onChange={handleContentChange}
          placeholder={t("form.placeholder")}
          rows={3}
          className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-none transition-colors ${
            error ? "border-red-500" : "border-gray-300"
          }`}
          disabled={isSubmitting}
          aria-label={t("form.placeholder")}
          aria-invalid={!!error}
          aria-describedby={error ? "comment-error" : undefined}
        />

        {error && (
          <p id="comment-error" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-500">
            {content.length}/{FORUM_CONSTANTS.MAX_CONTENT_LENGTH}
          </p>

          <button
            type="submit"
            disabled={isSubmitting || !content.trim()}
            className="px-4 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
                     hover:from-[#0F7A43] hover:to-[#4FA384] transition-all duration-300 
                     disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium
                     flex items-center space-x-2"
          >
            {isSubmitting && (
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
            <span>{isSubmitting ? t("form.posting") : t("form.submit")}</span>
          </button>
        </div>
      </div>
    </form>
  );
});

export default CreateCommentForm;
