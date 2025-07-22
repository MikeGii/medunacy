// src/types/exam.ts

export interface ExamOption {
  text: string;
  isCorrect: boolean;
}

export interface ExamQuestion {
  id: string;
  year: number;
  questionText: string;
  options: ExamOption[];
}

export interface ExamSession {
  id: string;
  userId: string;
  mode: 'training' | 'exam';
  examYear: number;
  startedAt: Date;
  completedAt?: Date;
  correctAnswers?: number;
  totalQuestions?: number;
  timeSpent?: number; // in seconds
}

export interface ExamAnswer {
  id?: string;
  sessionId: string;
  questionId: string;
  selectedOption: number;
  isCorrect: boolean;
  answeredAt?: Date;
}

export interface ExamSessionState {
  session: ExamSession;
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, number>; // questionId -> selectedOptionIndex
  markedForReview: Set<string>; // questionIds marked for review
}

export interface ExamResults {
  sessionId: string;
  totalQuestions: number;
  correctAnswers: number;
  incorrectAnswers: number;
  scorePercentage: number;
  timeSpent: number;
  questionResults: Array<{
    question: ExamQuestion;
    selectedOption: number;
    isCorrect: boolean;
  }>;
}