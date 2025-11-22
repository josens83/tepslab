import { Router } from 'express';
import * as tepsExamController from '../controllers/tepsExamController';
import { auth } from '../middleware/auth';

const router = Router();

/**
 * @route   POST /api/teps-exams/official-simulation
 * @desc    Create official TEPS simulation exam
 * @access  Private
 */
router.post('/official-simulation', auth, tepsExamController.createOfficialSimulation);

/**
 * @route   POST /api/teps-exams/micro-learning
 * @desc    Create micro-learning session (5/10/15 minutes)
 * @access  Private
 */
router.post('/micro-learning', auth, tepsExamController.createMicroLearning);

/**
 * @route   POST /api/teps-exams/section-practice
 * @desc    Create section practice exam
 * @access  Private
 */
router.post('/section-practice', auth, tepsExamController.createSectionPractice);

/**
 * @route   POST /api/teps-exams/:attemptId/start
 * @desc    Start exam
 * @access  Private
 */
router.post('/:attemptId/start', auth, tepsExamController.startExam);

/**
 * @route   GET /api/teps-exams/:attemptId/questions
 * @desc    Get exam questions
 * @access  Private
 */
router.get('/:attemptId/questions', auth, tepsExamController.getExamQuestions);

/**
 * @route   POST /api/teps-exams/:attemptId/submit-answer
 * @desc    Submit answer
 * @access  Private
 */
router.post('/:attemptId/submit-answer', auth, tepsExamController.submitAnswer);

/**
 * @route   POST /api/teps-exams/:attemptId/pause
 * @desc    Pause exam
 * @access  Private
 */
router.post('/:attemptId/pause', auth, tepsExamController.pauseExam);

/**
 * @route   POST /api/teps-exams/:attemptId/resume
 * @desc    Resume exam
 * @access  Private
 */
router.post('/:attemptId/resume', auth, tepsExamController.resumeExam);

/**
 * @route   POST /api/teps-exams/:attemptId/complete
 * @desc    Complete exam
 * @access  Private
 */
router.post('/:attemptId/complete', auth, tepsExamController.completeExam);

/**
 * @route   GET /api/teps-exams/:attemptId/result
 * @desc    Get exam result
 * @access  Private
 */
router.get('/:attemptId/result', auth, tepsExamController.getExamResult);

/**
 * @route   GET /api/teps-exams/history
 * @desc    Get user exam history
 * @access  Private
 */
router.get('/history', auth, tepsExamController.getExamHistory);

/**
 * @route   GET /api/teps-exams/statistics
 * @desc    Get exam statistics
 * @access  Private
 */
router.get('/statistics', auth, tepsExamController.getExamStatistics);

/**
 * @route   POST /api/teps-exams/:attemptId/report-activity
 * @desc    Report suspicious activity
 * @access  Private
 */
router.post('/:attemptId/report-activity', auth, tepsExamController.reportActivity);

export default router;
