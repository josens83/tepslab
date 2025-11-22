import { Request, Response, NextFunction } from 'express';
import { TEPSQuestionBankService } from '../services/tepsQuestionBankService';
import {
  TEPSQuestion,
  ITEPSQuestion,
  TEPSSection,
  TEPSQuestionType,
  DifficultyLevel,
} from '../models/TEPSQuestion';
import { ApiError } from '../middleware/errorHandler';
import {
  PersonalizedLearningEngine,
  UserLearningProfile as UserLearningProfileType,
  QuestionResponse,
} from '../services/personalizedLearningEngine';
import { UserLearningProfile } from '../models/UserLearningProfile';

/**
 * Generate questions using AI
 */
export const generateQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { section, questionType, difficultyLevel, topic, count, style } = req.body;

    if (!section || !questionType || !difficultyLevel || !topic) {
      throw new ApiError(400, 'Missing required fields');
    }

    const questions = await TEPSQuestionBankService.generateQuestionsWithAI({
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
  } catch (error) {
    next(error);
  }
};

/**
 * Search questions with filters
 */
export const searchQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const {
      section,
      questionType,
      difficultyLevel,
      topic,
      tags,
      isOfficialQuestion,
      reviewStatus,
      minQualityScore,
      limit = 50,
      skip = 0,
    } = req.query;

    const filter: any = {};

    if (section) filter.section = section;
    if (questionType) filter.questionType = questionType;
    if (difficultyLevel) {
      if (typeof difficultyLevel === 'string' && difficultyLevel.includes(',')) {
        filter.difficultyLevel = difficultyLevel.split(',').map(Number);
      } else {
        filter.difficultyLevel = Number(difficultyLevel);
      }
    }
    if (topic) filter.topic = topic;
    if (tags) {
      filter.tags = typeof tags === 'string' ? tags.split(',') : tags;
    }
    if (isOfficialQuestion !== undefined) {
      filter.isOfficialQuestion = isOfficialQuestion === 'true';
    }
    if (reviewStatus) filter.reviewStatus = reviewStatus;
    if (minQualityScore) filter.minQualityScore = Number(minQualityScore);

    const result = await TEPSQuestionBankService.searchQuestions(
      filter,
      Number(limit),
      Number(skip)
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get question by ID
 */
export const getQuestionById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;

    const question = await TEPSQuestion.findById(id);

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    res.json({
      success: true,
      data: { question },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get question bank statistics
 */
export const getQuestionBankStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const stats = await TEPSQuestionBankService.getQuestionBankStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Analyze official question patterns
 */
export const analyzeOfficialPatterns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { section } = req.params;

    if (!Object.values(TEPSSection).includes(section as TEPSSection)) {
      throw new ApiError(400, 'Invalid section');
    }

    const analysis = await TEPSQuestionBankService.analyzeOfficialPatterns(
      section as TEPSSection
    );

    res.json({
      success: true,
      data: analysis,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Bulk import questions
 */
export const bulkImportQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questions, source } = req.body;

    if (!questions || !Array.isArray(questions)) {
      throw new ApiError(400, 'Invalid questions array');
    }

    if (!['official', 'manual', 'import'].includes(source)) {
      throw new ApiError(400, 'Invalid source');
    }

    const result = await TEPSQuestionBankService.bulkImportQuestions(questions, source);

    res.json({
      success: true,
      message: `Imported ${result.imported} questions, ${result.failed} failed`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update question review status
 */
export const updateQuestionStatus = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const { reviewStatus, qualityScore } = req.body;

    const question = await TEPSQuestion.findById(id);

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    if (reviewStatus) {
      question.reviewStatus = reviewStatus;
      question.reviewedBy = (req as any).user._id;
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
  } catch (error) {
    next(error);
  }
};

/**
 * Submit question answer and update user profile
 */
export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { questionId, userAnswer, timeSpent } = req.body;
    const userId = (req as any).user._id.toString();

    if (!questionId || !userAnswer || timeSpent === undefined) {
      throw new ApiError(400, 'Missing required fields');
    }

    const question = await TEPSQuestion.findById(questionId);

    if (!question) {
      throw new ApiError(404, 'Question not found');
    }

    const isCorrect = userAnswer === question.correctAnswer;

    // Get or create user learning profile
    let dbProfile = await UserLearningProfile.findOne({ userId: (req as any).user._id });

    if (!dbProfile) {
      const initialProfile = await PersonalizedLearningEngine.initializeProfile(userId);
      dbProfile = await UserLearningProfile.create({
        userId: (req as any).user._id,
        ...initialProfile,
      });
    }

    // Convert to type for PersonalizedLearningEngine
    const profile: UserLearningProfileType = {
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
    const response: QuestionResponse = {
      questionId: question._id.toString(),
      question,
      userAnswer,
      isCorrect,
      timeSpent,
      timestamp: new Date(),
    };

    const updatedProfile = await PersonalizedLearningEngine.updateProfileWithResponse(profile, response);

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
  } catch (error) {
    next(error);
  }
};

/**
 * Get next adaptive question for user
 */
export const getNextAdaptiveQuestion = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    // Get or create user learning profile
    let dbProfile = await UserLearningProfile.findOne({ userId: (req as any).user._id });

    if (!dbProfile) {
      const initialProfile = await PersonalizedLearningEngine.initializeProfile(userId);
      dbProfile = await UserLearningProfile.create({
        userId: (req as any).user._id,
        ...initialProfile,
      });
    }

    // Convert to type for PersonalizedLearningEngine
    const profile: UserLearningProfileType = {
      userId,
      abilityEstimates: dbProfile.abilityEstimates,
      performanceHistory: dbProfile.performanceHistory,
      weakTopics: dbProfile.weakTopics,
      strongTopics: dbProfile.strongTopics,
      learningPatterns: dbProfile.learningPatterns,
      currentGoal: dbProfile.currentGoal,
      lastUpdated: dbProfile.updatedAt,
    };

    const question = await PersonalizedLearningEngine.getNextQuestion(profile);

    if (!question) {
      throw new ApiError(404, 'No suitable question found');
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
  } catch (error) {
    next(error);
  }
};

/**
 * Generate personalized study plan
 */
export const generateStudyPlan = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { goalScore, targetWeeks } = req.body;

    if (!goalScore) {
      throw new ApiError(400, 'Goal score is required');
    }

    // Get or create user learning profile
    let dbProfile = await UserLearningProfile.findOne({ userId: (req as any).user._id });

    if (!dbProfile) {
      const initialProfile = await PersonalizedLearningEngine.initializeProfile(userId);
      dbProfile = await UserLearningProfile.create({
        userId: (req as any).user._id,
        ...initialProfile,
      });
    }

    // Convert to type for PersonalizedLearningEngine
    const profile: UserLearningProfileType = {
      userId,
      abilityEstimates: dbProfile.abilityEstimates,
      performanceHistory: dbProfile.performanceHistory,
      weakTopics: dbProfile.weakTopics,
      strongTopics: dbProfile.strongTopics,
      learningPatterns: dbProfile.learningPatterns,
      currentGoal: dbProfile.currentGoal,
      lastUpdated: dbProfile.updatedAt,
    };

    const studyPlan = await PersonalizedLearningEngine.generateStudyPlan(
      profile,
      goalScore,
      targetWeeks || 12
    );

    res.json({
      success: true,
      data: { studyPlan },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user learning profile
 */
export const getUserProfile = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    // Get or create user learning profile
    let dbProfile = await UserLearningProfile.findOne({ userId: (req as any).user._id });

    if (!dbProfile) {
      const initialProfile = await PersonalizedLearningEngine.initializeProfile(userId);
      dbProfile = await UserLearningProfile.create({
        userId: (req as any).user._id,
        ...initialProfile,
      });
    }

    // Convert to type for response
    const profile: UserLearningProfileType = {
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
  } catch (error) {
    next(error);
  }
};
