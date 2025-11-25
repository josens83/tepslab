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
const learningAnalyticsController = __importStar(require("../controllers/learningAnalyticsController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   GET /api/learning-analytics/dashboard
 * @desc    Get comprehensive dashboard data
 * @access  Private
 */
router.get('/dashboard', auth_1.auth, learningAnalyticsController.getDashboard);
/**
 * @route   GET /api/learning-analytics/summary
 * @desc    Get analytics summary
 * @access  Private
 */
router.get('/summary', auth_1.auth, learningAnalyticsController.getAnalyticsSummary);
/**
 * @route   GET /api/learning-analytics/prediction
 * @desc    Get score prediction
 * @access  Private
 */
router.get('/prediction', auth_1.auth, learningAnalyticsController.getScorePrediction);
/**
 * @route   GET /api/learning-analytics/peer-comparison
 * @desc    Get peer comparison data
 * @access  Private
 */
router.get('/peer-comparison', auth_1.auth, learningAnalyticsController.getPeerComparison);
/**
 * @route   POST /api/learning-analytics/goals
 * @desc    Add learning goal
 * @access  Private
 */
router.post('/goals', auth_1.auth, learningAnalyticsController.addGoal);
/**
 * @route   GET /api/learning-analytics/insights
 * @desc    Get performance insights
 * @access  Private
 */
router.get('/insights', auth_1.auth, learningAnalyticsController.getInsights);
/**
 * @route   GET /api/learning-analytics/milestones
 * @desc    Check and get milestones
 * @access  Private
 */
router.get('/milestones', auth_1.auth, learningAnalyticsController.checkMilestones);
/**
 * @route   GET /api/learning-analytics/section-performance
 * @desc    Get section performance details
 * @access  Private
 */
router.get('/section-performance', auth_1.auth, learningAnalyticsController.getSectionPerformance);
/**
 * @route   GET /api/learning-analytics/study-patterns
 * @desc    Get study patterns
 * @access  Private
 */
router.get('/study-patterns', auth_1.auth, learningAnalyticsController.getStudyPatterns);
/**
 * @route   GET /api/learning-analytics/score-trends
 * @desc    Get score trends
 * @access  Private
 */
router.get('/score-trends', auth_1.auth, learningAnalyticsController.getScoreTrends);
exports.default = router;
//# sourceMappingURL=learningAnalytics.js.map