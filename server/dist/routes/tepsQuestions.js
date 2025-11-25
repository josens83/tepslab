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
const tepsQuestionController = __importStar(require("../controllers/tepsQuestionController"));
const auth_1 = require("../middleware/auth");
const checkRole_1 = require("../middleware/checkRole");
const router = (0, express_1.Router)();
/**
 * @route   POST /api/teps-questions/generate
 * @desc    Generate questions using AI
 * @access  Private (Admin/Instructor only)
 */
router.post('/generate', auth_1.auth, (0, checkRole_1.checkRole)(['admin', 'instructor']), tepsQuestionController.generateQuestions);
/**
 * @route   GET /api/teps-questions/search
 * @desc    Search questions with filters
 * @access  Private
 */
router.get('/search', auth_1.auth, tepsQuestionController.searchQuestions);
/**
 * @route   GET /api/teps-questions/stats
 * @desc    Get question bank statistics
 * @access  Private
 */
router.get('/stats', auth_1.auth, tepsQuestionController.getQuestionBankStats);
/**
 * @route   GET /api/teps-questions/patterns/:section
 * @desc    Analyze official question patterns for a section
 * @access  Private (Admin/Instructor only)
 */
router.get('/patterns/:section', auth_1.auth, (0, checkRole_1.checkRole)(['admin', 'instructor']), tepsQuestionController.analyzeOfficialPatterns);
/**
 * @route   POST /api/teps-questions/bulk-import
 * @desc    Bulk import questions
 * @access  Private (Admin only)
 */
router.post('/bulk-import', auth_1.auth, (0, checkRole_1.checkRole)(['admin']), tepsQuestionController.bulkImportQuestions);
/**
 * @route   GET /api/teps-questions/:id
 * @desc    Get question by ID
 * @access  Private
 */
router.get('/:id', auth_1.auth, tepsQuestionController.getQuestionById);
/**
 * @route   PUT /api/teps-questions/:id/status
 * @desc    Update question review status
 * @access  Private (Admin/Instructor only)
 */
router.put('/:id/status', auth_1.auth, (0, checkRole_1.checkRole)(['admin', 'instructor']), tepsQuestionController.updateQuestionStatus);
/**
 * @route   POST /api/teps-questions/submit-answer
 * @desc    Submit answer and update user profile
 * @access  Private
 */
router.post('/submit-answer', auth_1.auth, tepsQuestionController.submitAnswer);
/**
 * @route   GET /api/teps-questions/adaptive/next
 * @desc    Get next adaptive question
 * @access  Private
 */
router.get('/adaptive/next', auth_1.auth, tepsQuestionController.getNextAdaptiveQuestion);
exports.default = router;
//# sourceMappingURL=tepsQuestions.js.map