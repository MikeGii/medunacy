// src/components/exam-tests/creation/TestManagement.tsx - REFACTORED

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import { Test, TestCategory, TestCreate } from "@/types/exam";
import { useTestCreation } from "@/hooks/useTestCreation";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorDisplay from "../common/ErrorDisplay";
import ConfirmationModal from "../common/ConfirmationModal";
import { TestCard } from "../common/OptimizedComponents";

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
  const [deleteConfirm, setDeleteConfirm] = useState<Test | null>(null);
  const [formData, setFormData] = useState<TestCreate>({
    title: "",
    description: "",
    category_id: "",
    time_limit: undefined,
    passing_score: 70,
    allow_multiple_attempts: true,
    show_correct_answers_in_training: true,
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
        // Router navigation is handled in the hook
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
    });
    setIsFormOpen(true);
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;

    const success = await deleteTest(deleteConfirm.id);
    if (success) {
      setDeleteConfirm(null);
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
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900">
          {t("manage_tests")}
        </h2>
        <button
          onClick={() => setIsFormOpen(true)}
          disabled={categories.length === 0}
          className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
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
      </div>

      {/* Test Form */}
      {isFormOpen && (
        <div className="bg-gradient-to-br from-[#E3F0AF]/20 to-[#5DB996]/10 border border-[#E3F0AF] rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold mb-6 text-[#118B50]">
            {editingTest ? t("edit_test") : t("new_test")}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
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
                  required
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

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  rows={3}
                />
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
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t("passing_score")} (%)
                </label>
                <input
                  type="number"
                  value={formData.passing_score}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      passing_score: parseInt(e.target.value) || 0,
                    }))
                  }
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                  min="0"
                  max="100"
                  required
                />
              </div>
            </div>

            <div className="flex space-x-4">
              <button
                type="submit"
                disabled={isCreating || isSaving}
                className="px-6 py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 disabled:opacity-50"
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

              <button
                type="button"
                onClick={resetForm}
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
                  <p className="text-gray-600 mb-3">{test.description}</p>
                  <div className="flex items-center space-x-6 text-sm text-gray-500">
                    <span>📁 {test.category?.name}</span>
                    <span>
                      📝 {test.question_count || 0} {t("questions")}
                    </span>
                    {test.time_limit && (
                      <span>
                        ⏱️ {test.time_limit} {t("minutes")}
                      </span>
                    )}
                    <span>
                      ✓ {test.passing_score}% {t("to_pass")}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 ml-4">
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
                        d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                      />
                    </svg>
                  </button>

                  <button
                    onClick={() => handleEdit(test)}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
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
                    onClick={() => handleDuplicate(test)}
                    disabled={isCreating}
                    className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
                    title={t("duplicate")}
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
                    className={`p-2 rounded-lg transition-colors disabled:opacity-50 ${
                      test.is_published
                        ? "text-yellow-600 hover:bg-yellow-50"
                        : "text-green-600 hover:bg-green-50"
                    }`}
                    title={test.is_published ? t("unpublish") : t("publish")}
                  >
                    <svg
                      className="w-5 h-5"
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
                    onClick={() => setDeleteConfirm(test)}
                    disabled={isDeleting}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
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
          ))
        )}
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deleteConfirm}
        title={t("delete_test_title")}
        message={t("delete_test_message", {
          title: deleteConfirm?.title || "this test",
        })}
        confirmText={t("delete")}
        cancelText={t("cancel")}
        type="danger"
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirm(null)}
      />
    </>
  );
}
