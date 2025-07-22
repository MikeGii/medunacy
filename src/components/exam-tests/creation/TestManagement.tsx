// src/components/exam-tests/creation/TestManagement.tsx

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Test, TestCategory, TestCreate } from "@/types/exam";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface TestManagementProps {
  tests: Test[];
  categories: TestCategory[];
  onRefresh: () => void;
}

export default function TestManagement({
  tests,
  categories,
  onRefresh,
}: TestManagementProps) {
  const t = useTranslations("test_creation");
  const router = useRouter();
  const locale = useLocale();

  const [isCreating, setIsCreating] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [formData, setFormData] = useState<TestCreate>({
    title: "",
    description: "",
    category_id: "",
    time_limit: undefined,
    passing_score: 70,
    allow_multiple_attempts: true,
    show_correct_answers_in_training: true,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const url = editingTest ? `/api/tests/${editingTest.id}` : "/api/tests";

      const method = editingTest ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to save test");
      }

      // Reset form and refresh
      setFormData({
        title: "",
        description: "",
        category_id: "",
        time_limit: undefined,
        passing_score: 70,
        allow_multiple_attempts: true,
        show_correct_answers_in_training: true,
      });
      setIsCreating(false);
      setEditingTest(null);
      onRefresh();

      // If creating a new test, redirect to question management
      if (!editingTest) {
        router.push(`/${locale}/exam-tests/create/${data.data.id}/questions`);
      }
    } catch (err) {
      console.error("Error saving test:", err);
      setError(err instanceof Error ? err.message : "Failed to save test");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (test: Test) => {
    setEditingTest(test);
    setFormData({
      title: test.title,
      description: test.description || "",
      category_id: test.category_id,
      time_limit: test.time_limit,
      passing_score: test.passing_score,
      allow_multiple_attempts: test.allow_multiple_attempts,
      show_correct_answers_in_training: test.show_correct_answers_in_training,
    });
    setIsCreating(true);
  };

  const handleCancel = () => {
    setIsCreating(false);
    setEditingTest(null);
    setFormData({
      title: "",
      description: "",
      category_id: "",
      time_limit: undefined,
      passing_score: 70,
      allow_multiple_attempts: true,
      show_correct_answers_in_training: true,
    });
    setError(null);
  };

  const handleDelete = async (test: Test) => {
    if (!confirm(t("confirm_delete_test", { title: test.title }))) {
      return;
    }

    try {
      const response = await fetch(`/api/tests/${test.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete test");
      }

      onRefresh();
    } catch (err) {
      console.error("Error deleting test:", err);
      setError(err instanceof Error ? err.message : "Failed to delete test");
    }
  };

  const togglePublished = async (test: Test) => {
    try {
      const response = await fetch(`/api/tests/${test.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          is_published: !test.is_published,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to update test");
      }

      onRefresh();
    } catch (err) {
      console.error("Error updating test:", err);
      setError(err instanceof Error ? err.message : "Failed to update test");
    }
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-[#118B50]">{t("tests")}</h2>
        {!isCreating && (
          <button
            onClick={() => setIsCreating(true)}
            className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105"
          >
            <div className="flex items-center space-x-2">
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
                  d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                />
              </svg>
              <span>{t("create_test")}</span>
            </div>
          </button>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
          <p className="text-red-800">{error}</p>
        </div>
      )}

      {/* No Categories Warning */}
      {categories.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
          <p className="text-amber-800">{t("no_categories_warning")}</p>
        </div>
      )}

      {/* Create/Edit Form */}
      {isCreating && (
        <div className="bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 border border-[#E3F0AF] rounded-xl p-6 mb-6">
          <h3 className="text-lg font-semibold mb-4 text-[#118B50]">
            {editingTest ? t("edit_test") : t("create_new_test")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("test_title")} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  placeholder={t("test_title_placeholder")}
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("test_description")}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  placeholder={t("test_description_placeholder")}
                  rows={3}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("category")} *
                </label>
                <select
                  value={formData.category_id}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      category_id: e.target.value,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  required
                >
                  <option value="">{t("select_category")}</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("time_limit")}
                </label>
                <input
                  type="number"
                  value={formData.time_limit || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      time_limit: e.target.value
                        ? parseInt(e.target.value)
                        : undefined,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  placeholder={t("time_limit_placeholder")}
                  min="1"
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t("time_limit_help")}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("passing_score")} *
                </label>
                <input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passing_score: parseInt(e.target.value) || 70,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  min="0"
                  max="100"
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  {t("passing_score_help")}
                </p>
              </div>

              <div className="md:col-span-2 space-y-4">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="allow_multiple_attempts"
                    checked={formData.allow_multiple_attempts}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        allow_multiple_attempts: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-[#118B50] focus:ring-[#118B50] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="allow_multiple_attempts"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {t("allow_multiple_attempts")}
                  </label>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="show_correct_answers"
                    checked={formData.show_correct_answers_in_training}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        show_correct_answers_in_training: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 text-[#118B50] focus:ring-[#118B50] border-gray-300 rounded"
                  />
                  <label
                    htmlFor="show_correct_answers"
                    className="ml-2 block text-sm text-gray-700"
                  >
                    {t("show_correct_answers_in_training")}
                  </label>
                </div>
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={loading || categories.length === 0}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 disabled:opacity-50"
              >
                {loading ? (
                  <div className="flex items-center space-x-2">
                    <LoadingSpinner />
                    <span>{t("saving")}</span>
                  </div>
                ) : editingTest ? (
                  t("update_test")
                ) : (
                  t("create_test")
                )}
              </button>

              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all duration-300"
              >
                {t("cancel")}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tests List */}
      <div className="space-y-4">
        {tests.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-gray-400"
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
            </div>
            <h3 className="text-lg font-semibold text-gray-700 mb-2">
              {t("no_tests")}
            </h3>
            <p className="text-gray-500">{t("no_tests_description")}</p>
          </div>
        ) : (
          tests.map((test) => (
            <div
              key={test.id}
              className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {test.title}
                    </h3>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        test.is_published
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {test.is_published ? t("published") : t("draft")}
                    </span>
                  </div>

                  {test.description && (
                    <p className="text-gray-600 mb-3">{test.description}</p>
                  )}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500">
                    <div>
                      <span className="font-medium">{t("category")}:</span>
                      <br />
                      {test.category?.name || t("unknown")}
                    </div>
                    <div>
                      <span className="font-medium">{t("questions")}:</span>
                      <br />
                      {test.question_count || 0}
                    </div>
                    <div>
                      <span className="font-medium">{t("time_limit")}:</span>
                      <br />
                      {test.time_limit
                        ? `${test.time_limit} min`
                        : t("unlimited")}
                    </div>
                    <div>
                      <span className="font-medium">{t("passing_score")}:</span>
                      <br />
                      {test.passing_score}%
                    </div>
                  </div>
                </div>

                <div className="flex flex-col space-y-2">
                  <div className="flex space-x-2">
                    <button
                      onClick={() =>
                        router.push(
                          `/${locale}/exam-tests/create/${test.id}/questions`
                        )
                      }
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title={t("manage_questions")}
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
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </button>

                    <button
                      onClick={() => handleEdit(test)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title={t("edit")}
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

                    <button
                      onClick={() => togglePublished(test)}
                      className={`p-2 rounded-lg transition-colors ${
                        test.is_published
                          ? "text-yellow-600 hover:bg-yellow-50"
                          : "text-green-600 hover:bg-green-50"
                      }`}
                      title={test.is_published ? t("unpublish") : t("publish")}
                    >
                      {test.is_published ? (
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
                            d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21"
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
                            d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          />
                        </svg>
                      )}
                    </button>

                    <button
                      onClick={() => handleDelete(test)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title={t("delete")}
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
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
