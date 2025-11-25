import mongoose, { Document } from 'mongoose';
/**
 * Coaching Session Type
 */
export declare enum CoachingType {
    WEEKLY_CHECKIN = "weekly_checkin",
    MONTHLY_REVIEW = "monthly_review",
    GOAL_PLANNING = "goal_planning",
    HABIT_BUILDING = "habit_building",
    MOTIVATION_BOOST = "motivation_boost",
    STRATEGY_OPTIMIZATION = "strategy_optimization"
}
/**
 * Learning Habit
 */
export interface LearningHabit {
    habitName: string;
    description: string;
    frequency: 'daily' | 'weekly' | 'monthly';
    targetDays: string[];
    targetTime?: string;
    reminderEnabled: boolean;
    streakCount: number;
    lastCompletedAt?: Date;
    createdAt: Date;
}
/**
 * Motivation Boost
 */
export interface MotivationBoost {
    type: 'achievement' | 'encouragement' | 'tip' | 'quote';
    message: string;
    deliveredAt: Date;
    userReaction?: 'liked' | 'saved' | 'dismissed';
}
/**
 * Action Item
 */
export interface ActionItem {
    description: string;
    priority: 'high' | 'medium' | 'low';
    dueDate?: Date;
    completed: boolean;
    completedAt?: Date;
}
/**
 * Coaching Insight
 */
export interface CoachingInsight {
    category: 'strength' | 'weakness' | 'opportunity' | 'recommendation';
    title: string;
    description: string;
    evidence: string[];
    actionable: boolean;
    relatedGoals?: string[];
}
/**
 * Learning Coach Session Document
 */
export interface ILearningCoachSession extends Document {
    userId: mongoose.Types.ObjectId;
    coachingType: CoachingType;
    insights: CoachingInsight[];
    recommendations: string[];
    actionItems: ActionItem[];
    habits: LearningHabit[];
    habitCompletionRate: number;
    motivationBoosts: MotivationBoost[];
    performanceSummary?: {
        period: string;
        studyDays: number;
        totalStudyTime: number;
        questionsAttempted: number;
        accuracy: number;
        scoreChange: number;
        topImprovement: string;
        needsAttention: string;
    };
    scheduledAt?: Date;
    conductedAt: Date;
    nextSessionAt?: Date;
    userFeedback?: {
        rating: number;
        comment?: string;
        implementedActions: number;
    };
    createdAt: Date;
    updatedAt: Date;
    addActionItem(description: string, priority: string, dueDate?: Date): Promise<void>;
    completeActionItem(index: number): Promise<void>;
    updateHabitStreak(habitName: string): Promise<void>;
}
export declare const LearningCoachSession: mongoose.Model<ILearningCoachSession, {}, {}, {}, mongoose.Document<unknown, {}, ILearningCoachSession, {}, {}> & ILearningCoachSession & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=LearningCoachSession.d.ts.map