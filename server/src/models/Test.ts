import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion {
  _id: mongoose.Types.ObjectId;
  questionNumber: number;
  questionType: 'grammar' | 'vocabulary' | 'listening' | 'reading';
  questionText: string;
  options: string[];
  correctAnswer: number; // 0-3 index
  explanation?: string;
  difficulty: 'easy' | 'medium' | 'hard';
  audioUrl?: string; // For listening questions
  imageUrl?: string;
}

export interface ITest extends Document {
  _id: mongoose.Types.ObjectId;
  title: string;
  description: string;
  testType: 'diagnostic' | 'practice' | 'mock';
  targetScore: number;
  duration: number; // in minutes
  questions: IQuestion[];
  totalQuestions: number;
  passingScore: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  questionNumber: {
    type: Number,
    required: true,
  },
  questionType: {
    type: String,
    enum: ['grammar', 'vocabulary', 'listening', 'reading'],
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: (v: string[]) => v.length === 4,
      message: 'Options must have exactly 4 choices',
    },
  },
  correctAnswer: {
    type: Number,
    required: true,
    min: 0,
    max: 3,
  },
  explanation: String,
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium',
  },
  audioUrl: String,
  imageUrl: String,
});

const testSchema = new Schema<ITest>(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    testType: {
      type: String,
      enum: ['diagnostic', 'practice', 'mock'],
      default: 'diagnostic',
    },
    targetScore: {
      type: Number,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
      default: 30, // 30 minutes default
    },
    questions: [questionSchema],
    totalQuestions: {
      type: Number,
      required: true,
    },
    passingScore: {
      type: Number,
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
testSchema.index({ testType: 1, isActive: 1 });
testSchema.index({ targetScore: 1 });

export const Test = mongoose.model<ITest>('Test', testSchema);
