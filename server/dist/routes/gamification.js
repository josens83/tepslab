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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const gamificationController = __importStar(require("../controllers/gamificationController"));
const auth_1 = require("../middleware/auth");
const requireAdmin_1 = require("../middleware/requireAdmin");
const router = express_1.default.Router();
// Level & XP Routes
/**
 * @route   GET /api/gamification/level
 * @desc    Get user's level and XP
 * @access  Private
 */
router.get('/level', auth_1.auth, gamificationController.getUserLevel);
/**
 * @route   GET /api/gamification/stats
 * @desc    Get comprehensive user gamification stats
 * @access  Private
 */
router.get('/stats', auth_1.auth, gamificationController.getUserStats);
// Achievement Routes
/**
 * @route   GET /api/gamification/achievements
 * @desc    Get all achievements
 * @access  Public
 */
router.get('/achievements', gamificationController.getAchievements);
/**
 * @route   GET /api/gamification/achievements/my
 * @desc    Get user's achievements
 * @access  Private
 */
router.get('/achievements/my', auth_1.auth, gamificationController.getUserAchievements);
/**
 * @route   POST /api/gamification/achievements/:achievementCode/view
 * @desc    Mark achievement as viewed
 * @access  Private
 */
router.post('/achievements/:achievementCode/view', auth_1.auth, gamificationController.markAchievementViewed);
/**
 * @route   POST /api/gamification/achievements
 * @desc    Create achievement (Admin)
 * @access  Private (Admin)
 */
router.post('/achievements', auth_1.auth, requireAdmin_1.requireAdmin, gamificationController.createAchievement);
// Challenge Routes
/**
 * @route   GET /api/gamification/challenges
 * @desc    Get active challenges
 * @access  Public
 */
router.get('/challenges', gamificationController.getActiveChallenges);
/**
 * @route   GET /api/gamification/challenges/my-progress
 * @desc    Get user's challenge progress
 * @access  Private
 */
router.get('/challenges/my-progress', auth_1.auth, gamificationController.getUserChallengeProgress);
/**
 * @route   GET /api/gamification/challenges/:challengeId/progress
 * @desc    Get specific challenge progress
 * @access  Private
 */
router.get('/challenges/:challengeId/progress', auth_1.auth, gamificationController.getUserChallengeProgress);
/**
 * @route   POST /api/gamification/challenges/:id/claim
 * @desc    Claim challenge rewards
 * @access  Private
 */
router.post('/challenges/:id/claim', auth_1.auth, gamificationController.claimChallengeRewards);
/**
 * @route   POST /api/gamification/challenges
 * @desc    Create challenge (Admin)
 * @access  Private (Admin)
 */
router.post('/challenges', auth_1.auth, requireAdmin_1.requireAdmin, gamificationController.createChallenge);
// Leaderboard Routes
/**
 * @route   GET /api/gamification/leaderboard
 * @desc    Get leaderboard
 * @access  Public
 */
router.get('/leaderboard', gamificationController.getLeaderboard);
/**
 * @route   GET /api/gamification/leaderboard/my-position
 * @desc    Get user's leaderboard position
 * @access  Private
 */
router.get('/leaderboard/my-position', auth_1.auth, gamificationController.getUserLeaderboardPosition);
exports.default = router;
//# sourceMappingURL=gamification.js.map