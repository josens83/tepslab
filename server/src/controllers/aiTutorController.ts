import { Request, Response } from 'express';
import { aiTutorService } from '../services/aiTutorService';
import { isOpenAIAvailable } from '../config/openai';

/**
 * Chat with AI tutor
 */
export const chatWithTutor = async (req: Request, res: Response) => {
  try {
    if (!isOpenAIAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI Tutor service is not available',
      });
    }

    const { message, conversationHistory, context } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Message is required',
      });
    }

    const response = await aiTutorService.chat(message, conversationHistory, context);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error('Chat with tutor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to chat with AI tutor',
    });
  }
};

/**
 * Explain a question
 */
export const explainQuestion = async (req: Request, res: Response) => {
  try {
    if (!isOpenAIAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI Tutor service is not available',
      });
    }

    const { question, options, correctAnswer, userAnswer } = req.body;

    if (!question || !options || !correctAnswer) {
      return res.status(400).json({
        success: false,
        message: 'Question, options, and correctAnswer are required',
      });
    }

    const explanation = await aiTutorService.explainQuestion(
      question,
      options,
      correctAnswer,
      userAnswer
    );

    res.json({
      success: true,
      data: { explanation },
    });
  } catch (error) {
    console.error('Explain question error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to explain question',
    });
  }
};

/**
 * Analyze weak points
 */
export const analyzeWeakPoints = async (req: Request, res: Response) => {
  try {
    if (!isOpenAIAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI Tutor service is not available',
      });
    }

    const { testResults } = req.body;

    if (!testResults || !Array.isArray(testResults)) {
      return res.status(400).json({
        success: false,
        message: 'Test results array is required',
      });
    }

    const analysis = await aiTutorService.analyzeWeakPoints(testResults);

    res.json({
      success: true,
      data: { analysis },
    });
  } catch (error) {
    console.error('Analyze weak points error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to analyze weak points',
    });
  }
};

/**
 * Generate practice questions
 */
export const generatePracticeQuestions = async (req: Request, res: Response) => {
  try {
    if (!isOpenAIAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI Tutor service is not available',
      });
    }

    const { category, difficulty, count = 5 } = req.body;

    if (!category || !difficulty) {
      return res.status(400).json({
        success: false,
        message: 'Category and difficulty are required',
      });
    }

    const questions = await aiTutorService.generatePracticeQuestions(
      category,
      difficulty,
      count
    );

    res.json({
      success: true,
      data: { questions },
    });
  } catch (error) {
    console.error('Generate practice questions error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate practice questions',
    });
  }
};

/**
 * Evaluate pronunciation
 */
export const evaluatePronunciation = async (req: Request, res: Response) => {
  try {
    if (!isOpenAIAvailable()) {
      return res.status(503).json({
        success: false,
        message: 'AI Tutor service is not available',
      });
    }

    const { targetText, transcribedText } = req.body;

    if (!targetText || !transcribedText) {
      return res.status(400).json({
        success: false,
        message: 'Target text and transcribed text are required',
      });
    }

    const evaluation = await aiTutorService.evaluatePronunciation(
      targetText,
      transcribedText
    );

    res.json({
      success: true,
      data: evaluation,
    });
  } catch (error) {
    console.error('Evaluate pronunciation error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to evaluate pronunciation',
    });
  }
};

/**
 * Get AI tutor availability
 */
export const getTutorStatus = async (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      available: isOpenAIAvailable(),
      features: {
        chat: true,
        questionExplanation: true,
        weakPointsAnalysis: true,
        practiceQuestions: true,
        pronunciationEvaluation: true,
      },
    },
  });
};
