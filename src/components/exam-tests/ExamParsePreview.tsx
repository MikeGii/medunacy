// src/components/exam-tests/ExamParsePreview.tsx

"use client";

import { useState } from "react";
import { ParsePreview, ValidationResult } from "@/utils/examParser";

interface ExamParsePreviewProps {
  preview: ParsePreview;
  onImport: () => void;
  onCancel: () => void;
}

export default function ExamParsePreview({
  preview,
  onImport,
  onCancel,
}: ExamParsePreviewProps) {
  const [showDetails, setShowDetails] = useState(false);
  const [filterType, setFilterType] = useState<
    "all" | "valid" | "invalid" | "warnings"
  >("all");

  const filteredResults = preview.validationResults.filter((result) => {
    switch (filterType) {
      case "valid":
        return result.isValid && result.warnings.length === 0;
      case "invalid":
        return !result.isValid;
      case "warnings":
        return result.warnings.length > 0;
      default:
        return true;
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-semibold mb-4">
        Parse Preview - Year {preview.year}
      </h2>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-gray-100 p-4 rounded">
          <div className="text-sm text-gray-600">Total Questions</div>
          <div className="text-2xl font-bold">{preview.totalQuestions}</div>
        </div>
        <div className="bg-green-100 p-4 rounded">
          <div className="text-sm text-green-600">Valid</div>
          <div className="text-2xl font-bold text-green-700">
            {preview.validQuestions}
          </div>
        </div>
        <div className="bg-red-100 p-4 rounded">
          <div className="text-sm text-red-600">Invalid</div>
          <div className="text-2xl font-bold text-red-700">
            {preview.invalidQuestions}
          </div>
        </div>
        <div className="bg-yellow-100 p-4 rounded">
          <div className="text-sm text-yellow-600">Warnings</div>
          <div className="text-2xl font-bold text-yellow-700">
            {preview.summary.questionsWithWarnings}
          </div>
        </div>
      </div>

      {/* Error Summary */}
      {preview.invalidQuestions > 0 && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded">
          <h3 className="font-semibold text-red-800 mb-2">Validation Issues</h3>
          <ul className="space-y-1 text-sm text-red-700">
            {preview.summary.questionsWithNoCorrectAnswer > 0 && (
              <li>
                • {preview.summary.questionsWithNoCorrectAnswer} questions with
                no correct answer
              </li>
            )}
            {preview.summary.questionsWithMultipleCorrectAnswers > 0 && (
              <li>
                • {preview.summary.questionsWithMultipleCorrectAnswers}{" "}
                questions with multiple correct answers
              </li>
            )}
            {preview.summary.questionsWithTooFewOptions > 0 && (
              <li>
                • {preview.summary.questionsWithTooFewOptions} questions with
                too few options
              </li>
            )}
          </ul>
        </div>
      )}

      {/* Filter Buttons */}
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setShowDetails(!showDetails)}
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
        >
          {showDetails ? "Hide" : "Show"} Details
        </button>

        {showDetails && (
          <>
            <button
              onClick={() => setFilterType("all")}
              className={`px-4 py-2 rounded ${
                filterType === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
              }`}
            >
              All ({preview.totalQuestions})
            </button>
            <button
              onClick={() => setFilterType("valid")}
              className={`px-4 py-2 rounded ${
                filterType === "valid"
                  ? "bg-green-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Valid ({preview.validQuestions})
            </button>
            <button
              onClick={() => setFilterType("invalid")}
              className={`px-4 py-2 rounded ${
                filterType === "invalid"
                  ? "bg-red-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Invalid ({preview.invalidQuestions})
            </button>
            <button
              onClick={() => setFilterType("warnings")}
              className={`px-4 py-2 rounded ${
                filterType === "warnings"
                  ? "bg-yellow-500 text-white"
                  : "bg-gray-200"
              }`}
            >
              Warnings ({preview.summary.questionsWithWarnings})
            </button>
          </>
        )}
      </div>

      {/* Detailed Question List */}
      {showDetails && (
        <div className="max-h-96 overflow-y-auto border rounded p-4 mb-6">
          {filteredResults.map((result, index) => (
            <div
              key={index}
              className={`mb-4 p-3 rounded ${
                !result.isValid
                  ? "bg-red-50 border border-red-200"
                  : result.warnings.length > 0
                  ? "bg-yellow-50 border border-yellow-200"
                  : "bg-green-50 border border-green-200"
              }`}
            >
              <div className="font-medium mb-1">
                Question {result.question.id}: {result.question.questionText}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                Options: {result.question.options.length}
              </div>

              {result.errors.length > 0 && (
                <div className="text-sm text-red-600">
                  {result.errors.map((error, i) => (
                    <div key={i}>❌ {error}</div>
                  ))}
                </div>
              )}

              {result.warnings.length > 0 && (
                <div className="text-sm text-yellow-600">
                  {result.warnings.map((warning, i) => (
                    <div key={i}>⚠️ {warning}</div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex justify-end gap-4">
        <button
          onClick={onCancel}
          className="px-6 py-2 border border-gray-300 rounded hover:bg-gray-100"
        >
          Cancel
        </button>
        <button
          onClick={onImport}
          disabled={preview.validQuestions === 0}
          className={`px-6 py-2 rounded text-white ${
            preview.validQuestions > 0
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-400 cursor-not-allowed"
          }`}
        >
          Import {preview.validQuestions} Valid Questions
        </button>
      </div>
    </div>
  );
}
