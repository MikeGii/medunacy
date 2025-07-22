// src/components/admin/ImportExamQuestions.tsx

"use client";

import { useState } from "react";
import {
  parseExamFile,
  generateParsePreview,
  importQuestionsToDatabase,
  ParsePreview,
} from "@/utils/examParser";
import ExamParsePreview from "@/components/exam-tests/ExamParsePreview";

export default function ImportExamQuestions() {
  const [fileContent, setFileContent] = useState("");
  const [year, setYear] = useState(2017);
  const [preview, setPreview] = useState<ParsePreview | null>(null);
  const [importing, setImporting] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(file);
    }
  };

  const handlePreview = () => {
    if (fileContent) {
      const questions = parseExamFile(fileContent, year);
      const previewData = generateParsePreview(questions, year);
      setPreview(previewData);
    }
  };

  const handleImport = async () => {
    if (!preview) return;

    setImporting(true);
    const validQuestions = preview.validationResults
      .filter((r) => r.isValid)
      .map((r) => r.question);

    const result = await importQuestionsToDatabase(validQuestions);

    if (result.success) {
      alert("Questions imported successfully!");
      setPreview(null);
      setFileContent("");
    } else {
      alert(`Import failed: ${result.error}`);
    }

    setImporting(false);
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Import Exam Questions</h1>

      {!preview && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Year</label>
            <select
              value={year}
              onChange={(e) => setYear(parseInt(e.target.value))}
              className="w-full p-2 border rounded"
            >
              <option value={2017}>2017</option>
              <option value={2018}>2018</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Upload Question File
            </label>
            <input
              type="file"
              accept=".txt"
              onChange={handleFileUpload}
              className="w-full p-2 border rounded"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Or Paste Content
            </label>
            <textarea
              value={fileContent}
              onChange={(e) => setFileContent(e.target.value)}
              className="w-full h-64 p-2 border rounded font-mono text-sm"
              placeholder="Paste exam questions here..."
            />
          </div>

          <button
            onClick={handlePreview}
            disabled={!fileContent}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Preview Import
          </button>
        </div>
      )}

      {preview && (
        <ExamParsePreview
          preview={preview}
          onImport={handleImport}
          onCancel={() => setPreview(null)}
        />
      )}
    </div>
  );
}
