import mongoose, { Document, Schema } from 'mongoose';
import { TEPSSection, DifficultyLevel } from './TEPSQuestion';

/**
 * User Learning Profile Document
 */
export interface IUserLearningProfile extends Document {
  userId: mongoose.Types.ObjectId;

  // IRT Ability Estimates
  abilityEstimates: {
    listening: number;
    vocabulary: number;
    grammar: number;
    reading: number;
    overall: number;
  };

  // Performance History (last 500 entries)
  performanceHistory: {
    section: TEPSSection;
    questionId: string;
    isCorrect: boolean;
    timeSpent: number;
    difficulty: number;
    timestamp: Date;
  }[];

  // Weak Topics
  weakTopics: {
    section: TEPSSection;
    topic: string;
    errorRate: number;
    questionAttempts: number;
  }[];

  // Strong Topics
  strongTopics: {
    section: TEPSSection;
    topic: string;
    successRate: number;
    questionAttempts: number;
  }[];

  // Learning Patterns
  learningPatterns: {
    optimalStudyTime: string;
    averageSessionDuration: number;
    preferredDifficulty: DifficultyLevel;
    learningSpeed: 'slow' | 'average' | 'fast';
    consistencyScore: number;
  };

  // Current Goal
  currentGoal?: {
    targetScore: number;
    targetDate: Date;
    recommendedDailyMinutes: number;
    progressPercentage: number;
  };

  // Timestamps
  createdAt: Date;
  updatedAt: Date;
}

const performanceHistorySchema = new Schema(
  {
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    questionId: {
      type: String,
      required: true,
    },
    isCorrect: {
      type: Boolean,
      required: true,
    },
    timeSpent: {
      type: Number,
      required: true,
    },
    difficulty: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const weakTopicSchema = new Schema(
  {
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    errorRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    questionAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const strongTopicSchema = new Schema(
  {
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    topic: {
      type: String,
      required: true,
    },
    successRate: {
      type: Number,
      required: true,
      min: 0,
      max: 1,
    },
    questionAttempts: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { _id: false }
);

const learningPatternsSchema = new Schema(
  {
    optimalStudyTime: {
      type: String,
      default: 'evening',
    },
    averageSessionDuration: {
      type: Number,
      default: 30,
    },
    preferredDifficulty: {
      type: Number,
      enum: Object.values(DifficultyLevel).filter((v) => typeof v === 'number'),
      default: DifficultyLevel.MEDIUM,
    },
    learningSpeed: {
      type: String,
      enum: ['slow', 'average', 'fast'],
      default: 'average',
    },
    consistencyScore: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false }
);

const currentGoalSchema = new Schema(
  {
    targetScore: {
      type: Number,
      required: true,
      min: 0,
      max: 600,
    },
    targetDate: {
      type: Date,
      required: true,
    },
    recommendedDailyMinutes: {
      type: Number,
      required: true,
    },
    progressPercentage: {
      type: Number,
      min: 0,
      max: 100,
      default: 0,
    },
  },
  { _id: false }
);

const userLearningProfileSchema = new Schema<IUserLearningProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    abilityEstimates: {
      listening: { type: Number, default: 0, min: -3, max: 3 },
      vocabulary: { type: Number, default: 0, min: -3, max: 3 },
      grammar: { type: Number, default: 0, min: -3, max: 3 },
      reading: { type: Number, default: 0, min: -3, max: 3 },
      overall: { type: Number, default: 0, min: -3, max: 3 },
    },
    performanceHistory: {
      type: [performanceHistorySchema],
      default: [],
    },
    weakTopics: {
      type: [weakTopicSchema],
      default: [],
    },
    strongTopics: {
      type: [strongTopicSchema],
      default: [],
    },
    learningPatterns: {
      type: learningPatternsSchema,
      default: () => ({}),
    },
    currentGoal: currentGoalSchema,
  },
  {
    timestamps: true,
  }
);

// Limit performance history to 500 entries
userLearningProfileSchema.pre('save', function (next) {
  if (this.performanceHistory.length > 500) {
    this.performanceHistory = this.performanceHistory.slice(-500);
  }
  next();
});

export const UserLearningProfile = mongoose.model<IUserLearningProfile>(
  'UserLearningProfile',
  userLearningProfileSchema
);
