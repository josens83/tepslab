"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTutorStatus = exports.evaluatePronunciation = exports.generatePracticeQuestions = exports.analyzeWeakPoints = exports.explainQuestion = exports.chatWithTutor = void 0;
const aiTutorService_1 = require("../services/aiTutorService");
const openai_1 = require("../config/openai");
/**
 * Chat with AI tutor
 */
const chatWithTutor = async (req, res) => {
    try {
        if (!(0, openai_1.isOpenAIAvailable)()) {
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
        const response = await aiTutorService_1.aiTutorService.chat(message, conversationHistory, context);
        res.json({
            success: true,
            data: response,
        });
    }
    catch (error) {
        console.error('Chat with tutor error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to chat with AI tutor',
        });
    }
};
exports.chatWithTutor = chatWithTutor;
/**
 * Explain a question
 */
const explainQuestion = async (req, res) => {
    try {
        if (!(0, openai_1.isOpenAIAvailable)()) {
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
        const explanation = await aiTutorService_1.aiTutorService.explainQuestion(question, options, correctAnswer, userAnswer);
        res.json({
            success: true,
            data: { explanation },
        });
    }
    catch (error) {
        console.error('Explain question error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to explain question',
        });
    }
};
exports.explainQuestion = explainQuestion;
/**
 * Analyze weak points
 */
const analyzeWeakPoints = async (req, res) => {
    try {
        if (!(0, openai_1.isOpenAIAvailable)()) {
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
        const analysis = await aiTutorService_1.aiTutorService.analyzeWeakPoints(testResults);
        res.json({
            success: true,
            data: { analysis },
        });
    }
    catch (error) {
        console.error('Analyze weak points error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to analyze weak points',
        });
    }
};
exports.analyzeWeakPoints = analyzeWeakPoints;
/**
 * Generate practice questions
 */
const generatePracticeQuestions = async (req, res) => {
    try {
        if (!(0, openai_1.isOpenAIAvailable)()) {
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
        const questions = await aiTutorService_1.aiTutorService.generatePracticeQuestions(category, difficulty, count);
        res.json({
            success: true,
            data: { questions },
        });
    }
    catch (error) {
        console.error('Generate practice questions error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to generate practice questions',
        });
    }
};
exports.generatePracticeQuestions = generatePracticeQuestions;
/**
 * Evaluate pronunciation
 */
const evaluatePronunciation = async (req, res) => {
    try {
        if (!(0, openai_1.isOpenAIAvailable)()) {
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
        const evaluation = await aiTutorService_1.aiTutorService.evaluatePronunciation(targetText, transcribedText);
        res.json({
            success: true,
            data: evaluation,
        });
    }
    catch (error) {
        console.error('Evaluate pronunciation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to evaluate pronunciation',
        });
    }
};
exports.evaluatePronunciation = evaluatePronunciation;
/**
 * Get AI tutor availability
 */
const getTutorStatus = async (req, res) => {
    res.json({
        success: true,
        data: {
            available: (0, openai_1.isOpenAIAvailable)(),
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
exports.getTutorStatus = getTutorStatus;
//# sourceMappingURL=aiTutorController.js.map