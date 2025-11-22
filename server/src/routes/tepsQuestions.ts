import { Router } from 'express';
import * as tepsQuestionController from '../controllers/tepsQuestionController';
import { auth } from '../middleware/auth';
import { checkRole } from '../middleware/checkRole';

const router = Router();

/**
 * @route   POST /api/teps-questions/generate
 * @desc    Generate questions using AI
 * @access  Private (Admin/Instructor only)
 */
router.post(
  '/generate',
  auth,
  checkRole(['admin', 'instructor']),
  tepsQuestionController.generateQuestions
);

/**
 * @route   GET /api/teps-questions/search
 * @desc    Search questions with filters
 * @access  Private
 */
router.get('/search', auth, tepsQuestionController.searchQuestions);

/**
 * @route   GET /api/teps-questions/stats
 * @desc    Get question bank statistics
 * @access  Private
 */
router.get('/stats', auth, tepsQuestionController.getQuestionBankStats);

/**
 * @route   GET /api/teps-questions/patterns/:section
 * @desc    Analyze official question patterns for a section
 * @access  Private (Admin/Instructor only)
 */
router.get(
  '/patterns/:section',
  auth,
  checkRole(['admin', 'instructor']),
  tepsQuestionController.analyzeOfficialPatterns
);

/**
 * @route   POST /api/teps-questions/bulk-import
 * @desc    Bulk import questions
 * @access  Private (Admin only)
 */
router.post(
  '/bulk-import',
  auth,
  checkRole(['admin']),
  tepsQuestionController.bulkImportQuestions
);

/**
 * @route   GET /api/teps-questions/:id
 * @desc    Get question by ID
 * @access  Private
 */
router.get('/:id', auth, tepsQuestionController.getQuestionById);

/**
 * @route   PUT /api/teps-questions/:id/status
 * @desc    Update question review status
 * @access  Private (Admin/Instructor only)
 */
router.put(
  '/:id/status',
  auth,
  checkRole(['admin', 'instructor']),
  tepsQuestionController.updateQuestionStatus
);

/**
 * @route   POST /api/teps-questions/submit-answer
 * @desc    Submit answer and update user profile
 * @access  Private
 */
router.post('/submit-answer', auth, tepsQuestionController.submitAnswer);

/**
 * @route   GET /api/teps-questions/adaptive/next
 * @desc    Get next adaptive question
 * @access  Private
 */
router.get('/adaptive/next', auth, tepsQuestionController.getNextAdaptiveQuestion);

export default router;
