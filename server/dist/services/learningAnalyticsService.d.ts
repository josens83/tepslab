import { ILearningAnalytics } from '../models/LearningAnalytics';
/**
 * Dashboard Data
 */
export interface DashboardData {
    overview: {
        currentScore: number;
        scoreChange30Days: number;
        totalStudyTime: number;
        totalQuestions: number;
        averageAccuracy: number;
        studyStreak: number;
    };
    scoreTrends: {
        dates: string[];
        scores: (number | null)[];
        prediction: (number | null)[];
    };
    sectionPerformance: {
        section: string;
        score: number;
        accuracy: number;
        rank: number;
    }[];
    peerComparison: {
        userScore: number;
        averageScore: number;
        percentile: number;
        distribution: {
            range: string;
            percentage: number;
        }[];
    };
    goals: {
        targetScore: number;
        currentScore: number;
        progress: number;
        daysRemaining: number;
        onTrack: boolean;
    }[];
    studyPatterns: {
        weekdayDistribution: {
            day: string;
            hours: number;
            productivity: number;
        }[];
        mostProductiveTime: string;
        learningVelocity: {
            questionsPerDay: number;
            scorePerWeek: number;
            daysToGoal: number;
        };
    };
    predictions: {
        predictedScore: number;
        confidenceRange: {
            lower: number;
            upper: number;
        };
        probability: number;
        recommendations: string[];
    };
    milestones: {
        type: string;
        description: string;
        date: string;
        value: number;
    }[];
}
/**
 * Learning Analytics Service
 * Comprehensive analytics calculation and dashboard generation
 */
export declare class LearningAnalyticsService {
    /**
     * Get or create analytics for user
     */
    static getOrCreateAnalytics(userId: string): Promise<ILearningAnalytics>;
    /**
     * Update analytics based on latest data
     */
    static updateAnalytics(userId: string): Promise<ILearningAnalytics>;
    /**
     * Generate comprehensive dashboard data
     */
    static generateDashboard(userId: string): Promise<DashboardData>;
    /**
     * Add goal
     */
    static addGoal(userId: string, targetScore: number, targetDate: Date): Promise<void>;
    /**
     * Check and add milestones
     */
    static checkMilestones(userId: string): Promise<void>;
    /**
     * Get performance insights
     */
    static getInsights(userId: string): Promise<{
        strengths: string[];
        weaknesses: string[];
        opportunities: string[];
        recommendations: string[];
    }>;
}
//# sourceMappingURL=learningAnalyticsService.d.ts.map