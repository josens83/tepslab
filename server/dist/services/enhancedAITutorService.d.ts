import { IAITutorSession, SessionType } from '../models/AITutorSession';
import { ILearningCoachSession, CoachingType, CoachingInsight, MotivationBoost } from '../models/LearningCoachSession';
/**
 * Enhanced AI Tutor Response
 */
export interface EnhancedTutorResponse {
    message: string;
    suggestions: string[];
    relatedTopics: string[];
    sentimentScore: number;
    recommendedActions: {
        type: 'practice' | 'review' | 'rest' | 'seek_help';
        description: string;
    }[];
    motivationalBoost?: string;
}
/**
 * Coaching Report
 */
export interface CoachingReport {
    period: string;
    summary: string;
    insights: CoachingInsight[];
    achievements: string[];
    challenges: string[];
    recommendations: string[];
    actionPlan: string[];
    motivationScore: number;
    nextSteps: string[];
}
/**
 * Enhanced AI Tutor Service
 * 24/7 AI Learning Assistant with advanced coaching capabilities
 */
export declare class EnhancedAITutorService {
    /**
     * Start a new tutor session
     */
    static startSession(userId: string, sessionType?: SessionType): Promise<IAITutorSession>;
    /**
     * Generate welcome message based on session type and user context
     */
    private static generateWelcomeMessage;
    /**
     * Chat with AI tutor (context-aware conversation)
     */
    static chat(sessionId: string, userMessage: string): Promise<EnhancedTutorResponse>;
    /**
     * Get system prompt based on session type
     */
    private static getSystemPrompt;
    /**
     * Analyze sentiment of user message
     */
    private static analyzeSentiment;
    /**
     * Extract suggestions from AI response
     */
    private static extractSuggestions;
    /**
     * Extract related topics
     */
    private static extractRelatedTopics;
    /**
     * Generate recommended actions based on context
     */
    private static generateRecommendedActions;
    /**
     * Generate motivational boost
     */
    private static generateMotivationalBoost;
    /**
     * End session
     */
    static endSession(sessionId: string, userFeedback?: {
        satisfaction: number;
        helpfulness: number;
    }): Promise<void>;
    /**
     * Generate weekly coaching report
     */
    static generateWeeklyReport(userId: string): Promise<CoachingReport>;
    /**
     * Create coaching session
     */
    static createCoachingSession(userId: string, coachingType: CoachingType): Promise<ILearningCoachSession>;
    /**
     * Add learning habit
     */
    static addLearningHabit(userId: string, habitName: string, description: string, frequency: 'daily' | 'weekly' | 'monthly', targetDays: string[], targetTime?: string): Promise<void>;
    /**
     * Send daily motivational boost
     */
    static sendDailyMotivation(userId: string): Promise<MotivationBoost>;
}
//# sourceMappingURL=enhancedAITutorService.d.ts.map