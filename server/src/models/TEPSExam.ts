import mongoose, { Document, Schema } from 'mongoose';
import { TEPSSection } from './TEPSQuestion';

/**
 * Exam Type
 */
export enum ExamType {
  OFFICIAL_SIMULATION = 'official_simulation', // Full 135-minute exam
  SECTION_PRACTICE = 'section_practice', // Practice one section
  MICRO_LEARNING = 'micro_learning', // 5/10/15 minute sessions
  ADAPTIVE_TEST = 'adaptive_test', // Adaptive difficulty
  MOCK_TEST = 'mock_test', // Full mock exam with scoring
}

/**
 * Exam Difficulty
 */
export enum ExamDifficulty {
  BEGINNER = 'beginner', // Target 200-300
  INTERMEDIATE = 'intermediate', // Target 300-400
  ADVANCED = 'advanced', // Target 400-500
  EXPERT = 'expert', // Target 500-600
  ADAPTIVE = 'adaptive', // Adjusts to user level
}

/**
 * Exam Status
 */
export enum ExamStatus {
  NOT_STARTED = 'not_started',
  IN_PROGRESS = 'in_progress',
  PAUSED = 'paused',
  COMPLETED = 'completed',
  ABANDONED = 'abandoned',
  EXPIRED = 'expired',
}

/**
 * Section Configuration
 */
export interface SectionConfig {
  section: TEPSSection;
  questionCount: number;
  timeLimit: number; // in minutes
  questions: mongoose.Types.ObjectId[]; // TEPSQuestion IDs
}

/**
 * Exam Configuration
 */
export interface IExamConfig {
  // Basic Info
  name: string;
  description: string;
  examType: ExamType;
  difficulty: ExamDifficulty;

  // Timing
  totalTimeLimit: number; // in minutes
  timePerSection: boolean; // true = separate timer per section
  allowPause: boolean;
  maxPauseDuration?: number; // in minutes

  // Sections
  sections: SectionConfig[];

  // Rules
  allowReview: boolean; // Can go back to previous questions
  shuffleQuestions: boolean;
  shuffleOptions: boolean;
  showTimer: boolean;
  autoSubmit: boolean; // Auto-submit when time expires

  // Scoring
  showScoreImmediately: boolean;
  showCorrectAnswers: boolean;
  showExplanations: boolean;

  // Official Exam Simulation
  isOfficialFormat: boolean; // Mimics official TEPS format exactly
  examDate?: Date; // For scheduled mock exams
}

/**
 * User Answer
 */
export interface UserAnswer {
  questionId: mongoose.Types.ObjectId;
  section: TEPSSection;
  selectedAnswer: 'A' | 'B' | 'C' | 'D';
  timeSpent: number; // in seconds
  isCorrect?: boolean;
  markedForReview: boolean;
  answeredAt: Date;
}

/**
 * Section Result
 */
export interface SectionResult {
  section: TEPSSection;
  correctAnswers: number;
  totalQuestions: number;
  accuracy: number; // percentage
  timeSpent: number; // in seconds
  score: number; // Section score
  percentile?: number; // Compared to other test takers
}

/**
 * Exam Result
 */
export interface IExamResult {
  // Overall Score
  totalScore: number; // 0-600 for TEPS
  percentile: number; // Compared to all test takers
  estimatedLevel: string; // CEFR level or description

  // Section Results
  sectionResults: SectionResult[];

  // Time Analytics
  totalTimeSpent: number; // in seconds
  averageTimePerQuestion: number; // in seconds

  // Performance Analytics
  strengths: string[]; // Topics where user performed well
  weaknesses: string[]; // Topics needing improvement
  recommendations: string[]; // Study recommendations

  // IRT Metrics
  finalAbility: number; // Theta parameter after exam
  abilityChange: number; // Change from initial ability
  measurementError: number; // Standard error of measurement

  // Comparison
  comparedToAverage: number; // How much above/below average
  scoreDistribution: {
    range: string; // e.g., "500-510"
    percentage: number; // % of test takers in this range
  }[];
}

/**
 * TEPS Exam Attempt Document
 */
export interface ITEPSExamAttempt extends Document {
  userId: mongoose.Types.ObjectId;
  examConfigId: mongoose.Types.ObjectId;

  // Exam Info
  examType: ExamType;
  difficulty: ExamDifficulty;
  status: ExamStatus;

  // Timing
  startedAt?: Date;
  completedAt?: Date;
  pausedAt?: Date;
  totalPausedTime: number; // in seconds
  expiresAt?: Date;

  // Answers
  answers: UserAnswer[];
  currentQuestionIndex: number;
  currentSection: TEPSSection;

  // Results (populated after completion)
  result?: IExamResult;

  // Metadata
  ipAddress?: string;
  userAgent?: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';

