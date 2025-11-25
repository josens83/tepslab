import express from 'express';
import * as advancedAIController from '../controllers/advancedAIController';
import { auth } from '../middleware/auth';

const router = express.Router();

// Writing Assessment Routes

/**
 * @route   POST /api/advanced-ai/writing
 * @desc    Submit writing for assessment
 * @access  Private
 */
router.post('/writing', auth, advancedAIController.submitWriting);

/**
 * @route   GET /api/advanced-ai/writing
 * @desc    Get user's writing submissions
 * @access  Private
 */
router.get('/writing', auth, advancedAIController.getWritingSubmissions);

/**
 * @route   GET /api/advanced-ai/writing/:id
 * @desc    Get specific writing submission
 * @access  Private
 */
router.get('/writing/:id', auth, advancedAIController.getWritingSubmission);

// Speaking Practice Routes

/**
 * @route   POST /api/advanced-ai/speaking
 * @desc    Submit speaking practice for assessment
 * @access  Private
 */
router.post('/speaking', auth, advancedAIController.submitSpeaking);

/**
 * @route   GET /api/advanced-ai/speaking
 * @desc    Get user's speaking practices
 * @access  Private
 */
router.get('/speaking', auth, advancedAIController.getSpeakingPractices);

// AI Conversation Routes

/**
 * @route   POST /api/advanced-ai/conversation
 * @desc    Start AI conversation
 * @access  Private
 */
router.post('/conversation', auth, advancedAIController.startConversation);

/**
 * @route   GET /api/advanced-ai/conversation
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversation', auth, advancedAIController.getConversations);

/**
 * @route   POST /api/advanced-ai/conversation/:id/message
 * @desc    Send message in conversation
 * @access  Private
 */
router.post('/conversation/:id/message', auth, advancedAIController.sendMessage);

/**
 * @route   POST /api/advanced-ai/conversation/:id/end
 * @desc    End conversation
 * @access  Private
 */
router.post('/conversation/:id/end', auth, advancedAIController.endConversation);

/**
 * @route   POST /api/advanced-ai/conversation/:id/rate
 * @desc    Rate conversation
 * @access  Private
 */
router.post('/conversation/:id/rate', auth, advancedAIController.rateConversation);

export default router;
