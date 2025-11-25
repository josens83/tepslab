"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUserProfile = exports.generateStudyPlan = exports.getNextAdaptiveQuestion = exports.submitAnswer = exports.updateQuestionStatus = exports.bulkImportQuestions = exports.analyzeOfficialPatterns = exports.getQuestionBankStats = exports.getQuestionById = exports.searchQuestions = exports.generateQuestions = void 0;
const tepsQuestionBankService_1 = require("../services/tepsQuestionBankService");
const TEPSQuestion_1 = require("../models/TEPSQuestion");
const errorHandler_1 = require("../middleware/errorHandler");
const personalizedLearningEngine_1 = require("../services/personalizedLearningEngine");
const UserLearningProfile_1 = require("../models/UserLearningProfile");
/**
 * Generate questions using AI
 */
const generateQuestions = async (req, res, next) => {
    try {
        const { section, questionType, difficultyLevel, topic, count, style } = req.body;
        if (!section || !questionType || !difficultyLevel || !topic) {
            throw new errorHandler_1.ApiError(400, 'Missing required fields');
        }
        const questions = await tepsQuestionBankService_1.TEPSQuestionBankService.generateQuestionsWithAI({
            section,
            questionType,
            difficultyLevel,
            topic,
            count: count || 1,
            style: style || 'official',
        });
        res.json({
            success: true,
            message: `Generated ${questions.length} questions`,
            data: { questions },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateQuestions = generateQuestions;
/**
 * Search questions with filters
 */
const searchQuestions = async (req, res, next) => {
    try {
        const { section, questionType, difficultyLevel, topic, tags, isOfficialQuestion, reviewStatus, minQualityScore, limit = 50, skip = 0, } = req.query;
        const filter = {};
        if (section)
            filter.section = section;
        if (questionType)
            filter.questionType = questionType;
        if (difficultyLevel) {
            if (typeof difficultyLevel === 'string' && difficultyLevel.includes(',')) {
                filter.difficultyLevel = difficultyLevel.split(',').map(Number);
            }
            else {
                filter.difficultyLevel = Number(difficultyLevel);
            }
        }
        if (topic)
            filter.topic = topic;
        if (tags) {
            filter.tags = typeof tags === 'string' ? tags.split(',') : tags;
        }
        if (isOfficialQuestion !== undefined) {
            filter.isOfficialQuestion = isOfficialQuestion === 'true';
        }
        if (reviewStatus)
            filter.reviewStatus = reviewStatus;
        if (minQualityScore)
            filter.minQualityScore = Number(minQualityScore);
        const result = await tepsQuestionBankService_1.TEPSQuestionBankService.searchQuestions(filter, Number(limit), Number(skip));
        res.json({
            success: true,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.searchQuestions = searchQuestions;
/**
 * Get question by ID
 */
const getQuestionById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const question = await TEPSQuestion_1.TEPSQuestion.findById(id);
        if (!question) {
            throw new errorHandler_1.ApiError(404, 'Question not found');
        }
        res.json({
            success: true,
            data: { question },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestionById = getQuestionById;
/**
 * Get question bank statistics
 */
const getQuestionBankStats = async (req, res, next) => {
    try {
        const stats = await tepsQuestionBankService_1.TEPSQuestionBankService.getQuestionBankStats();
        res.json({
            success: true,
            data: stats,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getQuestionBankStats = getQuestionBankStats;
/**
 * Analyze official question patterns
 */
const analyzeOfficialPatterns = async (req, res, next) => {
    try {
        const { section } = req.params;
        if (!Object.values(TEPSQuestion_1.TEPSSection).includes(section)) {
            throw new errorHandler_1.ApiError(400, 'Invalid section');
        }
        const analysis = await tepsQuestionBankService_1.TEPSQuestionBankService.analyzeOfficialPatterns(section);
        res.json({
            success: true,
            data: analysis,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.analyzeOfficialPatterns = analyzeOfficialPatterns;
/**
 * Bulk import questions
 */
const bulkImportQuestions = async (req, res, next) => {
    try {
        const { questions, source } = req.body;
        if (!questions || !Array.isArray(questions)) {
            throw new errorHandler_1.ApiError(400, 'Invalid questions array');
        }
        if (!['official', 'manual', 'import'].includes(source)) {
            throw new errorHandler_1.ApiError(400, 'Invalid source');
        }
        const result = await tepsQuestionBankService_1.TEPSQuestionBankService.bulkImportQuestions(questions, source);
        res.json({
            success: true,
            message: `Imported ${result.imported} questions, ${result.failed} failed`,
            data: result,
        });
    }
    catch (error) {
        next(error);
    }
};
exports.bulkImportQuestions = bulkImportQuestions;
/**
 * Update question review status
 */
const updateQuestionStatus = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { reviewStatus, qualityScore } = req.body;
        const question = await TEPSQuestion_1.TEPSQuestion.findById(id);
        if (!question) {
            throw new errorHandler_1.ApiError(404, 'Question not found');
        }
        if (reviewStatus) {
            question.reviewStatus = reviewStatus;
            question.reviewedBy = req.user._id;
            question.reviewedAt = new Date();
        }
        if (qualityScore !== undefined) {
            question.qualityScore = qualityScore;
        }
        await question.save();
        res.json({
            success: true,
            message: 'Question updated successfully',
            data: { question },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.updateQuestionStatus = updateQuestionStatus;
/**
 * Submit question answer and update user profile
 */
const submitAnswer = async (req, res, next) => {
    try {
        const { questionId, userAnswer, timeSpent } = req.body;
        const userId = req.user._id.toString();
        if (!questionId || !userAnswer || timeSpent === undefined) {
            throw new errorHandler_1.ApiError(400, 'Missing required fields');
        }
        const question = await TEPSQuestion_1.TEPSQuestion.findById(questionId);
        if (!question) {
            throw new errorHandler_1.ApiError(404, 'Question not found');
        }
        const isCorrect = userAnswer === question.correctAnswer;
        // Get or create user learning profile
        let dbProfile = await UserLearningProfile_1.UserLearningProfile.findOne({ userId: req.user._id });
        if (!dbProfile) {
            const initialProfile = await personalizedLearningEngine_1.PersonalizedLearningEngine.initializeProfile(userId);
            dbProfile = await UserLearningProfile_1.UserLearningProfile.create({
                userId: req.user._id,
                ...initialProfile,
            });
        }
        // Convert to type for PersonalizedLearningEngine
        const profile = {
            userId,
            abilityEstimates: dbProfile.abilityEstimates,
            performanceHistory: dbProfile.performanceHistory,
            weakTopics: dbProfile.weakTopics,
            strongTopics: dbProfile.strongTopics,
            learningPatterns: dbProfile.learningPatterns,
            currentGoal: dbProfile.currentGoal,
            lastUpdated: dbProfile.updatedAt,
        };
        // Calculate user score from ability
        const userScore = 300 + profile.abilityEstimates.overall * 100;
        await question.updateStatistics(isCorrect, timeSpent, userScore);
        // Update profile with response
        const response = {
            questionId: question._id.toString(),
            question,
            userAnswer,
            isCorrect,
            timeSpent,
            timestamp: new Date(),
        };
        const updatedProfile = await personalizedLearningEngine_1.PersonalizedLearningEngine.updateProfileWithResponse(profile, response);
        // Save updated profile to database
        dbProfile.abilityEstimates = updatedProfile.abilityEstimates;
        dbProfile.performanceHistory = updatedProfile.performanceHistory;
        dbProfile.weakTopics = updatedProfile.weakTopics;
        dbProfile.strongTopics = updatedProfile.strongTopics;
        dbProfile.learningPatterns = updatedProfile.learningPatterns;
        await dbProfile.save();
        res.json({
            success: true,
            data: {
                isCorrect,
                correctAnswer: question.correctAnswer,
                explanation: question.explanation,
                keyPoints: question.keyPoints,
                tips: question.tips,
                updatedProfile: {
                    abilityEstimates: updatedProfile.abilityEstimates,
                    weakTopics: updatedProfile.weakTopics.slice(0, 5),
                    strongTopics: updatedProfile.strongTopics.slice(0, 5),
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.submitAnswer = submitAnswer;
/**
 * Get next adaptive question for user
 */
const getNextAdaptiveQuestion = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        // Get or create user learning profile
        let dbProfile = await UserLearningProfile_1.UserLearningProfile.findOne({ userId: req.user._id });
        if (!dbProfile) {
            const initialProfile = await personalizedLearningEngine_1.PersonalizedLearningEngine.initializeProfile(userId);
            dbProfile = await UserLearningProfile_1.UserLearningProfile.create({
                userId: req.user._id,
                ...initialProfile,
            });
        }
        // Convert to type for PersonalizedLearningEngine
        const profile = {
            userId,
            abilityEstimates: dbProfile.abilityEstimates,
            performanceHistory: dbProfile.performanceHistory,
            weakTopics: dbProfile.weakTopics,
            strongTopics: dbProfile.strongTopics,
            learningPatterns: dbProfile.learningPatterns,
            currentGoal: dbProfile.currentGoal,
            lastUpdated: dbProfile.updatedAt,
        };
        const question = await personalizedLearningEngine_1.PersonalizedLearningEngine.getNextQuestion(profile);
        if (!question) {
            throw new errorHandler_1.ApiError(404, 'No suitable question found');
        }
        res.json({
            success: true,
            data: {
                question: {
                    _id: question._id,
                    questionType: question.questionType,
                    section: question.section,
                    difficultyLevel: question.difficultyLevel,
                    questionText: question.questionText,
                    options: question.options,
                    audioResource: question.audioResource,
                    readingPassage: question.readingPassage,
                    imageUrl: question.imageUrl,
                    topic: question.topic,
                    tags: question.tags,
                },
            },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getNextAdaptiveQuestion = getNextAdaptiveQuestion;
/**
 * Generate personalized study plan
 */
const generateStudyPlan = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        const { goalScore, targetWeeks } = req.body;
        if (!goalScore) {
            throw new errorHandler_1.ApiError(400, 'Goal score is required');
        }
        // Get or create user learning profile
        let dbProfile = await UserLearningProfile_1.UserLearningProfile.findOne({ userId: req.user._id });
        if (!dbProfile) {
            const initialProfile = await personalizedLearningEngine_1.PersonalizedLearningEngine.initializeProfile(userId);
            dbProfile = await UserLearningProfile_1.UserLearningProfile.create({
                userId: req.user._id,
                ...initialProfile,
            });
        }
        // Convert to type for PersonalizedLearningEngine
        const profile = {
            userId,
            abilityEstimates: dbProfile.abilityEstimates,
            performanceHistory: dbProfile.performanceHistory,
            weakTopics: dbProfile.weakTopics,
            strongTopics: dbProfile.strongTopics,
            learningPatterns: dbProfile.learningPatterns,
            currentGoal: dbProfile.currentGoal,
            lastUpdated: dbProfile.updatedAt,
        };
        const studyPlan = await personalizedLearningEngine_1.PersonalizedLearningEngine.generateStudyPlan(profile, goalScore, targetWeeks || 12);
        res.json({
            success: true,
            data: { studyPlan },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.generateStudyPlan = generateStudyPlan;
/**
 * Get user learning profile
 */
const getUserProfile = async (req, res, next) => {
    try {
        const userId = req.user._id.toString();
        // Get or create user learning profile
        let dbProfile = await UserLearningProfile_1.UserLearningProfile.findOne({ userId: req.user._id });
        if (!dbProfile) {
            const initialProfile = await personalizedLearningEngine_1.PersonalizedLearningEngine.initializeProfile(userId);
            dbProfile = await UserLearningProfile_1.UserLearningProfile.create({
                userId: req.user._id,
                ...initialProfile,
            });
        }
        // Convert to type for response
        const profile = {
            userId,
            abilityEstimates: dbProfile.abilityEstimates,
            performanceHistory: dbProfile.performanceHistory,
            weakTopics: dbProfile.weakTopics,
            strongTopics: dbProfile.strongTopics,
            learningPatterns: dbProfile.learningPatterns,
            currentGoal: dbProfile.currentGoal,
            lastUpdated: dbProfile.updatedAt,
        };
        res.json({
            success: true,
            data: { profile },
        });
    }
    catch (error) {
        next(error);
    }
};
exports.getUserProfile = getUserProfile;
//# sourceMappingURL=tepsQuestionController.js.map