  // Anti-Cheating
  tabSwitches: number; // Number of times user switched tabs
  fullscreenExits: number; // Number of times user exited fullscreen
  suspiciousActivity: boolean;
  proctoring?: {
    webcamEnabled: boolean;
    faceDetected: boolean;
    multipleFacesDetected: boolean;
    recordingUrl?: string;
  };

  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateResult(): Promise<IExamResult>;
  submitAnswer(questionId: string, answer: string, timeSpent: number): Promise<void>;
  pauseExam(): Promise<void>;
  resumeExam(): Promise<void>;
  completeExam(): Promise<void>;
}

const sectionConfigSchema = new Schema<SectionConfig>(
  {
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    questionCount: {
      type: Number,
      required: true,
      min: 1,
    },
    timeLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    questions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TEPSQuestion',
      },
    ],
  },
  { _id: false }
);

const userAnswerSchema = new Schema<UserAnswer>(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: 'TEPSQuestion',
      required: true,
    },
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    selectedAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    isCorrect: Boolean,
    markedForReview: {
      type: Boolean,
      default: false,
    },
    answeredAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const sectionResultSchema = new Schema<SectionResult>(
  {
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    correctAnswers: {
      type: Number,
      required: true,
      min: 0,
    },
    totalQuestions: {
      type: Number,
      required: true,
      min: 1,
    },
    accuracy: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    timeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
    },
    percentile: Number,
  },
  { _id: false }
);

const examResultSchema = new Schema<IExamResult>(
  {
    totalScore: {
      type: Number,
      required: true,
      min: 0,
      max: 600,
    },
    percentile: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    estimatedLevel: {
      type: String,
      required: true,
    },
    sectionResults: [sectionResultSchema],
    totalTimeSpent: {
      type: Number,
      required: true,
      min: 0,
    },
    averageTimePerQuestion: {
      type: Number,
      required: true,
      min: 0,
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    finalAbility: {
      type: Number,
      required: true,
      min: -3,
      max: 3,
    },
    abilityChange: {
      type: Number,
      required: true,
    },
    measurementError: {
      type: Number,
      required: true,
      min: 0,
    },
    comparedToAverage: {
      type: Number,
      required: true,
    },
    scoreDistribution: [
      {
        range: String,
        percentage: Number,
      },
    ],
  },
  { _id: false }
);

const proctoringSchema = new Schema(
  {
    webcamEnabled: { type: Boolean, default: false },
    faceDetected: { type: Boolean, default: false },
    multipleFacesDetected: { type: Boolean, default: false },
    recordingUrl: String,
  },
  { _id: false }
);

const tepsExamAttemptSchema = new Schema<ITEPSExamAttempt>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    examConfigId: {
      type: Schema.Types.ObjectId,
      ref: 'TEPSExamConfig',
      required: true,
    },
    examType: {
      type: String,
      enum: Object.values(ExamType),
      required: true,
      index: true,
    },
    difficulty: {
      type: String,
      enum: Object.values(ExamDifficulty),
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(ExamStatus),
      default: ExamStatus.NOT_STARTED,
      index: true,
    },
    startedAt: Date,
    completedAt: Date,
    pausedAt: Date,
    totalPausedTime: {
      type: Number,
      default: 0,
      min: 0,
    },
    expiresAt: Date,
    answers: {
      type: [userAnswerSchema],
      default: [],
    },
    currentQuestionIndex: {
      type: Number,
      default: 0,
      min: 0,
    },
    currentSection: {
      type: String,
      enum: Object.values(TEPSSection),
    },
    result: examResultSchema,
    ipAddress: String,
    userAgent: String,
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile'],
      default: 'desktop',
    },
    tabSwitches: {
      type: Number,
      default: 0,
      min: 0,
    },
    fullscreenExits: {
      type: Number,
      default: 0,
      min: 0,
    },
    suspiciousActivity: {
      type: Boolean,
      default: false,
    },
    proctoring: proctoringSchema,
  },
  {
    timestamps: true,
  }
);

// Indexes
tepsExamAttemptSchema.index({ userId: 1, status: 1 });
tepsExamAttemptSchema.index({ userId: 1, examType: 1 });
tepsExamAttemptSchema.index({ completedAt: -1 });
tepsExamAttemptSchema.index({ 'result.totalScore': -1 });

/**
 * Submit an answer
 */
tepsExamAttemptSchema.methods.submitAnswer = async function (
  questionId: string,
  answer: string,
  timeSpent: number
): Promise<void> {
  const TEPSQuestion = mongoose.model('TEPSQuestion');
  const question = await TEPSQuestion.findById(questionId);

  if (!question) {
    throw new Error('Question not found');
  }

  const isCorrect = answer === question.correctAnswer;

  const userAnswer: UserAnswer = {
    questionId: new mongoose.Types.ObjectId(questionId),
    section: question.section,
    selectedAnswer: answer as 'A' | 'B' | 'C' | 'D',
    timeSpent,
    isCorrect,
    markedForReview: false,
    answeredAt: new Date(),
  };

  // Check if answer already exists for this question
  const existingIndex = this.answers.findIndex(
    (a: UserAnswer) => a.questionId.toString() === questionId
  );

  if (existingIndex !== -1) {
    // Update existing answer
    this.answers[existingIndex] = userAnswer;
  } else {
    // Add new answer
    this.answers.push(userAnswer);
  }

  await this.save();
};

