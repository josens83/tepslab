import mongoose, { Document, Schema } from 'mongoose';

/**
 * TEPS Question Types
 */
export enum TEPSQuestionType {
  // Part 1: Listening Comprehension
  LISTENING_SHORT_CONVERSATION = 'listening_short_conversation',
  LISTENING_LONG_CONVERSATION = 'listening_long_conversation',
  LISTENING_SHORT_TALK = 'listening_short_talk',
  LISTENING_LONG_TALK = 'listening_long_talk',

  // Part 2: Vocabulary
  VOCABULARY_DEFINITION = 'vocabulary_definition',
  VOCABULARY_CONTEXT = 'vocabulary_context',
  VOCABULARY_SYNONYM = 'vocabulary_synonym',

  // Part 3: Grammar
  GRAMMAR_ERROR_IDENTIFICATION = 'grammar_error_identification',
  GRAMMAR_BLANK_FILLING = 'grammar_blank_filling',
  GRAMMAR_SENTENCE_COMPLETION = 'grammar_sentence_completion',

  // Part 4: Reading Comprehension
  READING_MAIN_IDEA = 'reading_main_idea',
  READING_DETAIL = 'reading_detail',
  READING_INFERENCE = 'reading_inference',
  READING_VOCABULARY_IN_CONTEXT = 'reading_vocabulary_in_context',
  READING_ORGANIZATION = 'reading_organization',
}

/**
 * TEPS Section Classification
 */
export enum TEPSSection {
  LISTENING = 'listening',
  VOCABULARY = 'vocabulary',
  GRAMMAR = 'grammar',
  READING = 'reading',
}

/**
 * Difficulty Level (based on IRT)
 */
export enum DifficultyLevel {
  VERY_EASY = 1,
  EASY = 2,
  MEDIUM = 3,
  HARD = 4,
  VERY_HARD = 5,
}

/**
 * Question Statistics for IRT
 */
export interface QuestionStatistics {
  // IRT Parameters
  difficulty: number; // b parameter (-3 to +3)
  discrimination: number; // a parameter (0 to 2)
  guessing: number; // c parameter (0 to 0.25)

  // Usage Statistics
  timesUsed: number;
  timesCorrect: number;
  timesIncorrect: number;
  averageTimeSpent: number; // in seconds

  // Performance by score range
  performanceByLevel: {
    level: string; // '0-200', '201-300', etc.
    correctRate: number;
    sampleSize: number;
  }[];
}

/**
 * Audio Resource for Listening Questions
 */
export interface AudioResource {
  url: string;
  duration: number; // in seconds
  transcript: string;
  speakers: number;
  accentType: 'american' | 'british' | 'canadian' | 'australian';
}

/**
 * Reading Passage for Reading Questions
 */
export interface ReadingPassage {
  content: string;
  wordCount: number;
  readingLevel: string; // CEFR level: A1, A2, B1, B2, C1, C2
  genre: 'academic' | 'business' | 'news' | 'literature' | 'science';
  topic: string;
}

/**
 * TEPS Question Interface
 */
export interface ITEPSQuestion extends Document {
  // Basic Information
  questionType: TEPSQuestionType;
  section: TEPSSection;
  difficultyLevel: DifficultyLevel;

  // Question Content
  questionText: string;
  options: {
    A: string;
    B: string;
    C: string;
    D: string;
  };
  correctAnswer: 'A' | 'B' | 'C' | 'D';

  // Additional Resources
  audioResource?: AudioResource;
  readingPassage?: ReadingPassage;
  imageUrl?: string;

  // Educational Content
  explanation: string;
  keyPoints: string[];
  relatedConcepts: string[];
  tips: string[];

  // Metadata
  topic: string;
  subtopic?: string;
  tags: string[];
  keywords: string[];

  // Official Exam Data
  isOfficialQuestion: boolean;
  examYear?: number;
  examMonth?: number;
  officialQuestionNumber?: number;

