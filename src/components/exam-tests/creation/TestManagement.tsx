// src/components/exam-tests/creation/TestManagement.tsx - COMPACT VERSION

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Test, TestCategory, TestCreate } from "@/types/exam";
import { useTestCreation } from "@/hooks/useTestCreation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "../common/ErrorDisplay";
import ConfirmationModal from "../common/ConfirmationModal";

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

  const {
    isCreating,
    isSaving,
    isDeleting,
    error,
    createTest,
    updateTest,
    deleteTest,
    duplicateTest,
    publishTest,
    unpublishTest,
    clearError,
  } = useTestCreation();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<Test | null>(null);
  const [formData, setFormData] = useState<TestCreate>({
    title: "",
    description: "",
    category_id: "",
    time_limit: undefined,
    passing_score: 70,
    allow_multiple_attempts: true,
    show_correct_answers_in_training: true,
    is_premium: false,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingTest) {
      const success = await updateTest(editingTest.id, formData);
      if (success) {
        setIsFormOpen(false);
        setEditingTest(null);
        resetForm();
        onRefresh();
      }
    } else {
      const newTest = await createTest(formData);
      if (newTest) {
        resetForm();
      }
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
      is_premium: test.is_premium,
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (test: Test) => {
    if (!confirm(t("confirm_delete_test", { title: test.title }))) {
      return;
    }

    const success = await deleteTest(test.id);
    if (success) {
      onRefresh();
    }
  };

  const handleDuplicate = async (test: Test) => {
    const newTest = await duplicateTest(test.id);
    if (newTest) {
      onRefresh();
    }
  };

  const handlePublishToggle = async (test: Test) => {
    if (test.is_published) {
      await unpublishTest(test.id);
    } else {
      await publishTest(test.id);
    }
    onRefresh();
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      category_id: "",
      time_limit: undefined,
      passing_score: 70,
      allow_multiple_attempts: true,
      show_correct_answers_in_training: true,
      is_premium: false,
    });
    setIsFormOpen(false);
    setEditingTest(null);
  };

  return (
    <>
      {/* Error Display */}
      {error && (
        <ErrorDisplay error={error} onDismiss={clearError} className="mb-6" />
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
          {t("manage_tests")}
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          disabled={categories.length === 0}
          className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="flex items-center justify-center space-x-2">
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
      </div>

      {/* Test Form - keeping as is */}
      {isFormOpen && (
        <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900">
              {editingTest ? t("edit_test") : t("new_test")}
            </h3>
            <button
              onClick={resetForm}
              className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First row - Title and Category */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t("test_title")} *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  placeholder={t("test_title_placeholder")}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
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
                  className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
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
            </div>

            {/* Second row - Time and Score */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t("time_limit")}
                </label>
                <div className="relative">
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
                    className="w-full px-3 py-2 pr-16 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                    placeholder={t("unlimited")}
                    min="1"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    {t("minutes")}
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1.5">
                  {t("passing_score")} *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={formData.passing_score}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        passing_score: parseInt(e.target.value) || 0,
                      }))
                    }
                    className="w-full px-3 py-2 pr-8 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                    min="0"
                    max="100"
                    required
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">
                    %
                  </span>
                </div>
              </div>
            </div>

            {/* Description - Full width */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1.5">
                {t("description")}
              </label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent resize-none"
                placeholder={t("test_description_placeholder")}
                rows={2}
              />
            </div>

            {/* Premium Test Toggle - NEW SECTION */}
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
              <div className="flex items-start">
                <input
                  type="checkbox"
                  id="is_premium"
                  checked={formData.is_premium}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      is_premium: e.target.checked,
                    }))
                  }
                  className="w-4 h-4 mt-0.5 text-[#118B50] bg-white border-gray-300 rounded focus:ring-[#118B50] focus:ring-2"
                />
                <div className="ml-3">
                  <label
                    htmlFor="is_premium"
                    className="text-sm font-medium text-gray-700"
                  >
                    {t("premium_test")}
                  </label>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {t("premium_test_description")}
                  </p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isCreating || isSaving}
                className="px-4 py-2 text-sm font-medium text-white bg-[#118B50] rounded-lg hover:bg-[#0A6B3B] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isCreating || isSaving ? (
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
            </div>
          </form>
        </div>
      )}

      {/* Tests List - Responsive */}
      {tests.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-200">
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
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block space-y-6">
            {/* Group tests by category */}
            {categories
              .sort((a, b) => a.name.localeCompare(b.name)) // Sort categories alphabetically
              .map((category) => {
                const categoryTests = tests.filter(
                  (test) => test.category_id === category.id
                );

                // Skip categories with no tests
                if (categoryTests.length === 0) return null;

                return (
                  <div
                    key={category.id}
                    className="bg-white rounded-xl border border-gray-200 overflow-hidden"
                  >
                    {/* Category Header */}
                    <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900">
                        {category.name}
                        <span className="ml-2 text-xs font-normal text-gray-500">
                          ({categoryTests.length}{" "}
                          {categoryTests.length === 1 ? t("test") : t("tests")})
                        </span>
                      </h3>
                    </div>

                    {/* Tests Table */}
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-100">
                        <tr>
                          <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("test_title")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("type")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("questions")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("time_limit")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("passing_score")}
                          </th>
                          <th className="px-4 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Status
                          </th>
                          <th className="px-6 py-2 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                            {t("actions")}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-100">
                        {categoryTests.map((test) => (
                          <tr key={test.id} className="hover:bg-gray-50">
                            <td className="px-4 py-3">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {test.title}
                                </div>
                                {test.description && (
                                  <div className="text-xs text-gray-500 truncate max-w-xs">
                                    {test.description}
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center">
                              {test.is_premium ? (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                  {t("premium")}
                                </span>
                              ) : (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                  {t("free")}
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-500">
                              {test.question_count || 0}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-500">
                              {test.time_limit
                                ? `${test.time_limit} ${t("minutes")}`
                                : t("unlimited")}
                            </td>
                            <td className="px-4 py-3 text-sm text-center text-gray-500">
                              {test.passing_score}%
                            </td>
                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                                  test.is_published
                                    ? "bg-green-100 text-green-800"
                                    : "bg-yellow-100 text-yellow-800"
                                }`}
                              >
                                {test.is_published
                                  ? t("published")
                                  : t("draft")}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex items-center justify-center space-x-1">
                                <button
                                  onClick={() =>
                                    router.push(
                                      `/${locale}/exam-tests/create/${test.id}/questions`
                                    )
                                  }
                                  className={`px-3 py-1.5 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1 ${
                                    test.is_premium
                                      ? "bg-yellow-600 hover:bg-yellow-700"
                                      : "bg-[#118B50] hover:bg-[#0A6B3B]"
                                  }`}
                                >
                                  {test.is_premium && (
                                    <svg
                                      className="w-3 h-3"
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  )}
                                  {t("manage_questions")}
                                </button>
                                <button
                                  onClick={() => handleEdit(test)}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                                  title={t("edit")}
                                >
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
                                      d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDuplicate(test)}
                                  disabled={isCreating}
                                  className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                                  title={t("duplicate")}
                                >
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
                                      d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                    />
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handlePublishToggle(test)}
                                  disabled={
                                    isSaving ||
                                    !test.question_count ||
                                    test.question_count === 0
                                  }
                                  className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                    test.is_published
                                      ? "text-yellow-600 hover:bg-yellow-50"
                                      : "text-green-600 hover:bg-green-50"
                                  }`}
                                  title={
                                    test.is_published
                                      ? t("unpublish")
                                      : t("publish")
                                  }
                                >
                                  <svg
                                    className="w-4 h-4"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24"
                                  >
                                    {test.is_published ? (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                      />
                                    ) : (
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                      />
                                    )}
                                  </svg>
                                </button>
                                <button
                                  onClick={() => handleDelete(test)}
                                  disabled={isDeleting}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                                  title={t("delete")}
                                >
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
                                      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                    />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                );
              })}
          </div>

          {/* Mobile Card View */}
          <div className="md:hidden space-y-6">
            {categories
              .sort((a, b) => a.name.localeCompare(b.name))
              .map((category) => {
                const categoryTests = tests.filter(
                  (test) => test.category_id === category.id
                );

                if (categoryTests.length === 0) return null;

                return (
                  <div key={category.id} className="space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 px-2">
                      {category.name}
                      <span className="ml-2 text-xs font-normal text-gray-500">
                        ({categoryTests.length})
                      </span>
                    </h3>

                    {categoryTests.map((test) => (
                      <div
                        key={test.id}
                        className="bg-white rounded-lg border border-gray-200 p-4"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900">
                              {test.title}
                            </h4>
                            {test.description && (
                              <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                {test.description}
                              </p>
                            )}
                          </div>
                          <div className="flex flex-col gap-1 items-end">
                            <span
                              className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                test.is_published
                                  ? "bg-green-100 text-green-800"
                                  : "bg-yellow-100 text-yellow-800"
                              }`}
                            >
                              {test.is_published ? t("published") : t("draft")}
                            </span>
                            {test.is_premium && (
                              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                {t("premium")}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-2 mb-3 text-xs text-gray-600">
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"
                              />
                            </svg>
                            {test.category?.name}
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
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
                            {test.question_count || 0} {t("questions")}
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {test.time_limit || t("unlimited")}
                          </div>
                          <div className="flex items-center">
                            <svg
                              className="w-3 h-3 mr-1"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                              />
                            </svg>
                            {test.passing_score}%
                          </div>
                        </div>

                        <div className="flex justify-between items-center">
                          <button
                            onClick={() =>
                              router.push(
                                `/${locale}/exam-tests/create/${test.id}/questions`
                              )
                            }
                            className="px-3 py-1.5 bg-[#118B50] text-white text-xs font-medium rounded-lg hover:bg-[#0A6B3B] transition-colors"
                          >
                            {t("manage_questions")}
                          </button>
                          <div className="flex space-x-1">
                            <button
                              onClick={() => handleEdit(test)}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                              title={t("edit")}
                            >
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
                                  d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDuplicate(test)}
                              disabled={isCreating}
                              className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                              title={t("duplicate")}
                            >
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
                                  d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                                />
                              </svg>
                            </button>
                            <button
                              onClick={() => handlePublishToggle(test)}
                              disabled={
                                isSaving ||
                                !test.question_count ||
                                test.question_count === 0
                              }
                              className={`p-1.5 rounded-lg transition-colors disabled:opacity-50 ${
                                test.is_published
                                  ? "text-yellow-600 hover:bg-yellow-50"
                                  : "text-green-600 hover:bg-green-50"
                              }`}
                              title={
                                test.is_published
                                  ? t("unpublish")
                                  : t("publish")
                              }
                            >
                              <svg
                                className="w-4 h-4"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                              >
                                {test.is_published ? (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                                  />
                                ) : (
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                                  />
                                )}
                              </svg>
                            </button>
                            <button
                              onClick={() => handleDelete(test)}
                              disabled={isDeleting}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title={t("delete")}
                            >
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
                                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })}
          </div>
        </>
      )}
    </>
  );
}
