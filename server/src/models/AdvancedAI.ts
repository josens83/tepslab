import mongoose, { Schema, Document } from 'mongoose';

/**
 * Writing Assessment Types
 */
export enum WritingType {
  ESSAY = 'essay',
  EMAIL = 'email',
  SUMMARY = 'summary',
  DESCRIPTION = 'description',
  OPINION = 'opinion'
}

export enum AssessmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed'
}

/**
 * Writing Submission Interface
 */
export interface IWritingSubmission extends Document {
  userId: mongoose.Types.ObjectId;

  // Content
  title: string;
  content: string;
  writingType: WritingType;
  prompt?: string;

  // Assessment
  status: AssessmentStatus;
  submittedAt: Date;
  assessedAt?: Date;

  // Scores (0-100)
  scores: {
    overall: number;
    grammar: number;
    vocabulary: number;
    coherence: number;
    taskResponse: number;
  };

  // Detailed Feedback
  feedback: {
    strengths: string[];
    weaknesses: string[];
    suggestions: string[];
    grammarErrors: {
      text: string;
      correction: string;
      explanation: string;
      position: { start: number; end: number };
    }[];
    vocabularyImprovements: {
      original: string;
      suggestion: string;
      reason: string;
    }[];
  };

  // AI Analysis
  aiAnalysis: {
    model: string; // 'gpt-4', 'gpt-3.5-turbo'
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
    rawResponse?: string;
  };

  // Metadata
  wordCount: number;
  estimatedLevel: string; // 'beginner', 'intermediate', 'advanced'

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Speaking Practice Interface
 */
export enum SpeakingTaskType {
  READ_ALOUD = 'read_aloud',
  DESCRIBE_IMAGE = 'describe_image',
  ANSWER_QUESTION = 'answer_question',
  FREE_SPEAKING = 'free_speaking'
}

export interface ISpeakingPractice extends Document {
  userId: mongoose.Types.ObjectId;

  // Task
  taskType: SpeakingTaskType;
  prompt: string;
  imageUrl?: string;
  expectedText?: string; // For read_aloud type

  // Audio
  audioUrl: string;
  duration: number; // seconds

  // Transcription
  transcription?: string;
  transcriptionConfidence?: number;

  // Assessment
  status: AssessmentStatus;
  recordedAt: Date;
  assessedAt?: Date;

  // Scores
  scores: {
    overall: number;
    pronunciation: number;
    fluency: number;
    accuracy: number;
    vocabulary: number;
  };

  // Feedback
  feedback: {
    strengths: string[];
    improvements: string[];
    pronunciationIssues: {
      word: string;
      issue: string;
      suggestion: string;
    }[];
    grammarErrors: {
      text: string;
      correction: string;
    }[];
  };

