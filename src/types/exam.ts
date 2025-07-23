// src/types/exam.ts - COMPLETELY NEW

// ================================
// TEST CATEGORIES
// ================================
export interface TestCategory {
  id: string;
  name: string;
  description?: string;
  slug: string;
  created_by?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestCategoryCreate {
  name: string;
  description?: string;
  slug: string;
}

export interface TestCategoryUpdate {
  name?: string;
  description?: string;
  slug?: string;
  is_active?: boolean;
}

// ================================
// TESTS
// ================================
export interface Test {
  id: string;
  title: string;
  description?: string;
  category_id: string;
  created_by: string;
  is_published: boolean;
  time_limit?: number; // minutes
  passing_score: number; // percentage
  allow_multiple_attempts: boolean;
  show_correct_answers_in_training: boolean;
  created_at: string;
  updated_at: string;
  // Relations
  category?: TestCategory;
  questions?: TestQuestion[];
  question_count?: number;
}

export interface TestCreate {
  title: string;
  description?: string;
  category_id: string;
  time_limit?: number;
  passing_score?: number;
  allow_multiple_attempts?: boolean;
  show_correct_answers_in_training?: boolean;
}

export interface TestUpdate {
  title?: string;
  description?: string;
  category_id?: string;
  is_published?: boolean;
  time_limit?: number;
  passing_score?: number;
  allow_multiple_attempts?: boolean;
  show_correct_answers_in_training?: boolean;
}

// ================================
// QUESTIONS
// ================================
export interface TestQuestion {
  id: string;
  test_id: string;
  question_text: string;
  explanation?: string;
  question_order: number;
  points: number;
  created_at: string;
  updated_at: string;
  // Relations
  options: QuestionOption[];
}

export interface TestQuestionCreate {
  test_id: string;
  question_text: string;
  explanation?: string;
  question_order?: number;
  points?: number;
}

export interface TestQuestionUpdate {
  question_text?: string;
  explanation?: string;
  question_order?: number;
  points?: number;
}

// ================================
// QUESTION OPTIONS
// ================================
export interface QuestionOption {
  id: string;
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order: number;
  created_at: string;
}

export interface QuestionOptionCreate {
  question_id: string;
  option_text: string;
  is_correct: boolean;
  option_order?: number;
}

export interface QuestionOptionUpdate {
  option_text?: string;
  is_correct?: boolean;
  option_order?: number;
}

// ================================
// EXAM SESSIONS
// ================================
export interface ExamSession {
  id: string;
  user_id: string;
  test_id: string;
  mode: "training" | "exam";
  started_at: string;
  completed_at?: string;
  score_percentage?: number;
  correct_answers?: number;
  total_questions?: number;
  time_spent?: number; // seconds
  passed?: boolean;
  created_at: string;
  // Relations
  test?: Test;
  answers?: ExamAnswer[];
}

export interface ExamSessionCreate {
  test_id: string;
  mode: "training" | "exam";
}

// ================================
// EXAM ANSWERS
// ================================
export interface ExamAnswer {
  id: string;
  session_id: string;
  question_id: string;
  selected_option_ids: string[]; // Array of option IDs
  is_correct: boolean;
  points_earned: number;
  answered_at: string;
  // Relations
  question?: TestQuestion;
}

export interface ExamAnswerCreate {
  session_id: string;
  question_id: string;
  selected_option_ids: string[];
}

// ================================
// QUESTION RESULT (for display)
// ================================
export interface QuestionResult {
  question: TestQuestion;
  selectedOptions: QuestionOption[];
  correctOptions: QuestionOption[];
  isCorrect: boolean;
  pointsEarned: number;
}

// ================================
// EXAM TAKING STATE (Client-side)
// ================================
export interface ExamSessionState {
  session: ExamSession;
  test: Test;
  questions: TestQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, string[]>; // questionId -> array of selected option IDs
  markedForReview: Set<string>; // question IDs marked for review
}

// ================================
// RESULTS
// ================================
export interface ExamResults {
  sessionId: string;
  test: Test;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
  timeSpent: number; // seconds
  passed: boolean;
  questionResults: Array<{
    question: TestQuestion;
    selectedOptions: QuestionOption[];
    correctOptions: QuestionOption[];
    isCorrect: boolean;
    pointsEarned: number;
  }>;
}

// ================================
// API RESPONSE TYPES
// ================================
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: string;
}

// ================================
// FORM TYPES
// ================================
export interface QuestionFormData {
  question_text: string;
  explanation?: string;
  points: number;
  options: {
    option_text: string;
    is_correct: boolean;
  }[];
}

export interface TestFormData {
  title: string;
  description?: string;
  category_id: string;
  time_limit?: number;
  passing_score: number;
  allow_multiple_attempts: boolean;
  show_correct_answers_in_training: boolean;
}
