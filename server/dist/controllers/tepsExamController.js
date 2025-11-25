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
exports.reportActivity = exports.getExamStatistics = exports.getExamHistory = exports.getExamResult = exports.completeExam = exports.resumeExam = exports.pauseExam = exports.submitAnswer = exports.getExamQuestions = exports.startExam = exports.createSectionPractice = exports.createMicroLearning = exports.createOfficialSimulation = void 0;
const tepsExamService_1 = require("../services/tepsExamService");
const TEPSExam_1 = require("../models/TEPSExam");
const TEPSQuestion_1 = require("../models/TEPSQuestion");
const errorHandler_1 = require("../middleware/errorHandler");
/**
 * Create official TEPS simulation exam
 */
const createOfficialSimulation = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { difficulty } = req.body;
        const attempt = await tepsExamService_1.TEPSExamService.createOfficialSimulation(userId, difficulty || TEPSExam_1.ExamDifficulty.ADAPTIVE);
        res.json({
            success: true,
            message: 'Official TEPS simulation created',
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createOfficialSimulation = createOfficialSimulation;
/**
 * Create micro-learning session
 */
const createMicroLearning = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { duration, section } = req.body;
        if (![5, 10, 15].includes(duration)) {
            throw new errorHandler_1.ApiError(400, 'Duration must be 5, 10, or 15 minutes');
        }
        const attempt = await tepsExamService_1.TEPSExamService.createMicroLearningSession(userId, duration, section);
        res.json({
            success: true,
            message: `${duration}-minute micro-learning session created`,
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createMicroLearning = createMicroLearning;
/**
 * Create section practice exam
 */
const createSectionPractice = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { section, questionCount, difficulty } = req.body;
        if (!section) {
            throw new errorHandler_1.ApiError(400, 'Section is required');
        }
        if (!Object.values(TEPSQuestion_1.TEPSSection).includes(section)) {
            throw new errorHandler_1.ApiError(400, 'Invalid section');
        }
        const attempt = await tepsExamService_1.TEPSExamService.createSectionPractice(userId, section, questionCount || 30, difficulty || TEPSExam_1.ExamDifficulty.ADAPTIVE);
        res.json({
            success: true,
            message: `${section} practice exam created`,
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.createSectionPractice = createSectionPractice;
/**
 * Start exam
 */
const startExam = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const attempt = await tepsExamService_1.TEPSExamService.startExam(attemptId);
        res.json({
            success: true,
            message: 'Exam started',
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.startExam = startExam;
/**
 * Get exam questions
 */
const getExamQuestions = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const examData = await tepsExamService_1.TEPSExamService.getExamQuestions(attemptId);
        res.json({
            success: true,
            data: examData,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamQuestions = getExamQuestions;
/**
 * Submit answer
 */
const submitAnswer = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { questionId, answer, timeSpent } = req.body;
        if (!questionId || !answer || timeSpent === undefined) {
            throw new errorHandler_1.ApiError(400, 'Missing required fields');
        }
        await tepsExamService_1.TEPSExamService.submitAnswer(attemptId, questionId, answer, timeSpent);
        res.json({
            success: true,
            message: 'Answer submitted',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;
/**
 * Pause exam
 */
const pauseExam = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const TEPSExamAttempt = (await Promise.resolve().then(() => __importStar(require('../models/TEPSExam')))).TEPSExamAttempt;
        const attempt = await TEPSExamAttempt.findById(attemptId);
        if (!attempt) {
            throw new errorHandler_1.ApiError(404, 'Exam attempt not found');
        }
        await attempt.pauseExam();
        res.json({
            success: true,
            message: 'Exam paused',
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.pauseExam = pauseExam;
/**
 * Resume exam
 */
const resumeExam = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const TEPSExamAttempt = (await Promise.resolve().then(() => __importStar(require('../models/TEPSExam')))).TEPSExamAttempt;
        const attempt = await TEPSExamAttempt.findById(attemptId);
        if (!attempt) {
            throw new errorHandler_1.ApiError(404, 'Exam attempt not found');
        }
        await attempt.resumeExam();
        res.json({
            success: true,
            message: 'Exam resumed',
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.resumeExam = resumeExam;
/**
 * Complete exam
 */
const completeExam = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const attempt = await tepsExamService_1.TEPSExamService.completeExam(attemptId);
        res.json({
            success: true,
            message: 'Exam completed',
            data: { attempt },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.completeExam = completeExam;
/**
 * Get exam result
 */
const getExamResult = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const TEPSExamAttempt = (await Promise.resolve().then(() => __importStar(require('../models/TEPSExam')))).TEPSExamAttempt;
        const attempt = await TEPSExamAttempt.findById(attemptId);
        if (!attempt) {
            throw new errorHandler_1.ApiError(404, 'Exam attempt not found');
        }
        if (!attempt.result) {
            throw new errorHandler_1.ApiError(400, 'Exam not completed yet');
        }
        res.json({
            success: true,
            data: { result: attempt.result },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamResult = getExamResult;
/**
 * Get user exam history
 */
const getExamHistory = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { examType, limit = 20, skip = 0 } = req.query;
        const history = await tepsExamService_1.TEPSExamService.getUserExamHistory(userId, examType, Number(limit), Number(skip));
        res.json({
            success: true,
            data: history,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamHistory = getExamHistory;
/**
 * Get exam statistics
 */
const getExamStatistics = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const stats = await tepsExamService_1.TEPSExamService.getExamStatistics(userId);
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getExamStatistics = getExamStatistics;
/**
 * Report suspicious activity (tab switching, fullscreen exit)
 */
const reportActivity = async (req, res, next) => {
    try {
        const { attemptId } = req.params;
        const { activityType } = req.body;
        const TEPSExamAttempt = (await Promise.resolve().then(() => __importStar(require('../models/TEPSExam')))).TEPSExamAttempt;
        const attempt = await TEPSExamAttempt.findById(attemptId);
        if (!attempt) {
            throw new errorHandler_1.ApiError(404, 'Exam attempt not found');
        }
        if (activityType === 'tab_switch') {
            attempt.tabSwitches += 1;
        }
        else if (activityType === 'fullscreen_exit') {
            attempt.fullscreenExits += 1;
        }
        // Mark as suspicious if too many violations
        if (attempt.tabSwitches >= 5 || attempt.fullscreenExits >= 3) {
            attempt.suspiciousActivity = true;
        }
        await attempt.save();
        res.json({
            success: true,
            message: 'Activity reported',
        });
    }
    catch (error) {
        next(error);
    }
};
exports.reportActivity = reportActivity;
//# sourceMappingURL=tepsExamController.js.map