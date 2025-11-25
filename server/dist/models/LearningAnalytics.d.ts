import mongoose, { Document } from 'mongoose';
import { TEPSSection } from './TEPSQuestion';
/**
 * Score Trend Data Point
 */
export interface ScoreTrendPoint {
    date: Date;
    score: number;
    examId?: mongoose.Types.ObjectId;
    examType: string;
}
/**
 * Section Performance
 */
export interface SectionPerformance {
    section: TEPSSection;
    averageScore: number;
    averageAccuracy: number;
    questionsAttempted: number;
    timeSpent: number;
    improvement: number;
    rank: number;
}
/**
 * Study Time Distribution
 */
export interface StudyTimeDistribution {
    dayOfWeek: string;
    hours: number;
    productivity: number;
}
/**
 * Learning Velocity
 */
export interface LearningVelocity {
    period: string;
    questionsPerDay: number;
    accuracyTrend: number;
    scoreVelocity: number;
    estimatedDaysToGoal: number;
}
/**
 * Peer Comparison
 */
export interface PeerComparison {
    userScore: number;
    averageScore: number;
    percentile: number;
    topPerformers: {
        scoreRange: string;
        percentage: number;
    }[];
    similarLearners: number;
}
/**
 * Goal Progress
 */
export interface GoalProgress {
    goalId: mongoose.Types.ObjectId;
    targetScore: number;
    currentScore: number;
    progressPercentage: number;
    onTrack: boolean;
    estimatedCompletionDate: Date;
    daysRemaining: number;
    requiredDailyProgress: number;
}
/**
 * Prediction Model
 */
export interface ScorePrediction {
    predictedScore: number;
    confidenceInterval: {
        lower: number;
        upper: number;
    };
    probability: number;
    basedOn: string;
    factors: {
        factor: string;
        impact: number;
    }[];
    recommendations: string[];
}
/**
 * Learning Analytics Document
 * Comprehensive analytics and predictions for user learning
 */
export interface ILearningAnalytics extends Document {
    userId: mongoose.Types.ObjectId;
    scoreTrends: ScoreTrendPoint[];
    currentScore: number;
    highestScore: number;
    lowestScore: number;
    scoreChange30Days: number;
    scoreChange90Days: number;
    sectionPerformance: SectionPerformance[];
    strongestSection: TEPSSection;
    weakestSection: TEPSSection;
    totalStudyTime: number;
    totalQuestionsAttempted: number;
    averageAccuracy: number;
    studyTimeDistribution: StudyTimeDistribution[];
    mostProductiveTime: string;
    learningVelocity: LearningVelocity;
    peerComparison: PeerComparison;
    goals: GoalProgress[];
    scorePrediction?: ScorePrediction;
    milestones: {
        type: 'score' | 'streak' | 'questions' | 'time';
        description: string;
        achievedAt: Date;
        value: number;
    }[];
    lastCalculatedAt: Date;
    createdAt: Date;
    updatedAt: Date;
    calculateScoreTrend(): void;
    predictScore(targetDays: number): ScorePrediction;
    compareWithPeers(): Promise<PeerComparison>;
    updateGoalProgress(): Promise<void>;
}
export declare const LearningAnalytics: mongoose.Model<ILearningAnalytics, {}, {}, {}, mongoose.Document<unknown, {}, ILearningAnalytics, {}, {}> & ILearningAnalytics & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LearningAnalytics.d.ts.map