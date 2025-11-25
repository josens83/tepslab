import mongoose, { Document } from 'mongoose';
import { TEPSSection } from './TEPSQuestion';
/**
 * Message Role
 */
export declare enum MessageRole {
    USER = "user",
    ASSISTANT = "assistant",
    SYSTEM = "system"
}
/**
 * Session Type
 */
export declare enum SessionType {
    GENERAL_QA = "general_qa",// General questions
    PROBLEM_EXPLANATION = "problem_explanation",// Specific question help
    STUDY_COACHING = "study_coaching",// Learning strategy advice
    MOTIVATION = "motivation",// Motivation and encouragement
    GOAL_SETTING = "goal_setting",// Setting learning goals
    PROGRESS_REVIEW = "progress_review"
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
        sentimentScore?: number;
    };
}
/**
 * Session Metrics
 */
export interface SessionMetrics {
    totalMessages: number;
    userMessages: number;
    assistantMessages: number;
    averageResponseTime: number;
    userSatisfaction?: number;
    helpfulness?: number;
    resolved: boolean;
}
/**
 * AI Tutor Session Document
 */
export interface IAITutorSession extends Document {
    userId: mongoose.Types.ObjectId;
    sessionType: SessionType;
    messages: ChatMessage[];
    context?: {
        currentGoal?: string;
        recentActivity?: string;
        weakAreas?: string[];
        strongAreas?: string[];
        mood?: 'frustrated' | 'motivated' | 'neutral' | 'confused';
    };
    startedAt: Date;
    endedAt?: Date;
    isActive: boolean;
    metrics: SessionMetrics;
    relatedQuestions?: mongoose.Types.ObjectId[];
    relatedExams?: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
    addMessage(role: MessageRole, content: string, metadata?: any): Promise<void>;
    endSession(): Promise<void>;
    calculateSentiment(): string;
}
export declare const AITutorSession: mongoose.Model<IAITutorSession, {}, {}, {}, mongoose.Document<unknown, {}, IAITutorSession, {}, {}> & IAITutorSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=AITutorSession.d.ts.map