  // AI Analysis
  aiAnalysis: {
    whisperModel: string;
    gptModel: string;
    transcriptionTokens: number;
    assessmentTokens: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * AI Conversation Interface
 */
export enum ConversationType {
  PRACTICE = 'practice',
  TUTORING = 'tutoring',
  ROLEPLAY = 'roleplay'
}

export interface IAIConversation extends Document {
  userId: mongoose.Types.ObjectId;

  // Conversation
  type: ConversationType;
  topic: string;
  difficulty: string; // 'easy', 'medium', 'hard'

  // Messages
  messages: {
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }[];

  // Status
  isActive: boolean;
  startedAt: Date;
  endedAt?: Date;

  // Statistics
  stats: {
    messageCount: number;
    userMessageCount: number;
    assistantMessageCount: number;
    totalTokens: number;
    duration: number; // seconds
  };

  // Feedback
  userRating?: number; // 1-5
  userFeedback?: string;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Pronunciation Assessment Interface
 */
export interface IPronunciationAssessment extends Document {
  userId: mongoose.Types.ObjectId;

  // Text and Audio
  targetText: string;
  audioUrl: string;
  duration: number;

  // Transcription
  transcribedText: string;

  // Overall Scores
  scores: {
    overall: number;
    accuracy: number;
    fluency: number;
    completeness: number;
    pronunciation: number;
  };

  // Word-level Assessment
  wordAssessments: {
    word: string;
    accuracyScore: number;
    errorType?: string; // 'omission', 'insertion', 'mispronunciation'
    feedback?: string;
  }[];

  // Phoneme-level Assessment (optional)
  phonemeAssessments?: {
    phoneme: string;
    accuracyScore: number;
    feedback?: string;
  }[];

  // Status
  status: AssessmentStatus;
  submittedAt: Date;
  assessedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Writing Submission Schema
 */
const writingSubmissionSchema = new Schema<IWritingSubmission>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    title: {
      type: String,
      required: true,
      maxlength: 200
    },
    content: {
      type: String,
      required: true,
      maxlength: 10000
    },
    writingType: {
      type: String,
      enum: Object.values(WritingType),
      required: true
    },
    prompt: String,
    status: {
      type: String,
      enum: Object.values(AssessmentStatus),
      default: AssessmentStatus.PENDING
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    assessedAt: Date,
    scores: {
      overall: { type: Number, min: 0, max: 100 },
      grammar: { type: Number, min: 0, max: 100 },
      vocabulary: { type: Number, min: 0, max: 100 },
      coherence: { type: Number, min: 0, max: 100 },
      taskResponse: { type: Number, min: 0, max: 100 }
    },
    feedback: {
      strengths: [String],
      weaknesses: [String],
      suggestions: [String],
      grammarErrors: [{
        text: String,
        correction: String,
        explanation: String,
        position: {
          start: Number,
          end: Number
        }
      }],
      vocabularyImprovements: [{
        original: String,
        suggestion: String,
        reason: String
      }]
    },
    aiAnalysis: {
      model: String,
      promptTokens: Number,
      completionTokens: Number,
      totalTokens: Number,
      rawResponse: String
    },
    wordCount: {
      type: Number,
      default: 0
    },
    estimatedLevel: String
  },
  {
    timestamps: true
  }
);

/**
 * Speaking Practice Schema
 */
const speakingPracticeSchema = new Schema<ISpeakingPractice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    taskType: {
      type: String,
      enum: Object.values(SpeakingTaskType),
      required: true
    },
    prompt: {
      type: String,
      required: true
    },
    imageUrl: String,
    expectedText: String,
    audioUrl: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    transcription: String,
    transcriptionConfidence: Number,
    status: {
      type: String,
      enum: Object.values(AssessmentStatus),
      default: AssessmentStatus.PENDING
    },
    recordedAt: {
      type: Date,
      default: Date.now
    },
    assessedAt: Date,
    scores: {
      overall: { type: Number, min: 0, max: 100 },
      pronunciation: { type: Number, min: 0, max: 100 },
      fluency: { type: Number, min: 0, max: 100 },
      accuracy: { type: Number, min: 0, max: 100 },
      vocabulary: { type: Number, min: 0, max: 100 }
    },
    feedback: {
      strengths: [String],
      improvements: [String],
      pronunciationIssues: [{
        word: String,
        issue: String,
        suggestion: String
      }],
      grammarErrors: [{
        text: String,
        correction: String
      }]
    },
    aiAnalysis: {
      whisperModel: String,
      gptModel: String,
      transcriptionTokens: Number,
      assessmentTokens: Number
    }
  },
  {
    timestamps: true
  }
);

/**
 * AI Conversation Schema
 */
const aiConversationSchema = new Schema<IAIConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(ConversationType),
      required: true
    },
    topic: {
      type: String,
      required: true
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium'
    },
    messages: [{
      role: {
        type: String,
        enum: ['user', 'assistant', 'system'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      timestamp: {
        type: Date,
        default: Date.now
      }
    }],
    isActive: {
      type: Boolean,
      default: true
    },
    startedAt: {
      type: Date,
      default: Date.now
    },
    endedAt: Date,
    stats: {
      messageCount: { type: Number, default: 0 },
      userMessageCount: { type: Number, default: 0 },
      assistantMessageCount: { type: Number, default: 0 },
      totalTokens: { type: Number, default: 0 },
      duration: { type: Number, default: 0 }
    },
    userRating: {
      type: Number,
      min: 1,
      max: 5
    },
    userFeedback: String
  },
  {
    timestamps: true
  }
);

/**
 * Pronunciation Assessment Schema
 */
const pronunciationAssessmentSchema = new Schema<IPronunciationAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    targetText: {
      type: String,
      required: true
    },
    audioUrl: {
      type: String,
      required: true
    },
    duration: {
      type: Number,
      required: true
    },
    transcribedText: String,
    scores: {
      overall: { type: Number, min: 0, max: 100 },
      accuracy: { type: Number, min: 0, max: 100 },
      fluency: { type: Number, min: 0, max: 100 },
      completeness: { type: Number, min: 0, max: 100 },
      pronunciation: { type: Number, min: 0, max: 100 }
    },
    wordAssessments: [{
      word: String,
      accuracyScore: Number,
      errorType: String,
      feedback: String
    }],
    phonemeAssessments: [{
      phoneme: String,
      accuracyScore: Number,
      feedback: String
    }],
    status: {
      type: String,
      enum: Object.values(AssessmentStatus),
      default: AssessmentStatus.PENDING
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    assessedAt: Date
  },
  {
    timestamps: true
  }
);

// Indexes
writingSubmissionSchema.index({ userId: 1, createdAt: -1 });
writingSubmissionSchema.index({ status: 1 });

speakingPracticeSchema.index({ userId: 1, createdAt: -1 });
speakingPracticeSchema.index({ status: 1 });

aiConversationSchema.index({ userId: 1, isActive: 1 });
aiConversationSchema.index({ createdAt: -1 });

pronunciationAssessmentSchema.index({ userId: 1, createdAt: -1 });
pronunciationAssessmentSchema.index({ status: 1 });

/**
 * Advanced AI Models
 */
export const WritingSubmission = mongoose.model<IWritingSubmission>(
  'WritingSubmission',
  writingSubmissionSchema
);
export const SpeakingPractice = mongoose.model<ISpeakingPractice>(
  'SpeakingPractice',
  speakingPracticeSchema
);
export const AIConversation = mongoose.model<IAIConversation>(
  'AIConversation',
  aiConversationSchema
);
export const PronunciationAssessment = mongoose.model<IPronunciationAssessment>(
  'PronunciationAssessment',
  pronunciationAssessmentSchema
);
