import mongoose, { Document, Schema } from 'mongoose';
import { TEPSSection } from './TEPSQuestion';

/**
 * Message Role
 */
export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

/**
 * Session Type
 */
export enum SessionType {
  GENERAL_QA = 'general_qa', // General questions
  PROBLEM_EXPLANATION = 'problem_explanation', // Specific question help
  STUDY_COACHING = 'study_coaching', // Learning strategy advice
  MOTIVATION = 'motivation', // Motivation and encouragement
  GOAL_SETTING = 'goal_setting', // Setting learning goals
  PROGRESS_REVIEW = 'progress_review', // Reviewing progress
}

/**
 * Chat Message
 */
export interface ChatMessage {
  role: MessageRole;
  content: string;
  timestamp: Date;
  metadata?: {
    questionId?: string;
    section?: TEPSSection;
    relatedTopics?: string[];
    sentimentScore?: number; // -1 to 1 (negative to positive)
  };
}

/**
 * Session Metrics
 */
export interface SessionMetrics {
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  averageResponseTime: number; // in seconds
  userSatisfaction?: number; // 1-5 rating
  helpfulness?: number; // 1-5 rating
  resolved: boolean;
}

/**
 * AI Tutor Session Document
 */
export interface IAITutorSession extends Document {
  userId: mongoose.Types.ObjectId;
  sessionType: SessionType;

  // Conversation
  messages: ChatMessage[];
  context?: {
    currentGoal?: string;
    recentActivity?: string;
    weakAreas?: string[];
    strongAreas?: string[];
    mood?: 'frustrated' | 'motivated' | 'neutral' | 'confused';
  };

  // Session Info
  startedAt: Date;
  endedAt?: Date;
  isActive: boolean;

  // Metrics
  metrics: SessionMetrics;

  // Related Content
  relatedQuestions?: mongoose.Types.ObjectId[];
  relatedExams?: mongoose.Types.ObjectId[];

  createdAt: Date;
  updatedAt: Date;

  // Methods
  addMessage(role: MessageRole, content: string, metadata?: any): Promise<void>;
  endSession(): Promise<void>;
  calculateSentiment(): string;
}

const chatMessageSchema = new Schema<ChatMessage>(
  {
    role: {
      type: String,
      enum: Object.values(MessageRole),
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      questionId: String,
      section: String,
      relatedTopics: [String],
      sentimentScore: Number,
    },
  },
  { _id: false }
);

const sessionMetricsSchema = new Schema<SessionMetrics>(
  {
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    assistantMessages: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    userSatisfaction: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 },
    resolved: { type: Boolean, default: false },
  },
  { _id: false }
);

const aiTutorSessionSchema = new Schema<IAITutorSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionType: {
      type: String,
      enum: Object.values(SessionType),
      required: true,
      index: true,
    },
    messages: {
      type: [chatMessageSchema],
      default: [],
    },
    context: {
      currentGoal: String,
      recentActivity: String,
      weakAreas: [String],
      strongAreas: [String],
      mood: {
        type: String,
        enum: ['frustrated', 'motivated', 'neutral', 'confused'],
      },
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    endedAt: Date,
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    metrics: {
      type: sessionMetricsSchema,
      default: () => ({}),
    },
    relatedQuestions: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TEPSQuestion',
      },
    ],
    relatedExams: [
      {
        type: Schema.Types.ObjectId,
        ref: 'TEPSExamAttempt',
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Indexes
aiTutorSessionSchema.index({ userId: 1, isActive: 1 });
aiTutorSessionSchema.index({ userId: 1, sessionType: 1 });
aiTutorSessionSchema.index({ startedAt: -1 });

/**
 * Add message to session
 */
aiTutorSessionSchema.methods.addMessage = async function (
  role: MessageRole,
  content: string,
  metadata?: any
): Promise<void> {
  const message: ChatMessage = {
    role,
    content,
    timestamp: new Date(),
    metadata,
  };

  this.messages.push(message);

  // Update metrics
  this.metrics.totalMessages += 1;
  if (role === MessageRole.USER) {
    this.metrics.userMessages += 1;
  } else if (role === MessageRole.ASSISTANT) {
    this.metrics.assistantMessages += 1;
  }

  await this.save();
};

/**
 * End session
 */
aiTutorSessionSchema.methods.endSession = async function (): Promise<void> {
  this.isActive = false;
  this.endedAt = new Date();

  // Calculate average response time
  let totalResponseTime = 0;
  let responseCount = 0;

  for (let i = 1; i < this.messages.length; i++) {
    if (
      this.messages[i].role === MessageRole.ASSISTANT &&
      this.messages[i - 1].role === MessageRole.USER
    ) {
      const responseTime =
        (this.messages[i].timestamp.getTime() -
          this.messages[i - 1].timestamp.getTime()) /
        1000;
      totalResponseTime += responseTime;
      responseCount += 1;
    }
  }

  if (responseCount > 0) {
    this.metrics.averageResponseTime = totalResponseTime / responseCount;
  }

  await this.save();
};

/**
 * Calculate overall sentiment of conversation
 */
aiTutorSessionSchema.methods.calculateSentiment = function (): string {
  const sentiments = this.messages
    .filter((m: ChatMessage) => m.metadata?.sentimentScore !== undefined)
    .map((m: ChatMessage) => m.metadata!.sentimentScore!);

  if (sentiments.length === 0) return 'neutral';

  const avgSentiment =
    sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;

  if (avgSentiment > 0.3) return 'positive';
  if (avgSentiment < -0.3) return 'negative';
  return 'neutral';
};

export const AITutorSession = mongoose.model<IAITutorSession>(
  'AITutorSession',
  aiTutorSessionSchema
);
