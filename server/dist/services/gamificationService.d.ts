import { IAchievementDefinition, IUserAchievement, IUserLevel, IChallenge, IUserChallengeProgress, ILeaderboardEntry, ChallengeType, LeaderboardType, LeaderboardMetric } from '../models/Gamification';
import mongoose from 'mongoose';
/**
 * Gamification Service
 */
export declare class GamificationService {
    /**
     * Initialize user level (called on user registration)
     */
    static initializeUserLevel(userId: mongoose.Types.ObjectId): Promise<any>;
    /**
     * Get user level and stats
     */
    static getUserLevel(userId: mongoose.Types.ObjectId): Promise<IUserLevel>;
    /**
     * Add XP to user (with level up handling)
     */
    static addXP(userId: mongoose.Types.ObjectId, xp: number, reason: string): Promise<{
        userLevel: IUserLevel;
        leveledUp: boolean;
        newLevel?: number;
    }>;
    /**
     * Add coins to user
     */
    static addCoins(userId: mongoose.Types.ObjectId, coins: number): Promise<IUserLevel>;
    /**
     * Spend coins
     */
    static spendCoins(userId: mongoose.Types.ObjectId, coins: number): Promise<IUserLevel>;
    /**
     * Create achievement definition (admin)
     */
    static createAchievement(achievementData: Partial<IAchievementDefinition>): Promise<IAchievementDefinition>;
    /**
     * Get all achievements
     */
    static getAchievements(includeHidden?: boolean): Promise<IAchievementDefinition[]>;
    /**
     * Get user's achievement progress
     */
    static getUserAchievements(userId: mongoose.Types.ObjectId): Promise<IUserAchievement[]>;
    /**
     * Check and unlock achievements for user
     */
    static checkAchievements(userId: mongoose.Types.ObjectId, userStats: {
        score?: number;
        streak?: number;
        questions?: number;
        studyTime?: number;
        accuracy?: number;
        [key: string]: number | undefined;
    }): Promise<{
        newlyUnlocked: IUserAchievement[];
        updated: IUserAchievement[];
    }>;
    /**
     * Mark achievement as viewed
     */
    static markAchievementAsViewed(userId: mongoose.Types.ObjectId, achievementCode: string): Promise<IUserAchievement | null>;
    /**
     * Create challenge (admin)
     */
    static createChallenge(challengeData: Partial<IChallenge>): Promise<IChallenge>;
    /**
     * Get active challenges
     */
    static getActiveChallenges(type?: ChallengeType): Promise<IChallenge[]>;
    /**
     * Get user's challenge progress
     */
    static getUserChallengeProgress(userId: mongoose.Types.ObjectId, challengeId?: mongoose.Types.ObjectId): Promise<IUserChallengeProgress[]>;
    /**
     * Update challenge progress
     */
    static updateChallengeProgress(userId: mongoose.Types.ObjectId, challengeId: mongoose.Types.ObjectId, progressData: {
        [key: string]: number;
    }): Promise<IUserChallengeProgress>;
    /**
     * Claim challenge rewards
     */
    static claimChallengeRewards(userId: mongoose.Types.ObjectId, challengeId: mongoose.Types.ObjectId): Promise<{
        userLevel: IUserLevel;
        rewards: any;
    }>;
    /**
     * Update leaderboard entry for user
     */
    static updateLeaderboard(userId: mongoose.Types.ObjectId, type: LeaderboardType, metric: LeaderboardMetric, value: number, period?: string): Promise<void>;
    /**
     * Recalculate leaderboard ranks
     */
    static recalculateRanks(type: LeaderboardType, metric: LeaderboardMetric, period?: string): Promise<void>;
    /**
     * Get leaderboard
     */
    static getLeaderboard(type: LeaderboardType, metric: LeaderboardMetric, period?: string, limit?: number): Promise<ILeaderboardEntry[]>;
    /**
     * Get user's leaderboard position
     */
    static getUserLeaderboardPosition(userId: mongoose.Types.ObjectId, type: LeaderboardType, metric: LeaderboardMetric, period?: string): Promise<ILeaderboardEntry | null>;
    /**
     * Get current period strings
     */
    static getCurrentPeriod(type: 'weekly' | 'monthly'): string;
    /**
     * Get ISO week number
     */
    static getISOWeek(date: Date): number;
    /**
     * Comprehensive user stats for gamification
     */
    static getUserGamificationStats(userId: mongoose.Types.ObjectId): Promise<any>;
}
//# sourceMappingURL=gamificationService.d.ts.map