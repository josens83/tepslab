"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createChallenge = exports.createAchievement = exports.getUserLeaderboardPosition = exports.getLeaderboard = exports.claimChallengeRewards = exports.getUserChallengeProgress = exports.getActiveChallenges = exports.markAchievementViewed = exports.getUserAchievements = exports.getAchievements = exports.getUserStats = exports.getUserLevel = void 0;
const gamificationService_1 = require("../services/gamificationService");
const Gamification_1 = require("../models/Gamification");
const mongoose_1 = __importDefault(require("mongoose"));
// Level & XP Controllers
const getUserLevel = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const userLevel = await gamificationService_1.GamificationService.getUserLevel(userId);
        res.json({
            success: true,
            data: userLevel
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserLevel = getUserLevel;
const getUserStats = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const stats = await gamificationService_1.GamificationService.getUserGamificationStats(userId);
        res.json({
            success: true,
            data: stats
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserStats = getUserStats;
// Achievement Controllers
const getAchievements = async (req, res, next) => {
    try {
        const includeHidden = req.query.includeHidden === 'true';
        const achievements = await gamificationService_1.GamificationService.getAchievements(includeHidden);
        res.json({
            success: true,
            data: achievements
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAchievements = getAchievements;
const getUserAchievements = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const achievements = await gamificationService_1.GamificationService.getUserAchievements(userId);
        res.json({
            success: true,
            data: achievements
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserAchievements = getUserAchievements;
const markAchievementViewed = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const { achievementCode } = req.params;
        const achievement = await gamificationService_1.GamificationService.markAchievementAsViewed(userId, achievementCode);
        res.json({
            success: true,
            data: achievement
        });
    }
    catch (error) {
        next(error);
    }
};
exports.markAchievementViewed = markAchievementViewed;
// Challenge Controllers
const getActiveChallenges = async (req, res, next) => {
    try {
        const type = req.query.type;
        const challenges = await gamificationService_1.GamificationService.getActiveChallenges(type);
        res.json({
            success: true,
            data: challenges
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveChallenges = getActiveChallenges;
const getUserChallengeProgress = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const challengeId = req.params.challengeId
            ? new mongoose_1.default.Types.ObjectId(req.params.challengeId)
            : undefined;
        const progress = await gamificationService_1.GamificationService.getUserChallengeProgress(userId, challengeId);
        res.json({
            success: true,
            data: progress
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserChallengeProgress = getUserChallengeProgress;
const claimChallengeRewards = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const challengeId = new mongoose_1.default.Types.ObjectId(req.params.id);
        const result = await gamificationService_1.GamificationService.claimChallengeRewards(userId, challengeId);
        res.json({
            success: true,
            message: 'Rewards claimed successfully',
            data: result
        });
    }
    catch (error) {
        next(error);
    }
};
exports.claimChallengeRewards = claimChallengeRewards;
// Leaderboard Controllers
const getLeaderboard = async (req, res, next) => {
    try {
        const type = req.query.type || Gamification_1.LeaderboardType.GLOBAL;
        const metric = req.query.metric || Gamification_1.LeaderboardMetric.XP;
        const limit = Number(req.query.limit) || 100;
        let period;
        if (type === Gamification_1.LeaderboardType.WEEKLY) {
            period = gamificationService_1.GamificationService.getCurrentPeriod('weekly');
        }
        else if (type === Gamification_1.LeaderboardType.MONTHLY) {
            period = gamificationService_1.GamificationService.getCurrentPeriod('monthly');
        }
        const leaderboard = await gamificationService_1.GamificationService.getLeaderboard(type, metric, period, limit);
        res.json({
            success: true,
            data: {
                type,
                metric,
                period,
                entries: leaderboard
            }
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getLeaderboard = getLeaderboard;
const getUserLeaderboardPosition = async (req, res, next) => {
    try {
        const userId = new mongoose_1.default.Types.ObjectId(req.user.userId);
        const type = req.query.type || Gamification_1.LeaderboardType.GLOBAL;
        const metric = req.query.metric || Gamification_1.LeaderboardMetric.XP;
        let period;
        if (type === Gamification_1.LeaderboardType.WEEKLY) {
            period = gamificationService_1.GamificationService.getCurrentPeriod('weekly');
        }
        else if (type === Gamification_1.LeaderboardType.MONTHLY) {
            period = gamificationService_1.GamificationService.getCurrentPeriod('monthly');
        }
        const position = await gamificationService_1.GamificationService.getUserLeaderboardPosition(userId, type, metric, period);
        res.json({
            success: true,
            data: position
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserLeaderboardPosition = getUserLeaderboardPosition;
// Admin Controllers
const createAchievement = async (req, res, next) => {
    try {
        const achievement = await gamificationService_1.GamificationService.createAchievement(req.body);
        res.status(201).json({
            success: true,
            message: 'Achievement created successfully',
            data: achievement
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createAchievement = createAchievement;
const createChallenge = async (req, res, next) => {
    try {
        const challenge = await gamificationService_1.GamificationService.createChallenge(req.body);
        res.status(201).json({
            success: true,
            message: 'Challenge created successfully',
            data: challenge
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createChallenge = createChallenge;
//# sourceMappingURL=gamificationController.js.map