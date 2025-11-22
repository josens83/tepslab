import { Router } from 'express';
import * as enhancedAITutorController from '../controllers/enhancedAITutorController';
import { auth } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/enhanced-ai-tutor/session/start
 * @desc    Start AI tutor session
 * @access  Private
 */
router.post('/session/start', auth, enhancedAITutorController.startSession);

/**
 * @route   POST /api/enhanced-ai-tutor/session/:sessionId/chat
 * @desc    Chat with AI tutor
 * @access  Private
 */
router.post('/session/:sessionId/chat', auth, enhancedAITutorController.chat);

/**
 * @route   POST /api/enhanced-ai-tutor/session/:sessionId/end
 * @desc    End AI tutor session
 * @access  Private
 */
router.post('/session/:sessionId/end', auth, enhancedAITutorController.endSession);

/**
 * @route   GET /api/enhanced-ai-tutor/session/active
 * @desc    Get active session
 * @access  Private
 */
router.get('/session/active', auth, enhancedAITutorController.getActiveSession);

/**
 * @route   GET /api/enhanced-ai-tutor/session/history
 * @desc    Get session history
 * @access  Private
 */
router.get('/session/history', auth, enhancedAITutorController.getSessionHistory);

/**
 * @route   GET /api/enhanced-ai-tutor/session/analytics
 * @desc    Get session analytics
 * @access  Private
 */
router.get('/session/analytics', auth, enhancedAITutorController.getSessionAnalytics);

/**
 * @route   GET /api/enhanced-ai-tutor/coaching/weekly-report
 * @desc    Get weekly coaching report
 * @access  Private
 */
router.get('/coaching/weekly-report', auth, enhancedAITutorController.getWeeklyReport);

/**
 * @route   POST /api/enhanced-ai-tutor/coaching/session
 * @desc    Create coaching session
 * @access  Private
 */
router.post('/coaching/session', auth, enhancedAITutorController.createCoachingSession);

/**
 * @route   GET /api/enhanced-ai-tutor/coaching/sessions
 * @desc    Get coaching session history
 * @access  Private
 */
router.get('/coaching/sessions', auth, enhancedAITutorController.getCoachingSessions);

/**
 * @route   POST /api/enhanced-ai-tutor/habits/add
 * @desc    Add learning habit
 * @access  Private
 */
router.post('/habits/add', auth, enhancedAITutorController.addHabit);

/**
 * @route   POST /api/enhanced-ai-tutor/habits/complete
 * @desc    Mark habit as completed
 * @access  Private
 */
router.post('/habits/complete', auth, enhancedAITutorController.completeHabit);

/**
 * @route   GET /api/enhanced-ai-tutor/motivation/daily
 * @desc    Get daily motivational boost
 * @access  Private
 */
router.get('/motivation/daily', auth, enhancedAITutorController.getDailyMotivation);

export default router;
