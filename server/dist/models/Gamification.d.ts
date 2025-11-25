import mongoose, { Document } from 'mongoose';
/**
 * Achievement Types
 */
export declare enum AchievementType {
    SCORE = "score",// Score milestones
    STREAK = "streak",// Study streak
    QUESTIONS = "questions",// Questions answered
    STUDY_TIME = "study_time",// Total study hours
    ACCURACY = "accuracy",// Accuracy percentage
    COURSE_COMPLETE = "course_complete",// Complete courses
    TEST_PASSED = "test_passed",// Pass tests
    SOCIAL = "social",// Social interactions
    SPECIAL = "special"
}
export declare enum AchievementRarity {
    COMMON = "common",
    UNCOMMON = "uncommon",
    RARE = "rare",
    EPIC = "epic",
    LEGENDARY = "legendary"
}
/**
 * Achievement Definition Interface
 */
export interface IAchievementDefinition extends Document {
    code: string;
    name: string;
    description: string;
    icon: string;
    type: AchievementType;
    rarity: AchievementRarity;
    requirements: {
        metric: string;
        value: number;
        comparison: 'gte' | 'lte' | 'eq';
    }[];
    rewards: {
        xp: number;
        coins?: number;
        badge?: string;
    };
    isHidden: boolean;
    isActive: boolean;
    order: number;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User Achievement Interface
 */
export interface IUserAchievement extends Document {
    userId: mongoose.Types.ObjectId;
    achievementCode: string;
    progress: number;
    currentValue: number;
    targetValue: number;
    isUnlocked: boolean;
    unlockedAt?: Date;
    isViewed: boolean;
    viewedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User Level & XP Interface
 */
export interface IUserLevel extends Document {
    userId: mongoose.Types.ObjectId;
    level: number;
    currentXP: number;
    totalXP: number;
    xpToNextLevel: number;
    coins: number;
    stats: {
        achievementsUnlocked: number;
        challengesCompleted: number;
        currentStreak: number;
        longestStreak: number;
    };
    createdAt: Date;
    updatedAt: Date;
    addXP(amount: number): Promise<{
        levelUp: boolean;
        newLevel?: number;
    }>;
    addCoins(amount: number): Promise<void>;
}
/**
 * Challenge Interface
 */
export declare enum ChallengeType {
    DAILY = "daily",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    SPECIAL = "special"
}
export declare enum ChallengeStatus {
    ACTIVE = "active",
    EXPIRED = "expired",
    COMPLETED = "completed"
}
export interface IChallenge extends Document {
    title: string;
    description: string;
    type: ChallengeType;
    status: ChallengeStatus;
    requirements: {
        type: string;
        target: number;
    }[];
    rewards: {
        xp: number;
        coins: number;
        badges?: string[];
    };
    startDate: Date;
    endDate: Date;
    participants: mongoose.Types.ObjectId[];
    completions: {
        userId: mongoose.Types.ObjectId;
        completedAt: Date;
    }[];
    createdAt: Date;
    updatedAt: Date;
}
/**
 * User Challenge Progress Interface
 */
export interface IUserChallengeProgress extends Document {
    userId: mongoose.Types.ObjectId;
    challengeId: mongoose.Types.ObjectId;
    progress: {
        type: string;
        current: number;
        target: number;
        percentage: number;
    }[];
    isCompleted: boolean;
    completedAt?: Date;
    rewardsClaimed: boolean;
    claimedAt?: Date;
    createdAt: Date;
    updatedAt: Date;
}
/**
 * Leaderboard Entry Interface
 */
export declare enum LeaderboardType {
    GLOBAL = "global",
    WEEKLY = "weekly",
    MONTHLY = "monthly",
    FRIENDS = "friends"
}
export declare enum LeaderboardMetric {
    SCORE = "score",
    XP = "xp",
    STREAK = "streak",
    QUESTIONS = "questions",
    STUDY_TIME = "study_time"
}
export interface ILeaderboardEntry extends Document {
    userId: mongoose.Types.ObjectId;
    type: LeaderboardType;
    metric: LeaderboardMetric;
    value: number;
    rank: number;
    period?: string;
    updatedAt: Date;
    createdAt: Date;
}
/**
 * Gamification Models
 */
export declare const AchievementDefinition: mongoose.Model<IAchievementDefinition, {}, {}, {}, mongoose.Document<unknown, {}, IAchievementDefinition, {}, {}> & IAchievementDefinition & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const UserAchievement: mongoose.Model<IUserAchievement, {}, {}, {}, mongoose.Document<unknown, {}, IUserAchievement, {}, {}> & IUserAchievement & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const UserLevel: mongoose.Model<IUserLevel, {}, {}, {}, mongoose.Document<unknown, {}, IUserLevel, {}, {}> & IUserLevel & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const Challenge: mongoose.Model<IChallenge, {}, {}, {}, mongoose.Document<unknown, {}, IChallenge, {}, {}> & IChallenge & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const UserChallengeProgress: mongoose.Model<IUserChallengeProgress, {}, {}, {}, mongoose.Document<unknown, {}, IUserChallengeProgress, {}, {}> & IUserChallengeProgress & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
export declare const LeaderboardEntry: mongoose.Model<ILeaderboardEntry, {}, {}, {}, mongoose.Document<unknown, {}, ILeaderboardEntry, {}, {}> & ILeaderboardEntry & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any>;
//# sourceMappingURL=Gamification.d.ts.map