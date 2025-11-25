"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getScoreTrends = exports.getStudyPatterns = exports.getSectionPerformance = exports.checkMilestones = exports.getInsights = exports.addGoal = exports.getPeerComparison = exports.getScorePrediction = exports.getAnalyticsSummary = exports.getDashboard = void 0;
const learningAnalyticsService_1 = require("../services/learningAnalyticsService");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Get dashboard data
 */
const getDashboard = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const dashboard = await learningAnalyticsService_1.LearningAnalyticsService.generateDashboard(userId);
        res.json({
            success: true,
            data: dashboard,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
/**
 * Get analytics summary
 */
const getAnalyticsSummary = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.getOrCreateAnalytics(userId);
        await learningAnalyticsService_1.LearningAnalyticsService.updateAnalytics(userId);
        res.json({
            success: true,
            data: {
                currentScore: analytics.currentScore,
                scoreChange30Days: analytics.scoreChange30Days,
                scoreChange90Days: analytics.scoreChange90Days,
                totalQuestionsAttempted: analytics.totalQuestionsAttempted,
                averageAccuracy: Math.round(analytics.averageAccuracy * 10) / 10,
                strongestSection: analytics.strongestSection,
                weakestSection: analytics.weakestSection,
                lastCalculated: analytics.lastCalculatedAt,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalyticsSummary = getAnalyticsSummary;
/**
 * Get score prediction
 */
const getScorePrediction = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { targetDays = 30 } = req.query;
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.getOrCreateAnalytics(userId);
        const prediction = analytics.predictScore(Number(targetDays));
        res.json({
            success: true,
            data: { prediction },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getScorePrediction = getScorePrediction;
/**
 * Get peer comparison
 */
const getPeerComparison = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.getOrCreateAnalytics(userId);
        const peerComparison = await analytics.compareWithPeers();
        res.json({
            success: true,
            data: { peerComparison },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getPeerComparison = getPeerComparison;
/**
 * Add learning goal
 */
const addGoal = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { targetScore, targetDate } = req.body;
        if (!targetScore || !targetDate) {
            throw new errorHandler_1.ApiError(400, 'Target score and date are required');
        }
        await learningAnalyticsService_1.LearningAnalyticsService.addGoal(userId, targetScore, new Date(targetDate));
        res.json({
            success: true,
            message: 'Goal added successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addGoal = addGoal;
/**
 * Get insights
 */
const getInsights = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const insights = await learningAnalyticsService_1.LearningAnalyticsService.getInsights(userId);
        res.json({
            success: true,
            data: insights,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getInsights = getInsights;
/**
 * Check milestones
 */
const checkMilestones = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        await learningAnalyticsService_1.LearningAnalyticsService.checkMilestones(userId);
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.getOrCreateAnalytics(userId);
        res.json({
            success: true,
            data: {
                milestones: analytics.milestones.slice(-10).reverse(),
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.checkMilestones = checkMilestones;
/**
 * Get section performance details
 */
const getSectionPerformance = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.updateAnalytics(userId);
        res.json({
            success: true,
            data: {
                sectionPerformance: analytics.sectionPerformance,
                strongestSection: analytics.strongestSection,
                weakestSection: analytics.weakestSection,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSectionPerformance = getSectionPerformance;
/**
 * Get study patterns
 */
const getStudyPatterns = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.updateAnalytics(userId);
        res.json({
            success: true,
            data: {
                studyTimeDistribution: analytics.studyTimeDistribution,
                mostProductiveTime: analytics.mostProductiveTime,
                learningVelocity: analytics.learningVelocity,
                totalStudyTime: analytics.totalStudyTime,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getStudyPatterns = getStudyPatterns;
/**
 * Get score trends
 */
const getScoreTrends = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { days = 90 } = req.query;
        const analytics = await learningAnalyticsService_1.LearningAnalyticsService.updateAnalytics(userId);
        const cutoffDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
        const filteredTrends = analytics.scoreTrends.filter((t) => t.date >= cutoffDate);
        res.json({
            success: true,
            data: {
                trends: filteredTrends,
                currentScore: analytics.currentScore,
                highestScore: analytics.highestScore,
                lowestScore: analytics.lowestScore,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getScoreTrends = getScoreTrends;
//# sourceMappingURL=learningAnalyticsController.js.map