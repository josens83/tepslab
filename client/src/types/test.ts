export interface Question {
  _id: string;
  questionNumber: number;
  questionType: 'grammar' | 'vocabulary' | 'listening' | 'reading';
  questionText: string;
  options: string[];
  difficulty: 'easy' | 'medium' | 'hard';
  audioUrl?: string;
  imageUrl?: string;
}

export interface Test {
  _id: string;
  title: string;
  description: string;
  testType: 'diagnostic' | 'practice' | 'mock';
  targetScore: number;
  duration: number;
  totalQuestions: number;
  passingScore: number;
  questions?: Question[];
}

export interface ScoreBreakdown {
  grammar: { correct: number; total: number };
  vocabulary: { correct: number; total: number };
  listening: { correct: number; total: number };
  reading: { correct: number; total: number };
}

export interface TestResult {
  _id: string;
  userId: string;
  testId: string | Test;
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  scoreBreakdown: ScoreBreakdown;
  estimatedScore: number;
  timeSpent: number;
  isPassed: boolean;
  completedAt: string;
  answers?: AnswerDetail[];
}

export interface AnswerDetail {
  questionId: string;
  questionNumber: number;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent?: number;
  questionText?: string;
  options?: string[];
  explanation?: string;
  questionType?: string;
}

export interface UserAnswer {
  questionId: string;
  answer: number;
  timeSpent?: number;
}
