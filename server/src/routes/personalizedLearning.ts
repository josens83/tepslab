import { Router } from 'express';
import * as tepsQuestionController from '../controllers/tepsQuestionController';
import { auth } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/personalized-learning/profile
 * @desc    Get user learning profile
 * @access  Private
 */
router.get('/profile', auth, tepsQuestionController.getUserProfile);

/**
 * @route   POST /api/personalized-learning/study-plan
 * @desc    Generate personalized study plan
 * @access  Private
 */
router.post('/study-plan', auth, tepsQuestionController.generateStudyPlan);

/**
 * @route   GET /api/personalized-learning/next-question
 * @desc    Get next adaptive question
 * @access  Private
 */
router.get('/next-question', auth, tepsQuestionController.getNextAdaptiveQuestion);

export default router;
