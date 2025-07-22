// src/components/forum/CreateCategoryModal.tsx
"use client";

import { useState, useEffect, useCallback, memo } from "react";
import { useTranslations } from "next-intl";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { FORUM_CONSTANTS } from "@/utils/forum.constants";
import { ForumCategory } from "@/types/forum.types";

interface CreateCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCategoryCreated: (category: ForumCategory) => void;
}

const CreateCategoryModal = memo(function CreateCategoryModal({
  isOpen,
  onClose,
  onCategoryCreated,
}: CreateCategoryModalProps) {
  const t = useTranslations("forum.create_post.category");
  const { user } = useAuth();
  const [categoryName, setCategoryName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validationError, setValidationError] = useState<string>("");

  // Reset form when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setCategoryName("");
      setError(null);
      setValidationError("");
      setLoading(false);
    }
  }, [isOpen]);

  // Validate category name
  const validateCategoryName = useCallback(
    (name: string): string => {
      const trimmedName = name.trim();

      if (!trimmedName) {
        return t("validation.name_required");
      }

      if (trimmedName.length < FORUM_CONSTANTS.MIN_CATEGORY_NAME_LENGTH) {
        return t("validation.name_too_short", {
          min: FORUM_CONSTANTS.MIN_CATEGORY_NAME_LENGTH,
        });
      }

      if (trimmedName.length > FORUM_CONSTANTS.MAX_CATEGORY_NAME_LENGTH) {
        return t("validation.name_too_long", {
          max: FORUM_CONSTANTS.MAX_CATEGORY_NAME_LENGTH,
        });
      }

      // Check for valid characters (letters, numbers, spaces, hyphens)
      if (!/^[a-zA-Z0-9\s\-\u0100-\u017F\u0400-\u04FF]+$/.test(trimmedName)) {
        return t("validation.invalid_characters");
      }

      return "";
    },
    [t]
  );

  // Handle input change with validation
  const handleNameChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setCategoryName(value);

      // Clear validation error when user starts typing
      if (validationError) {
        setValidationError("");
      }

      // Clear general error when user types
      if (error) {
        setError(null);
      }
    },
    [validationError, error]
  );

  // Handle form submission
  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!user) {
        setError(t("error.not_authenticated"));
        return;
      }

      // Validate
      const validation = validateCategoryName(categoryName);
      if (validation) {
        setValidationError(validation);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error: insertError } = await supabase
          .from("forum_categories")
          .insert({
            name: categoryName.trim(),
            created_by: user.id,
          })
          .select()
          .single();

        if (insertError) {
          if (insertError.code === "23505") {
            setError(t("error.category_exists"));
          } else {
            throw insertError;
          }
          return;
        }

        // Success - create proper ForumCategory object
        const newCategory: ForumCategory = {
          id: data.id,
          name: data.name,
          created_by: data.created_by,
          created_at: data.created_at,
          post_count: 0,
        };

        onCategoryCreated(newCategory);
        onClose();
      } catch (err) {
        console.error("Error creating category:", err);
        setError(t("error.create_failed"));
      } finally {
        setLoading(false);
      }
    },
    [user, categoryName, validateCategoryName, onCategoryCreated, onClose, t]
  );

  // Handle close with confirmation if there's unsaved data
  const handleClose = useCallback(() => {
    if (categoryName.trim() && !loading) {
      const confirmClose = window.confirm(t("confirm_close"));
      if (!confirmClose) return;
    }
    onClose();
  }, [categoryName, loading, onClose, t]);

  // Handle escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) {
        handleClose();
      }
    };

    window.addEventListener("keydown", handleEscape);
    return () => window.removeEventListener("keydown", handleEscape);
  }, [isOpen, loading, handleClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={handleClose}
        aria-hidden="true"
      />

      <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md transform transition-all">
        <div className="p-6">
          <h3 className="text-xl font-bold text-[#118B50] mb-4">
            {t("modal_title")}
          </h3>

          <form onSubmit={handleSubmit} noValidate>
            <div className="mb-4">
              <label
                htmlFor="category-name"
                className="block text-sm font-medium text-gray-700 mb-2"
              >
                {t("name")} *
              </label>
              <input
                type="text"
                id="category-name"
                value={categoryName}
                onChange={handleNameChange}
                className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent transition-colors ${
                  validationError || error
                    ? "border-red-500"
                    : "border-gray-300"
                }`}
                placeholder={t("name_placeholder")}
                autoFocus
                disabled={loading}
                aria-invalid={!!(validationError || error)}
                aria-describedby={
                  validationError
                    ? "name-error"
                    : error
                    ? "form-error"
                    : undefined
                }
              />
              {validationError && (
                <p id="name-error" className="mt-1 text-sm text-red-600">
                  {validationError}
                </p>
              )}
              <p className="mt-1 text-xs text-gray-500">
                {categoryName.length}/{FORUM_CONSTANTS.MAX_CATEGORY_NAME_LENGTH}
              </p>
            </div>

            {/* General error */}
            {error && (
              <div
                id="form-error"
                className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm flex items-center"
              >
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

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium"
                disabled={loading}
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={loading || !categoryName.trim()}
                className="px-4 py-2 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-lg 
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
                <span>{loading ? t("creating") : t("create")}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
});

export default CreateCategoryModal;
