// src/components/exam-tests/creation/RandomTestGeneratorModal.tsx - Inline version

"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Test } from "@/types/exam";
import { useExam } from "@/contexts/ExamContext";
import LoadingSpinner from "@/components/common/LoadingSpinner";

interface RandomTestGeneratorModalProps {
  currentTestId: string;
  onGenerate: (params: {
    questionCount: number;
    allowMultipleCorrect: boolean;
    sourceTestIds: string[];
  }) => Promise<void>;
  onCancel: () => void;
}

export default function RandomTestGeneratorModal({
  currentTestId,
  onGenerate,
  onCancel,
}: RandomTestGeneratorModalProps) {
  const t = useTranslations("test_creation");
  const { tests, categories, fetchTests } = useExam();
  const [loading, setLoading] = useState(false);
  const [fetchingTests, setFetchingTests] = useState(true);

  // Form state
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [allowMultipleCorrect, setAllowMultipleCorrect] =
    useState<boolean>(true);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);

  // Available tests (excluding current test and tests without questions)
  const [availableTests, setAvailableTests] = useState<Test[]>([]);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);

  // Fetch and filter tests on mount
  useEffect(() => {
    const loadTests = async () => {
      setFetchingTests(true);
      try {
        await fetchTests();
      } catch (error) {
        console.error("Error fetching tests:", error);
      } finally {
        setFetchingTests(false);
      }
    };

    loadTests();
  }, [fetchTests]);

  // Filter available tests when tests data changes
  useEffect(() => {
    const filtered = tests.filter(
      (test) =>
        test.id !== currentTestId &&
        test.question_count &&
        test.question_count > 0 &&
        test.is_published &&
        (selectedCategoryIds.length === 0 ||
          selectedCategoryIds.includes(test.category_id))
    );
    setAvailableTests(filtered);
  }, [tests, currentTestId, selectedCategoryIds]);

  // Calculate total available questions
  const totalAvailableQuestions = availableTests
    .filter((test) => selectedTestIds.includes(test.id))
    .reduce((sum, test) => sum + (test.question_count || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (selectedTestIds.length === 0) {
      return;
    }

    if (questionCount > totalAvailableQuestions) {
      return;
    }

    setLoading(true);
    try {
      await onGenerate({
        questionCount,
        allowMultipleCorrect,
        sourceTestIds: selectedTestIds,
      });
      onCancel();
    } catch (error) {
      console.error("Error generating test:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTestSelection = (testId: string) => {
    setSelectedTestIds((prev) =>
      prev.includes(testId)
        ? prev.filter((id) => id !== testId)
        : [...prev, testId]
    );
  };

  // Group tests by category for better UX
  const testsByCategory = categories
    .map((category) => ({
      category,
      tests: availableTests.filter((test) => test.category_id === category.id),
    }))
    .filter((group) => group.tests.length > 0);

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 sm:p-6 shadow-sm">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            {t("generate_random_test")}
          </h3>
        </div>

        {fetchingTests ? (
          <div className="flex justify-center py-8">
            <LoadingSpinner />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Question count */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("how_many_questions")}
              </label>
              <input
                type="number"
                min="1"
                max={totalAvailableQuestions || 100}
                value={questionCount}
                onChange={(e) =>
                  setQuestionCount(parseInt(e.target.value) || 1)
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#118B50] focus:border-transparent"
                required
              />
              {totalAvailableQuestions > 0 && (
                <p className="mt-1 text-xs text-gray-500">
                  {t("total_available_questions")}: {totalAvailableQuestions}
                </p>
              )}
            </div>

            {/* Allow multiple correct answers */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="allowMultiple"
                checked={allowMultipleCorrect}
                onChange={(e) => setAllowMultipleCorrect(e.target.checked)}
                className="h-4 w-4 text-[#118B50] focus:ring-[#118B50] border-gray-300 rounded"
              />
              <label
                htmlFor="allowMultiple"
                className="ml-2 text-sm text-gray-700"
              >
                {t("allow_multiple_correct_questions")}
              </label>
            </div>

            {/* Category Selection - NEW SECTION */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("filter_by_categories")} *
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {categories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-2">
                    {t("no_categories_available")}
                  </p>
                ) : (
                  categories.map((category) => {
                    const testsInCategory = tests.filter(
                      (test) =>
                        test.category_id === category.id &&
                        test.id !== currentTestId &&
                        test.question_count &&
                        test.question_count > 0 &&
                        test.is_published
                    ).length;

                    return (
                      <label
                        key={category.id}
                        className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      >
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            checked={selectedCategoryIds.includes(category.id)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedCategoryIds((prev) => [
                                  ...prev,
                                  category.id,
                                ]);
                              } else {
                                setSelectedCategoryIds((prev) =>
                                  prev.filter((id) => id !== category.id)
                                );
                                // Also unselect tests from this category
                                const testsInCategory = tests
                                  .filter(
                                    (test) => test.category_id === category.id
                                  )
                                  .map((test) => test.id);
                                setSelectedTestIds((prev) =>
                                  prev.filter(
                                    (id) => !testsInCategory.includes(id)
                                  )
                                );
                              }
                            }}
                            className="h-4 w-4 text-[#118B50] focus:ring-[#118B50] border-gray-300 rounded"
                          />
                          <span className="ml-2 text-sm font-medium text-gray-900">
                            {category.name}
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          ({testsInCategory} {t("tests")})
                        </span>
                      </label>
                    );
                  })
                )}
              </div>
              {selectedCategoryIds.length === 0 && (
                <p className="mt-1 text-xs text-red-600">
                  {t("please_select_at_least_one_category")}
                </p>
              )}
            </div>

            {/* Test selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                {t("select_source_tests")} *
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-2">
                {selectedCategoryIds.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {t("select_category_first")}
                  </p>
                ) : testsByCategory.filter(({ category }) =>
                    selectedCategoryIds.includes(category.id)
                  ).length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">
                    {t("no_tests_in_selected_categories")}
                  </p>
                ) : (
                  <div className="space-y-3">
                    {testsByCategory
                      .filter(({ category }) =>
                        selectedCategoryIds.includes(category.id)
                      )
                      .map(({ category, tests }) => (
                        <div key={category.id}>
                          <h4 className="text-xs font-semibold text-gray-600 uppercase tracking-wider mb-1">
                            {category.name}
                          </h4>
                          <div className="space-y-1 ml-2">
                            {tests.map((test) => (
                              <label
                                key={test.id}
                                className="flex items-center p-2 hover:bg-gray-50 rounded cursor-pointer"
                              >
                                <input
                                  type="checkbox"
                                  checked={selectedTestIds.includes(test.id)}
                                  onChange={() => toggleTestSelection(test.id)}
                                  className="h-4 w-4 text-[#118B50] focus:ring-[#118B50] border-gray-300 rounded"
                                />
                                <div className="ml-2 flex-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {test.title}
                                  </span>
                                  <span className="text-xs text-gray-500 ml-2">
                                    ({test.question_count} {t("questions")})
                                  </span>
                                </div>
                              </label>
                            ))}
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>
              {selectedTestIds.length === 0 &&
                selectedCategoryIds.length > 0 && (
                  <p className="mt-1 text-xs text-red-600">
                    {t("please_select_at_least_one_test")}
                  </p>
                )}
            </div>

            {/* Error messages */}
            {questionCount > totalAvailableQuestions &&
              totalAvailableQuestions > 0 && (
                <p className="text-sm text-red-600">
                  {t("question_count_exceeds_available")}
                </p>
              )}
          </div>
        )}

        {/* Form Actions - Same style as QuestionEditor */}
        <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            onClick={onCancel}
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all duration-300"
          >
            {t("cancel")}
          </button>

          <button
            type="submit"
            disabled={
              loading ||
              selectedCategoryIds.length === 0 ||
              selectedTestIds.length === 0 ||
              fetchingTests ||
              questionCount > totalAvailableQuestions
            }
            className="w-full sm:w-auto px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-[#118B50] to-[#5DB996] text-white rounded-xl font-semibold hover:from-[#0A6B3B] hover:to-[#4A9B7E] transition-all duration-300 disabled:opacity-50"
          >
            {loading ? (
              <div className="flex items-center justify-center space-x-2">
                <LoadingSpinner />
                <span>{t("generating_test")}</span>
              </div>
            ) : (
              t("create_test")
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
