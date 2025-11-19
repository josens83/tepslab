import { Router } from 'express';
import {
  getTests,
  getTestById,
  submitTest,
  getTestResult,
  getMyTestResults,
  createTest,
} from '../controllers/testController';
import { authenticate, requireAdmin } from '../middleware/auth';

const router = Router();

/**
 * @route   GET /api/tests
 * @desc    Get all available tests
 * @access  Public
 */
router.get('/', getTests);

/**
 * @route   GET /api/tests/:id
 * @desc    Get test by ID (with questions)
 * @access  Private
 */
router.get('/:id', authenticate, getTestById);

/**
 * @route   POST /api/tests/:id/submit
 * @desc    Submit test answers
 * @access  Private
 */
router.post('/:id/submit', authenticate, submitTest);

/**
 * @route   GET /api/test-results
 * @desc    Get user's test results
 * @access  Private
 */
router.get('/results/my', authenticate, getMyTestResults);

/**
 * @route   GET /api/test-results/:id
 * @desc    Get specific test result
 * @access  Private
 */
router.get('/results/:id', authenticate, getTestResult);

/**
 * @route   POST /api/tests
 * @desc    Create a new test (admin only)
 * @access  Admin
 */
router.post('/', authenticate, requireAdmin, createTest);

export default router;
