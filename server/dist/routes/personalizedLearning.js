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
const router = (0, express_1.Router)();
/**
 * @route   GET /api/personalized-learning/profile
 * @desc    Get user learning profile
 * @access  Private
 */
router.get('/profile', auth_1.auth, tepsQuestionController.getUserProfile);
/**
 * @route   POST /api/personalized-learning/study-plan
 * @desc    Generate personalized study plan
 * @access  Private
 */
router.post('/study-plan', auth_1.auth, tepsQuestionController.generateStudyPlan);
/**
 * @route   GET /api/personalized-learning/next-question
 * @desc    Get next adaptive question
 * @access  Private
 */
router.get('/next-question', auth_1.auth, tepsQuestionController.getNextAdaptiveQuestion);
exports.default = router;
//# sourceMappingURL=personalizedLearning.js.map