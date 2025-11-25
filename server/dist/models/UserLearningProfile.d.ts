import mongoose, { Document } from 'mongoose';
import { TEPSSection, DifficultyLevel } from './TEPSQuestion';
/**
 * User Learning Profile Document
 */
export interface IUserLearningProfile extends Document {
    userId: mongoose.Types.ObjectId;
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
    createdAt: Date;
    updatedAt: Date;
}
export declare const UserLearningProfile: mongoose.Model<IUserLearningProfile, {}, {}, {}, mongoose.Document<unknown, {}, IUserLearningProfile, {}, {}> & IUserLearningProfile & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=UserLearningProfile.d.ts.map