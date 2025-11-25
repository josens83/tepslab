import { ITEPSQuestion, TEPSSection, DifficultyLevel } from '../models/TEPSQuestion';
/**
 * User Learning Profile
 */
export interface UserLearningProfile {
    userId: string;
    abilityEstimates: {
        listening: number;
        vocabulary: number;
        grammar: number;
        reading: number;
        overall: number;
    };
    performanceHistory: {
        section: TEPSSection;
        questionId: string;
        isCorrect: boolean;
        timeSpent: number;
        difficulty: number;
        timestamp: Date;
    }[];
    weakTopics: {
        section: TEPSSection;
        topic: string;
        errorRate: number;
        questionAttempts: number;
    }[];
    strongTopics: {
        section: TEPSSection;
        topic: string;
        successRate: number;
        questionAttempts: number;
    }[];
    learningPatterns: {
        optimalStudyTime: string;
        averageSessionDuration: number;
        preferredDifficulty: DifficultyLevel;
        learningSpeed: 'slow' | 'average' | 'fast';
        consistencyScore: number;
    };
    currentGoal?: {
        targetScore: number;
        targetDate: Date;
        recommendedDailyMinutes: number;
        progressPercentage: number;
    };
    lastUpdated: Date;
}
/**
 * Learning Recommendation
 */
export interface LearningRecommendation {
    priority: 'high' | 'medium' | 'low';
    type: 'focus_weak_area' | 'maintain_strength' | 'increase_difficulty' | 'review';
    section: TEPSSection;
    topic: string;
    message: string;
    suggestedQuestions: ITEPSQuestion[];
    estimatedTimeMinutes: number;
}
/**
 * Study Plan
 */
export interface StudyPlan {
    userId: string;
    goalScore: number;
    currentEstimatedScore: number;
    weeksToGoal: number;
    weeklyPlan: {
        week: number;
        focus: TEPSSection[];
        dailySessions: {
            day: string;
            sections: TEPSSection[];
            topics: string[];
            questionCount: number;
            estimatedMinutes: number;
        }[];
        expectedProgress: number;
    }[];
    milestones: {
        week: number;
        targetScore: number;
        description: string;
    }[];
    recommendations: LearningRecommendation[];
}
/**
 * Question Response Analysis
 */
export interface QuestionResponse {
    questionId: string;
    question: ITEPSQuestion;
    userAnswer: string;
    isCorrect: boolean;
    timeSpent: number;
    timestamp: Date;
}
/**
 * Personalized Learning Engine
 * Uses IRT and AI to create adaptive learning paths
 */
export declare class PersonalizedLearningEngine {
    /**
     * Initialize user learning profile
     */
    static initializeProfile(userId: string): Promise<UserLearningProfile>;
    /**
     * Update user profile based on question response
     * Uses IRT to estimate ability
     */
    static updateProfileWithResponse(profile: UserLearningProfile, response: QuestionResponse): Promise<UserLearningProfile>;
    /**
     * Estimate ability using IRT (Bayesian update)
     */
    private static estimateAbilityIRT;
    /**
     * Update topic-level performance tracking
     */
    private static updateTopicPerformance;
    /**
     * Update learning patterns
     */
    private static updateLearningPatterns;
    /**
     * Calculate average ability from performance history
     */
    private static calculateAverageAbility;
    /**
     * Generate personalized study plan
     */
    static generateStudyPlan(profile: UserLearningProfile, goalScore: number, targetWeeks?: number): Promise<StudyPlan>;
    /**
     * Determine focus sections for a given week
     */
    private static determineFocusSections;
    /**
     * Generate daily study sessions
     */
    private static generateDailySessions;
    /**
     * Generate personalized recommendations
     */
    private static generateRecommendations;
    /**
     * Convert ability (theta) to TEPS score
     */
    private static abilityToScore;
    /**
     * Convert TEPS score to ability (theta)
     */
    static scoreToAbility(score: number): number;
    /**
     * Get next question for user (adaptive selection)
     */
    static getNextQuestion(profile: UserLearningProfile): Promise<ITEPSQuestion | null>;
}
//# sourceMappingURL=personalizedLearningEngine.d.ts.map