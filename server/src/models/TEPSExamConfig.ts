import mongoose, { Document, Schema } from 'mongoose';
import { ExamType, ExamDifficulty, IExamConfig, SectionConfig } from './TEPSExam';

/**
 * TEPS Exam Config Document
 * Defines exam templates that can be used to create exam attempts
 */
export interface ITEPSExamConfig extends Document, IExamConfig {
  // Additional metadata
  isActive: boolean;
  isPublic: boolean;
  createdBy: mongoose.Types.ObjectId;
  usageCount: number;
  averageScore: number;
  averageCompletionTime: number;

  createdAt: Date;
  updatedAt: Date;
}

const sectionConfigSchema = new Schema<SectionConfig>(
  {
    section: {
      type: String,
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

const tepsExamConfigSchema = new Schema<ITEPSExamConfig>(
  {
    // Basic Info
    name: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
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
      index: true,
    },

    // Timing
    totalTimeLimit: {
      type: Number,
      required: true,
      min: 1,
    },
    timePerSection: {
      type: Boolean,
      default: false,
    },
    allowPause: {
      type: Boolean,
      default: false,
    },
    maxPauseDuration: Number,

    // Sections
    sections: {
      type: [sectionConfigSchema],
      required: true,
      validate: [
        (val: SectionConfig[]) => val.length > 0,
        'At least one section is required',
      ],
    },

    // Rules
    allowReview: {
      type: Boolean,
      default: true,
    },
    shuffleQuestions: {
      type: Boolean,
      default: false,
    },
    shuffleOptions: {
      type: Boolean,
      default: false,
    },
    showTimer: {
      type: Boolean,
      default: true,
    },
    autoSubmit: {
      type: Boolean,
      default: true,
    },

    // Scoring
    showScoreImmediately: {
      type: Boolean,
      default: true,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: true,
    },
    showExplanations: {
      type: Boolean,
      default: true,
    },

    // Official Exam Simulation
    isOfficialFormat: {
      type: Boolean,
      default: false,
    },
    examDate: Date,

    // Metadata
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isPublic: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    usageCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 600,
    },
    averageCompletionTime: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
tepsExamConfigSchema.index({ examType: 1, difficulty: 1, isActive: 1 });
tepsExamConfigSchema.index({ isPublic: 1, isActive: 1 });
tepsExamConfigSchema.index({ createdBy: 1 });

export const TEPSExamConfig = mongoose.model<ITEPSExamConfig>(
  'TEPSExamConfig',
  tepsExamConfigSchema
);
