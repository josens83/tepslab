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
const express_1 = require("express");
const enhancedAITutorController = __importStar(require("../controllers/enhancedAITutorController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/enhanced-ai-tutor/session/start
 * @desc    Start AI tutor session
 * @access  Private
 */
router.post('/session/start', auth_1.auth, enhancedAITutorController.startSession);
/**
 * @route   POST /api/enhanced-ai-tutor/session/:sessionId/chat
 * @desc    Chat with AI tutor
 * @access  Private
 */
router.post('/session/:sessionId/chat', auth_1.auth, enhancedAITutorController.chat);
/**
 * @route   POST /api/enhanced-ai-tutor/session/:sessionId/end
 * @desc    End AI tutor session
 * @access  Private
 */
router.post('/session/:sessionId/end', auth_1.auth, enhancedAITutorController.endSession);
/**
 * @route   GET /api/enhanced-ai-tutor/session/active
 * @desc    Get active session
 * @access  Private
 */
router.get('/session/active', auth_1.auth, enhancedAITutorController.getActiveSession);
/**
 * @route   GET /api/enhanced-ai-tutor/session/history
 * @desc    Get session history
 * @access  Private
 */
router.get('/session/history', auth_1.auth, enhancedAITutorController.getSessionHistory);
/**
 * @route   GET /api/enhanced-ai-tutor/session/analytics
 * @desc    Get session analytics
 * @access  Private
 */
router.get('/session/analytics', auth_1.auth, enhancedAITutorController.getSessionAnalytics);
/**
 * @route   GET /api/enhanced-ai-tutor/coaching/weekly-report
 * @desc    Get weekly coaching report
 * @access  Private
 */
router.get('/coaching/weekly-report', auth_1.auth, enhancedAITutorController.getWeeklyReport);
/**
 * @route   POST /api/enhanced-ai-tutor/coaching/session
 * @desc    Create coaching session
 * @access  Private
 */
router.post('/coaching/session', auth_1.auth, enhancedAITutorController.createCoachingSession);
/**
 * @route   GET /api/enhanced-ai-tutor/coaching/sessions
 * @desc    Get coaching session history
 * @access  Private
 */
router.get('/coaching/sessions', auth_1.auth, enhancedAITutorController.getCoachingSessions);
/**
 * @route   POST /api/enhanced-ai-tutor/habits/add
 * @desc    Add learning habit
 * @access  Private
 */
router.post('/habits/add', auth_1.auth, enhancedAITutorController.addHabit);
/**
 * @route   POST /api/enhanced-ai-tutor/habits/complete
 * @desc    Mark habit as completed
 * @access  Private
 */
router.post('/habits/complete', auth_1.auth, enhancedAITutorController.completeHabit);
/**
 * @route   GET /api/enhanced-ai-tutor/motivation/daily
 * @desc    Get daily motivational boost
 * @access  Private
 */
router.get('/motivation/daily', auth_1.auth, enhancedAITutorController.getDailyMotivation);
exports.default = router;
//# sourceMappingURL=enhancedAITutor.js.map