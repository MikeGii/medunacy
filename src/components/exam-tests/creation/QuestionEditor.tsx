// src/components/exam-tests/creation/QuestionEditor.tsx

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { TestQuestion, QuestionFormData } from "@/types/exam";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface QuestionEditorProps {
  question?: TestQuestion | null;
  onSave: (questionData: QuestionFormData) => Promise<void>;
  onCancel: () => void;
  isSaving?: boolean;
}

export default function QuestionEditor({
  question,
  onSave,
  onCancel,
  isSaving = false,
}: QuestionEditorProps) {
  const t = useTranslations("test_creation");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<QuestionFormData>({
    question_text: "",
    explanation: "",
    points: 1,
    options: [
      { option_text: "", is_correct: false },
      { option_text: "", is_correct: false },
    ],
  });

  // Initialize form data when editing
  useEffect(() => {
    if (question) {
      setFormData({
        question_text: question.question_text,
        explanation: question.explanation || "",
        points: question.points,
        options: question.options.map((opt) => ({
          option_text: opt.option_text,
          is_correct: opt.is_correct,
        })),
      });
    }
  }, [question]);

  const addOption = () => {
    setFormData((prev) => ({
      ...prev,
      options: [...prev.options, { option_text: "", is_correct: false }],
    }));
  };

  const removeOption = (index: number) => {
    if (formData.options.length <= 2) return; // Minimum 2 options

    setFormData((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== index),
    }));
  };

  const updateOption = (
    index: number,
    field: "option_text" | "is_correct",
    value: string | boolean
  ) => {
    setFormData((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) =>
        i === index ? { ...opt, [field]: value } : opt
      ),
    }));
  };

  const toggleCorrectAnswer = (index: number) => {
    updateOption(index, "is_correct", !formData.options[index].is_correct);
  };

  const validateForm = (): string | null => {
    if (!formData.question_text.trim()) {
      return t("question_text_required");
    }

    const validOptions = formData.options.filter((opt) =>
      opt.option_text.trim()
    );
    if (validOptions.length < 2) {
      return t("minimum_two_options");
    }

    const correctOptions = formData.options.filter(
      (opt) => opt.is_correct && opt.option_text.trim()
    );
    if (correctOptions.length === 0) {
      return t("at_least_one_correct");
    }

    if (formData.points <= 0) {
      return t("points_must_be_positive");
    }

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    // Filter out empty options
    const cleanedData = {
      ...formData,
      options: formData.options.filter((opt) => opt.option_text.trim()),
    };

    setLoading(true);
    try {
      await onSave(cleanedData);
    } catch (err) {
      console.error("Error saving question:", err);
      setError(err instanceof Error ? err.message : t("save_question_error"));
    } finally {
      setLoading(false);
    }
  };

  const correctCount = formData.options.filter((opt) => opt.is_correct).length;

  return (
    <div className="bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 border border-[#E3F0AF] rounded-xl p-6 mb-6">
      <h3 className="text-lg font-semibold mb-6 text-[#118B50]">
        {question ? t("edit_question") : t("add_new_question")}
      </h3>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Question Text */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("question_text")} *
          </label>
          <textarea
            value={formData.question_text}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                question_text: e.target.value,
              }))
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
            placeholder={t("question_text_placeholder")}
            rows={3}
            required
          />
        </div>

        {/* Points */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("points")} *
            </label>
            <input
              type="number"
              value={formData.points}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  points: parseInt(e.target.value) || 1,
                }))
              }
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
              min="1"
              max="10"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              {t("correct_answers_selected")}
            </label>
            <div className="px-4 py-3 bg-gray-50 rounded-xl border border-gray-300">
              <span
                className={`font-medium ${
                  correctCount > 0 ? "text-green-600" : "text-red-600"
                }`}
              >
                {correctCount} {t("selected")}
              </span>
              {correctCount > 1 && (
                <span className="ml-2 text-sm text-blue-600">
                  ({t("multiple_choice")})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Options */}
        <div>
          <div className="flex justify-between items-center mb-4">
            <label className="block text-sm font-medium text-gray-700">
              {t("answer_options")} * ({t("minimum_two_required")})
            </label>
            <button
              type="button"
              onClick={addOption}
              className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-sm font-medium"
            >
              <div className="flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                  />
                </svg>
                <span>{t("add_option")}</span>
              </div>
            </button>
          </div>

          <div className="space-y-3">
            {formData.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 transition-all ${
                  option.is_correct
                    ? "border-green-300 bg-green-50"
                    : "border-gray-200 bg-white"
                }`}
              >
                {/* Option Label */}
                <div className="flex-shrink-0 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-sm font-medium text-gray-600">
                  {String.fromCharCode(65 + index)}
                </div>

                {/* Option Text */}
                <input
                  type="text"
                  value={option.option_text}
                  onChange={(e) =>
                    updateOption(index, "option_text", e.target.value)
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  placeholder={t("option_text_placeholder", {
                    letter: String.fromCharCode(65 + index),
                  })}
                />

                {/* Correct Answer Toggle */}
                <button
                  type="button"
                  onClick={() => toggleCorrectAnswer(index)}
                  className={`flex-shrink-0 p-2 rounded-lg transition-all ${
                    option.is_correct
                      ? "bg-green-500 text-white hover:bg-green-600"
                      : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                  }`}
                  title={
                    option.is_correct ? t("mark_incorrect") : t("mark_correct")
                  }
                >
                  {option.is_correct ? (
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
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                  ) : (
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
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  )}
                </button>

                {/* Remove Option */}
                {formData.options.length > 2 && (
                  <button
                    type="button"
                    onClick={() => removeOption(index)}
                    className="flex-shrink-0 p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t("remove_option")}
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
            ))}
          </div>

          <div className="text-sm text-gray-500 mt-2">
            <p>{t("option_instructions")}</p>
            {correctCount > 1 && (
              <p className="text-blue-600 mt-1">{t("multiple_correct_note")}</p>
            )}
          </div>
        </div>

        {/* Explanation */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t("explanation")} ({t("optional")})
          </label>
          <textarea
            value={formData.explanation}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, explanation: e.target.value }))
            }
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
            placeholder={t("explanation_placeholder")}
            rows={3}
          />
          <p className="text-sm text-gray-500 mt-1">{t("explanation_help")}</p>
        </div>

        {/* Form Actions */}
        <div className="flex space-x-4 pt-4 border-t border-gray-200">
          <button
            type="submit"
            disabled={loading || isSaving}
            className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 disabled:opacity-50"
          >
            {loading || isSaving ? (
              <div className="flex items-center space-x-2">
                <LoadingSpinner />
                <span>{t("saving")}</span>
              </div>
            ) : (
              t("save_question")
            )}
          </button>

          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
          >
            {t("cancel")}
          </button>
        </div>
      </form>
    </div>
  );
}