/**
 * Pause exam
 */
tepsExamAttemptSchema.methods.pauseExam = async function (): Promise<void> {
  if (this.status !== ExamStatus.IN_PROGRESS) {
    throw new Error('Can only pause an in-progress exam');
  }

  this.status = ExamStatus.PAUSED;
  this.pausedAt = new Date();
  await this.save();
};

/**
 * Resume exam
 */
tepsExamAttemptSchema.methods.resumeExam = async function (): Promise<void> {
  if (this.status !== ExamStatus.PAUSED) {
    throw new Error('Can only resume a paused exam');
  }

  if (this.pausedAt) {
    const pausedDuration = (Date.now() - this.pausedAt.getTime()) / 1000;
    this.totalPausedTime += pausedDuration;
  }

  this.status = ExamStatus.IN_PROGRESS;
  this.pausedAt = undefined;
  await this.save();
};

/**
 * Complete exam
 */
tepsExamAttemptSchema.methods.completeExam = async function (): Promise<void> {
  this.status = ExamStatus.COMPLETED;
  this.completedAt = new Date();

  // Calculate result
  this.result = await this.calculateResult();

  await this.save();
};

/**
 * Calculate exam result
 */
tepsExamAttemptSchema.methods.calculateResult = async function (): Promise<IExamResult> {
  const TEPSExamConfig = mongoose.model('TEPSExamConfig');
  const config = await TEPSExamConfig.findById(this.examConfigId);

  if (!config) {
    throw new Error('Exam config not found');
  }

  // Calculate section results
  const sectionResults: SectionResult[] = [];

  for (const sectionConfig of config.sections) {
    const sectionAnswers = this.answers.filter(
      (a: UserAnswer) => a.section === sectionConfig.section
    );

    const correctAnswers = sectionAnswers.filter((a: UserAnswer) => a.isCorrect).length;
    const totalQuestions = sectionConfig.questionCount;
    const accuracy = (correctAnswers / totalQuestions) * 100;
    const timeSpent = sectionAnswers.reduce((sum: number, a: UserAnswer) => sum + a.timeSpent, 0);

    // Calculate section score (0-150 for each section in TEPS)
    const sectionScore = Math.round((correctAnswers / totalQuestions) * 150);

    sectionResults.push({
      section: sectionConfig.section,
      correctAnswers,
      totalQuestions,
      accuracy,
      timeSpent,
      score: sectionScore,
    });
  }

  // Calculate total score (sum of all sections)
  const totalScore = sectionResults.reduce((sum, sr) => sum + sr.score, 0);

  // Calculate total time spent
  const totalTimeSpent = this.answers.reduce(
    (sum: number, a: UserAnswer) => sum + a.timeSpent,
    0
  );
  const averageTimePerQuestion = totalTimeSpent / this.answers.length;

  // Calculate ability (IRT theta)
  const finalAbility = (totalScore - 300) / 100;

  // Estimate CEFR level
  let estimatedLevel = '';
  if (totalScore < 200) estimatedLevel = 'A1-A2 (Elementary)';
  else if (totalScore < 300) estimatedLevel = 'A2-B1 (Pre-Intermediate)';
  else if (totalScore < 400) estimatedLevel = 'B1-B2 (Intermediate)';
  else if (totalScore < 500) estimatedLevel = 'B2-C1 (Upper Intermediate)';
  else estimatedLevel = 'C1-C2 (Advanced)';

  // Identify strengths and weaknesses
  const strengths: string[] = [];
  const weaknesses: string[] = [];

  sectionResults.forEach((sr) => {
    if (sr.accuracy >= 80) {
      strengths.push(`Strong performance in ${sr.section} (${sr.accuracy.toFixed(1)}%)`);
    } else if (sr.accuracy < 60) {
      weaknesses.push(`Needs improvement in ${sr.section} (${sr.accuracy.toFixed(1)}%)`);
    }
  });

  // Generate recommendations
  const recommendations: string[] = [];
  if (weaknesses.length > 0) {
    recommendations.push('Focus on weak areas with targeted practice');
    recommendations.push('Review explanations for incorrect answers');
  }
  if (totalScore < 400) {
    recommendations.push('Increase daily study time to 60+ minutes');
  }
  recommendations.push('Take regular mock exams to track progress');

  return {
    totalScore,
    percentile: 50, // TODO: Calculate from all test takers
    estimatedLevel,
    sectionResults,
    totalTimeSpent,
    averageTimePerQuestion,
    strengths,
    weaknesses,
    recommendations,
    finalAbility,
    abilityChange: 0, // TODO: Calculate from user profile
    measurementError: 0.3, // TODO: Calculate from IRT
    comparedToAverage: totalScore - 300,
    scoreDistribution: [], // TODO: Calculate from all test takers
  };
};

export const TEPSExamAttempt = mongoose.model<ITEPSExamAttempt>(
  'TEPSExamAttempt',
  tepsExamAttemptSchema
);
