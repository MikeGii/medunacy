// src/utils/examParser.ts (updated with preview functionality)

import { ExamQuestion, ExamOption } from "@/types/exam";

export function parseExamFile(content: string, year: number): ExamQuestion[] {
  const questions: ExamQuestion[] = [];

  // Split content by question marks that start new questions
  const rawQuestions = content.split(/\n\?(?=\s)/);

  rawQuestions.forEach((rawQuestion, index) => {
    if (!rawQuestion.trim()) return;

    const lines = rawQuestion.trim().split("\n");
    if (lines.length < 2) return;

    // First line is the question text
    const questionText = lines[0].trim();

    // Rest are options
    const options: ExamOption[] = [];

    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      // Check if this is a correct answer (starts with +)
      const isCorrect = line.startsWith("+");

      // Remove the + or - prefix and trim
      const optionText = line.replace(/^[+-]\s*/, "").trim();

      if (optionText) {
        options.push({
          text: optionText,
          isCorrect: isCorrect,
        });
      }
    }

    // Only add questions that have at least 2 options
    if (options.length >= 2) {
      questions.push({
        id: `${year}-${index + 1}`,
        year: year,
        questionText: questionText,
        options: options,
      });
    }
  });

  return questions;
}

// Enhanced validation with detailed reporting
export interface ValidationResult {
  question: ExamQuestion;
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export interface ParsePreview {
  year: number;
  totalQuestions: number;
  validQuestions: number;
  invalidQuestions: number;
  validationResults: ValidationResult[];
  summary: {
    questionsWithNoCorrectAnswer: number;
    questionsWithMultipleCorrectAnswers: number;
    questionsWithTooFewOptions: number;
    questionsWithWarnings: number;
  };
}

export function validateQuestionsWithDetails(
  questions: ExamQuestion[]
): ValidationResult[] {
  return questions.map((question) => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check correct answers count
    const correctAnswers = question.options.filter(
      (opt) => opt.isCorrect
    ).length;

    if (correctAnswers === 0) {
      errors.push("No correct answer marked");
    } else if (correctAnswers > 1) {
      errors.push(`Multiple correct answers marked (${correctAnswers})`);
    }

    // Check options count
    if (question.options.length < 2) {
      errors.push(`Only ${question.options.length} option(s) found`);
    } else if (question.options.length > 6) {
      warnings.push(
        `Unusually high number of options (${question.options.length})`
      );
    }

    // Check question text
    if (question.questionText.length < 10) {
      warnings.push("Question text seems too short");
    }

    // Check for empty options
    const emptyOptions = question.options.filter(
      (opt) => !opt.text.trim()
    ).length;
    if (emptyOptions > 0) {
      errors.push(`${emptyOptions} empty option(s) found`);
    }

    // Check for duplicate options
    const optionTexts = question.options.map((opt) => opt.text.toLowerCase());
    const duplicates = optionTexts.filter(
      (text, index) => optionTexts.indexOf(text) !== index
    );
    if (duplicates.length > 0) {
      warnings.push("Duplicate options detected");
    }

    return {
      question,
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  });
}

export function generateParsePreview(
  questions: ExamQuestion[],
  year: number
): ParsePreview {
  const validationResults = validateQuestionsWithDetails(questions);

  const validQuestions = validationResults.filter((r) => r.isValid);
  const invalidQuestions = validationResults.filter((r) => !r.isValid);

  const summary = {
    questionsWithNoCorrectAnswer: validationResults.filter((r) =>
      r.errors.includes("No correct answer marked")
    ).length,
    questionsWithMultipleCorrectAnswers: validationResults.filter((r) =>
      r.errors.some((e) => e.includes("Multiple correct answers"))
    ).length,
    questionsWithTooFewOptions: validationResults.filter((r) =>
      r.errors.some((e) => e.includes("option(s) found"))
    ).length,
    questionsWithWarnings: validationResults.filter(
      (r) => r.warnings.length > 0
    ).length,
  };

  return {
    year,
    totalQuestions: questions.length,
    validQuestions: validQuestions.length,
    invalidQuestions: invalidQuestions.length,
    validationResults,
    summary,
  };
}

// Function to format preview for display
export function formatPreviewForDisplay(preview: ParsePreview): string {
  const lines: string[] = [];

  lines.push(`=== EXAM YEAR ${preview.year} PARSE PREVIEW ===`);
  lines.push(`Total Questions Parsed: ${preview.totalQuestions}`);
  lines.push(`✅ Valid Questions: ${preview.validQuestions}`);
  lines.push(`❌ Invalid Questions: ${preview.invalidQuestions}`);
  lines.push(
    `⚠️  Questions with Warnings: ${preview.summary.questionsWithWarnings}`
  );
  lines.push("");

  if (preview.invalidQuestions > 0) {
    lines.push("=== VALIDATION ERRORS ===");
    preview.validationResults
      .filter((r) => !r.isValid)
      .forEach((result, index) => {
        lines.push(
          `\nQuestion ${index + 1}: "${result.question.questionText.substring(
            0,
            50
          )}..."`
        );
        result.errors.forEach((error) => lines.push(`  ❌ ${error}`));
      });
  }

  if (preview.summary.questionsWithWarnings > 0) {
    lines.push("\n=== WARNINGS ===");
    preview.validationResults
      .filter((r) => r.warnings.length > 0)
      .forEach((result, index) => {
        lines.push(
          `\nQuestion ${index + 1}: "${result.question.questionText.substring(
            0,
            50
          )}..."`
        );
        result.warnings.forEach((warning) => lines.push(`  ⚠️  ${warning}`));
      });
  }

  return lines.join("\n");
}

export async function importQuestionsToDatabase(
  questions: ExamQuestion[]
): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch("/api/exam/import-questions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ questions }),
    });

    if (!response.ok) {
      throw new Error("Failed to import questions");
    }

    return { success: true };
  } catch (error) {
    console.error("Error importing questions:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
