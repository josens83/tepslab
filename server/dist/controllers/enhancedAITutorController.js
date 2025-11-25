"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSessionAnalytics = exports.completeHabit = exports.getCoachingSessions = exports.getDailyMotivation = exports.addHabit = exports.createCoachingSession = exports.getWeeklyReport = exports.getSessionHistory = exports.getActiveSession = exports.endSession = exports.chat = exports.startSession = void 0;
const enhancedAITutorService_1 = require("../services/enhancedAITutorService");
const AITutorSession_1 = require("../models/AITutorSession");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Start AI tutor session
 */
const startSession = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { sessionType } = req.body;
        const session = await enhancedAITutorService_1.EnhancedAITutorService.startSession(userId, sessionType || AITutorSession_1.SessionType.GENERAL_QA);
        res.json({
            success: true,
            message: 'AI tutor session started',
            data: { session },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.startSession = startSession;
/**
 * Chat with AI tutor
 */
const chat = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { message } = req.body;
        if (!message) {
            throw new errorHandler_1.ApiError(400, 'Message is required');
        }
        const response = await enhancedAITutorService_1.EnhancedAITutorService.chat(sessionId, message);
        res.json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.chat = chat;
/**
 * End AI tutor session
 */
const endSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const { satisfaction, helpfulness } = req.body;
        await enhancedAITutorService_1.EnhancedAITutorService.endSession(sessionId, {
            satisfaction,
            helpfulness,
        });
        res.json({
            success: true,
            message: 'Session ended successfully',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.endSession = endSession;
/**
 * Get active session
 */
const getActiveSession = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const session = await AITutorSession_1.AITutorSession.findOne({
            userId,
            isActive: true,
        }).sort({ startedAt: -1 });
        res.json({
            success: true,
            data: { session },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getActiveSession = getActiveSession;
/**
 * Get session history
 */
const getSessionHistory = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { limit = 20, skip = 0 } = req.query;
        const sessions = await AITutorSession_1.AITutorSession.find({ userId })
            .sort({ startedAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip));
        const total = await AITutorSession_1.AITutorSession.countDocuments({ userId });
        res.json({
            success: true,
            data: { sessions, total },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSessionHistory = getSessionHistory;
/**
 * Generate weekly coaching report
 */
const getWeeklyReport = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const report = await enhancedAITutorService_1.EnhancedAITutorService.generateWeeklyReport(userId);
        res.json({
            success: true,
            data: { report },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getWeeklyReport = getWeeklyReport;
/**
 * Create coaching session
 */
const createCoachingSession = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { coachingType } = req.body;
        if (!coachingType) {
            throw new errorHandler_1.ApiError(400, 'Coaching type is required');
        }
        const session = await enhancedAITutorService_1.EnhancedAITutorService.createCoachingSession(userId, coachingType);
        res.json({
            success: true,
            message: 'Coaching session created',
            data: { session },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createCoachingSession = createCoachingSession;
/**
 * Add learning habit
 */
const addHabit = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { habitName, description, frequency, targetDays, targetTime } = req.body;
        if (!habitName || !description || !frequency) {
            throw new errorHandler_1.ApiError(400, 'Missing required fields');
        }
        await enhancedAITutorService_1.EnhancedAITutorService.addLearningHabit(userId, habitName, description, frequency, targetDays || [], targetTime);
        res.json({
            success: true,
            message: 'Learning habit added',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.addHabit = addHabit;
/**
 * Get daily motivation
 */
const getDailyMotivation = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const motivation = await enhancedAITutorService_1.EnhancedAITutorService.sendDailyMotivation(userId);
        res.json({
            success: true,
            data: { motivation },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getDailyMotivation = getDailyMotivation;
/**
 * Get coaching session history
 */
const getCoachingSessions = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { limit = 10, skip = 0 } = req.query;
        const LearningCoachSession = (await Promise.resolve().then(() => __importStar(require('../models/LearningCoachSession')))).LearningCoachSession;
        const sessions = await LearningCoachSession.find({ userId })
            .sort({ conductedAt: -1 })
            .limit(Number(limit))
            .skip(Number(skip));
        const total = await LearningCoachSession.countDocuments({ userId });
        res.json({
            success: true,
            data: { sessions, total },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getCoachingSessions = getCoachingSessions;
/**
 * Update habit completion
 */
const completeHabit = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const { habitName } = req.body;
        if (!habitName) {
            throw new errorHandler_1.ApiError(400, 'Habit name is required');
        }
        const LearningCoachSession = (await Promise.resolve().then(() => __importStar(require('../models/LearningCoachSession')))).LearningCoachSession;
        const session = await LearningCoachSession.findOne({ userId }).sort({
            createdAt: -1,
        });
        if (!session) {
            throw new errorHandler_1.ApiError(404, 'No coaching session found');
        }
        await session.updateHabitStreak(habitName);
        res.json({
            success: true,
            message: 'Habit completion recorded',
            data: {
                habitCompletionRate: session.habitCompletionRate,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeHabit = completeHabit;
/**
 * Get session analytics
 */
const getSessionAnalytics = async (req, res, next) => {
    try {
        const userId = req.user._id;
        const totalSessions = await AITutorSession_1.AITutorSession.countDocuments({ userId });
        const activeSessions = await AITutorSession_1.AITutorSession.countDocuments({
            userId,
            isActive: true,
        });
        const sessions = await AITutorSession_1.AITutorSession.find({ userId });
        let totalMessages = 0;
        let totalSatisfaction = 0;
        let satisfactionCount = 0;
        sessions.forEach((session) => {
            totalMessages += session.metrics.totalMessages;
            if (session.metrics.userSatisfaction) {
                totalSatisfaction += session.metrics.userSatisfaction;
                satisfactionCount += 1;
            }
        });
        const avgSatisfaction = satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;
        const sessionsByType = {};
        sessions.forEach((session) => {
            sessionsByType[session.sessionType] =
                (sessionsByType[session.sessionType] || 0) + 1;
        });
        res.json({
            success: true,
            data: {
                totalSessions,
                activeSessions,
                totalMessages,
                averageSatisfaction: avgSatisfaction,
                sessionsByType,
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getSessionAnalytics = getSessionAnalytics;
//# sourceMappingURL=enhancedAITutorController.js.map