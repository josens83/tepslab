import express from 'express';
import {
  chatWithTutor,
  explainQuestion,
  analyzeWeakPoints,
  generatePracticeQuestions,
  evaluatePronunciation,
  getTutorStatus,
} from '../controllers/aiTutorController';
import { protect } from '../middleware/authMiddleware';

const router = express.Router();

// All routes are protected (require authentication)
router.use(protect);

// AI Tutor status
router.get('/status', getTutorStatus);

// Chat with AI tutor
router.post('/chat', chatWithTutor);

// Explain a question
router.post('/explain', explainQuestion);

// Analyze weak points
router.post('/analyze', analyzeWeakPoints);

// Generate practice questions
router.post('/generate-questions', generatePracticeQuestions);

// Evaluate pronunciation
router.post('/evaluate-pronunciation', evaluatePronunciation);

export default router;
