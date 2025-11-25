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
const tepsExamController = __importStar(require("../controllers/tepsExamController"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/teps-exams/official-simulation
 * @desc    Create official TEPS simulation exam
 * @access  Private
 */
router.post('/official-simulation', auth_1.auth, tepsExamController.createOfficialSimulation);
/**
 * @route   POST /api/teps-exams/micro-learning
 * @desc    Create micro-learning session (5/10/15 minutes)
 * @access  Private
 */
router.post('/micro-learning', auth_1.auth, tepsExamController.createMicroLearning);
/**
 * @route   POST /api/teps-exams/section-practice
 * @desc    Create section practice exam
 * @access  Private
 */
router.post('/section-practice', auth_1.auth, tepsExamController.createSectionPractice);
/**
 * @route   POST /api/teps-exams/:attemptId/start
 * @desc    Start exam
 * @access  Private
 */
router.post('/:attemptId/start', auth_1.auth, tepsExamController.startExam);
/**
 * @route   GET /api/teps-exams/:attemptId/questions
 * @desc    Get exam questions
 * @access  Private
 */
router.get('/:attemptId/questions', auth_1.auth, tepsExamController.getExamQuestions);
/**
 * @route   POST /api/teps-exams/:attemptId/submit-answer
 * @desc    Submit answer
 * @access  Private
 */
router.post('/:attemptId/submit-answer', auth_1.auth, tepsExamController.submitAnswer);
/**
 * @route   POST /api/teps-exams/:attemptId/pause
 * @desc    Pause exam
 * @access  Private
 */
router.post('/:attemptId/pause', auth_1.auth, tepsExamController.pauseExam);
/**
 * @route   POST /api/teps-exams/:attemptId/resume
 * @desc    Resume exam
 * @access  Private
 */
router.post('/:attemptId/resume', auth_1.auth, tepsExamController.resumeExam);
/**
 * @route   POST /api/teps-exams/:attemptId/complete
 * @desc    Complete exam
 * @access  Private
 */
router.post('/:attemptId/complete', auth_1.auth, tepsExamController.completeExam);
/**
 * @route   GET /api/teps-exams/:attemptId/result
 * @desc    Get exam result
 * @access  Private
 */
router.get('/:attemptId/result', auth_1.auth, tepsExamController.getExamResult);
/**
 * @route   GET /api/teps-exams/history
 * @desc    Get user exam history
 * @access  Private
 */
router.get('/history', auth_1.auth, tepsExamController.getExamHistory);
/**
 * @route   GET /api/teps-exams/statistics
 * @desc    Get exam statistics
 * @access  Private
 */
router.get('/statistics', auth_1.auth, tepsExamController.getExamStatistics);
/**
 * @route   POST /api/teps-exams/:attemptId/report-activity
 * @desc    Report suspicious activity
 * @access  Private
 */
router.post('/:attemptId/report-activity', auth_1.auth, tepsExamController.reportActivity);
exports.default = router;
//# sourceMappingURL=tepsExams.js.map