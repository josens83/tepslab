import mongoose, { Schema, Document } from 'mongoose';

export interface IAnswerDetail {
  questionId: mongoose.Types.ObjectId;
  questionNumber: number;
  selectedAnswer: number;
  correctAnswer: number;
  isCorrect: boolean;
  timeSpent?: number; // in seconds
}

export interface IScoreBreakdown {
  grammar: { correct: number; total: number };
  vocabulary: { correct: number; total: number };
  listening: { correct: number; total: number };
  reading: { correct: number; total: number };
}

export interface ITestResult extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  testId: mongoose.Types.ObjectId;
  answers: IAnswerDetail[];
  score: number;
  totalQuestions: number;
  correctAnswers: number;
  percentage: number;
  scoreBreakdown: IScoreBreakdown;
  estimatedScore: number; // Estimated TEPS score
  timeSpent: number; // Total time in seconds
  isPassed: boolean;
  completedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const answerDetailSchema = new Schema<IAnswerDetail>({
  questionId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
  questionNumber: {
    type: Number,
    required: true,
  },
  selectedAnswer: {
    type: Number,
    required: true,
  },
  correctAnswer: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  timeSpent: Number,
});

const scoreBreakdownSchema = new Schema({
  grammar: {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  vocabulary: {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  listening: {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
  reading: {
    correct: { type: Number, default: 0 },
    total: { type: Number, default: 0 },
  },
});

const testResultSchema = new Schema<ITestResult>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    testId: {
      type: Schema.Types.ObjectId,
      ref: 'Test',
      required: true,
    },
    answers: [answerDetailSchema],
    score: {
      type: Number,
      required: true,
    },
    totalQuestions: {
      type: Number,
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    scoreBreakdown: scoreBreakdownSchema,
    estimatedScore: {
      type: Number,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    isPassed: {
      type: Boolean,
      required: true,
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
testResultSchema.index({ userId: 1, testId: 1 });
testResultSchema.index({ userId: 1, completedAt: -1 });
testResultSchema.index({ testId: 1, score: -1 });

export const TestResult = mongoose.model<ITestResult>('TestResult', testResultSchema);