  // IRT Statistics
  statistics: QuestionStatistics;

  // Learning Path
  prerequisiteKnowledge: string[];
  learningObjectives: string[];

  // Quality Control
  reviewStatus: 'pending' | 'approved' | 'rejected' | 'needs_revision';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  qualityScore: number; // 0-100

  // AI Generation
  isAIGenerated: boolean;
  generationMethod?: 'openai' | 'pattern_based' | 'manual';
  generatedAt?: Date;

  // Timestamps
  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateDifficulty(): number;
  updateStatistics(isCorrect: boolean, timeSpent: number, userLevel: number): Promise<void>;
  getSimilarQuestions(limit: number): Promise<ITEPSQuestion[]>;
}

const questionStatisticsSchema = new Schema<QuestionStatistics>({
  difficulty: { type: Number, default: 0, min: -3, max: 3 },
  discrimination: { type: Number, default: 1, min: 0, max: 2 },
  guessing: { type: Number, default: 0.25, min: 0, max: 0.25 },
  timesUsed: { type: Number, default: 0 },
  timesCorrect: { type: Number, default: 0 },
  timesIncorrect: { type: Number, default: 0 },
  averageTimeSpent: { type: Number, default: 0 },
  performanceByLevel: [
    {
      level: String,
      correctRate: Number,
      sampleSize: Number,
    },
  ],
}, { _id: false });

const audioResourceSchema = new Schema<AudioResource>({
  url: { type: String, required: true },
  duration: { type: Number, required: true },
  transcript: { type: String, required: true },
  speakers: { type: Number, default: 1 },
  accentType: {
    type: String,
    enum: ['american', 'british', 'canadian', 'australian'],
    default: 'american',
  },
}, { _id: false });

const readingPassageSchema = new Schema<ReadingPassage>({
  content: { type: String, required: true },
  wordCount: { type: Number, required: true },
  readingLevel: { type: String, required: true },
  genre: {
    type: String,
    enum: ['academic', 'business', 'news', 'literature', 'science'],
    required: true,
  },
  topic: { type: String, required: true },
}, { _id: false });

const tepsQuestionSchema = new Schema<ITEPSQuestion>(
  {
    questionType: {
      type: String,
      enum: Object.values(TEPSQuestionType),
      required: true,
      index: true,
    },
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
      index: true,
    },
    difficultyLevel: {
      type: Number,
      enum: Object.values(DifficultyLevel).filter((v) => typeof v === 'number'),
      required: true,
      index: true,
    },
    questionText: {
      type: String,
      required: true,
      trim: true,
    },
    options: {
      A: { type: String, required: true, trim: true },
      B: { type: String, required: true, trim: true },
      C: { type: String, required: true, trim: true },
      D: { type: String, required: true, trim: true },
    },
    correctAnswer: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    audioResource: audioResourceSchema,
    readingPassage: readingPassageSchema,
    imageUrl: String,
    explanation: {
      type: String,
      required: true,
      trim: true,
    },
    keyPoints: [String],
    relatedConcepts: [String],
    tips: [String],
    topic: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    subtopic: {
      type: String,
      trim: true,
    },
    tags: {
      type: [String],
      index: true,
    },
    keywords: [String],
    isOfficialQuestion: {
      type: Boolean,
      default: false,
      index: true,
    },
    examYear: Number,
    examMonth: Number,
    officialQuestionNumber: Number,
    statistics: {
      type: questionStatisticsSchema,
      default: () => ({}),
    },
    prerequisiteKnowledge: [String],
    learningObjectives: [String],
    reviewStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'needs_revision'],
      default: 'pending',
      index: true,
    },
    reviewedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: Date,
    qualityScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
    isAIGenerated: {
      type: Boolean,
      default: false,
    },
    generationMethod: {
      type: String,
      enum: ['openai', 'pattern_based', 'manual'],
    },
    generatedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
