import { Router } from 'express';
import * as learningAnalyticsController from '../controllers/learningAnalyticsController';
import { auth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/learning-analytics/dashboard
 * @desc    Get comprehensive dashboard data
 * @access  Private
 */
router.get('/dashboard', auth, learningAnalyticsController.getDashboard);

/**
 * @route   GET /api/learning-analytics/summary
 * @desc    Get analytics summary
 * @access  Private
 */
router.get('/summary', auth, learningAnalyticsController.getAnalyticsSummary);

/**
 * @route   GET /api/learning-analytics/prediction
 * @desc    Get score prediction
 * @access  Private
 */
router.get('/prediction', auth, learningAnalyticsController.getScorePrediction);

/**
 * @route   GET /api/learning-analytics/peer-comparison
 * @desc    Get peer comparison data
 * @access  Private
 */
router.get('/peer-comparison', auth, learningAnalyticsController.getPeerComparison);

/**
 * @route   POST /api/learning-analytics/goals
 * @desc    Add learning goal
 * @access  Private
 */
router.post('/goals', auth, learningAnalyticsController.addGoal);

/**
 * @route   GET /api/learning-analytics/insights
 * @desc    Get performance insights
 * @access  Private
 */
router.get('/insights', auth, learningAnalyticsController.getInsights);

/**
 * @route   GET /api/learning-analytics/milestones
 * @desc    Check and get milestones
 * @access  Private
 */
router.get('/milestones', auth, learningAnalyticsController.checkMilestones);

/**
 * @route   GET /api/learning-analytics/section-performance
 * @desc    Get section performance details
 * @access  Private
 */
router.get('/section-performance', auth, learningAnalyticsController.getSectionPerformance);

/**
 * @route   GET /api/learning-analytics/study-patterns
 * @desc    Get study patterns
 * @access  Private
 */
router.get('/study-patterns', auth, learningAnalyticsController.getStudyPatterns);

/**
 * @route   GET /api/learning-analytics/score-trends
 * @desc    Get score trends
 * @access  Private
 */
router.get('/score-trends', auth, learningAnalyticsController.getScoreTrends);

export default router;
