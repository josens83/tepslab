import express from 'express';
import * as gamificationController from '../controllers/gamificationController';
import { auth } from '../middleware/auth';
import { requireAdmin } from '../middleware/requireAdmin';

const router = express.Router();

// Level & XP Routes

/**
 * @route   GET /api/gamification/level
 * @desc    Get user's level and XP
 * @access  Private
 */
router.get('/level', auth, gamificationController.getUserLevel);

/**
 * @route   GET /api/gamification/stats
 * @desc    Get comprehensive user gamification stats
 * @access  Private
 */
router.get('/stats', auth, gamificationController.getUserStats);

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
router.get('/achievements/my', auth, gamificationController.getUserAchievements);

/**
 * @route   POST /api/gamification/achievements/:achievementCode/view
 * @desc    Mark achievement as viewed
 * @access  Private
 */
router.post('/achievements/:achievementCode/view', auth, gamificationController.markAchievementViewed);

/**
 * @route   POST /api/gamification/achievements
 * @desc    Create achievement (Admin)
 * @access  Private (Admin)
 */
router.post('/achievements', auth, requireAdmin, gamificationController.createAchievement);

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
router.get('/challenges/my-progress', auth, gamificationController.getUserChallengeProgress);

/**
 * @route   GET /api/gamification/challenges/:challengeId/progress
 * @desc    Get specific challenge progress
 * @access  Private
 */
router.get('/challenges/:challengeId/progress', auth, gamificationController.getUserChallengeProgress);

/**
 * @route   POST /api/gamification/challenges/:id/claim
 * @desc    Claim challenge rewards
 * @access  Private
 */
router.post('/challenges/:id/claim', auth, gamificationController.claimChallengeRewards);

/**
 * @route   POST /api/gamification/challenges
 * @desc    Create challenge (Admin)
 * @access  Private (Admin)
 */
router.post('/challenges', auth, requireAdmin, gamificationController.createChallenge);

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
router.get('/leaderboard/my-position', auth, gamificationController.getUserLeaderboardPosition);

export default router;