tepsQuestionSchema.index({ section: 1, difficultyLevel: 1 });
tepsQuestionSchema.index({ topic: 1, questionType: 1 });
tepsQuestionSchema.index({ tags: 1, difficultyLevel: 1 });
tepsQuestionSchema.index({ 'statistics.difficulty': 1 });
tepsQuestionSchema.index({ reviewStatus: 1, qualityScore: -1 });
tepsQuestionSchema.index({ createdAt: -1 });

/**
 * Calculate difficulty using IRT 3-parameter model
 */
tepsQuestionSchema.methods.calculateDifficulty = function (): number {
  const stats = this.statistics;

  if (stats.timesUsed < 10) {
    // Not enough data, use initial difficulty
    return this.difficultyLevel;
  }

  const correctRate = stats.timesCorrect / stats.timesUsed;

  // IRT difficulty parameter (b)
  // Higher b means more difficult (fewer people get it right)
  // b ranges from -3 (very easy) to +3 (very hard)
  const difficulty = -Math.log((correctRate - stats.guessing) / (1 - correctRate));

  return Math.max(-3, Math.min(3, difficulty));
};

/**
 * Update question statistics after each use
 */
tepsQuestionSchema.methods.updateStatistics = async function (
  isCorrect: boolean,
  timeSpent: number,
  userLevel: number
): Promise<void> {
  const stats = this.statistics;

  stats.timesUsed += 1;
  if (isCorrect) {
    stats.timesCorrect += 1;
  } else {
    stats.timesIncorrect += 1;
  }

  // Update average time spent (running average)
  stats.averageTimeSpent =
    (stats.averageTimeSpent * (stats.timesUsed - 1) + timeSpent) / stats.timesUsed;

  // Update performance by level
  const levelRange = this.getUserLevelRange(userLevel);
  const levelStat = stats.performanceByLevel.find((p) => p.level === levelRange);

  if (levelStat) {
    levelStat.correctRate =
      (levelStat.correctRate * levelStat.sampleSize + (isCorrect ? 1 : 0)) /
      (levelStat.sampleSize + 1);
    levelStat.sampleSize += 1;
  } else {
    stats.performanceByLevel.push({
      level: levelRange,
      correctRate: isCorrect ? 1 : 0,
      sampleSize: 1,
    });
  }

  // Recalculate IRT difficulty parameter
  stats.difficulty = this.calculateDifficulty();

  // Update discrimination parameter based on variance
  if (stats.performanceByLevel.length >= 3) {
    const rates = stats.performanceByLevel.map((p) => p.correctRate);
    const variance = this.calculateVariance(rates);
    stats.discrimination = Math.min(2, variance * 2);
  }

  await this.save();
};

/**
 * Get similar questions based on topic, type, and difficulty
 */
tepsQuestionSchema.methods.getSimilarQuestions = async function (
  limit: number = 5
): Promise<ITEPSQuestion[]> {
  const TEPSQuestion = mongoose.model<ITEPSQuestion>('TEPSQuestion');

  return await TEPSQuestion.find({
    _id: { $ne: this._id },
    section: this.section,
    questionType: this.questionType,
    difficultyLevel: {
      $gte: Math.max(1, this.difficultyLevel - 1),
      $lte: Math.min(5, this.difficultyLevel + 1),
    },
    reviewStatus: 'approved',
  })
    .limit(limit)
    .exec();
};

/**
 * Helper: Get user level range
 */
tepsQuestionSchema.methods.getUserLevelRange = function (score: number): string {
  if (score <= 200) return '0-200';
  if (score <= 300) return '201-300';
  if (score <= 400) return '301-400';
  if (score <= 500) return '401-500';
  if (score <= 600) return '501-600';
  return '601+';
};

/**
 * Helper: Calculate variance
 */
tepsQuestionSchema.methods.calculateVariance = function (values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
  return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
};

export const TEPSQuestion = mongoose.model<ITEPSQuestion>('TEPSQuestion', tepsQuestionSchema);
