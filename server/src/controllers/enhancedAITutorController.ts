import { Request, Response, NextFunction } from 'express';
import { EnhancedAITutorService } from '../services/enhancedAITutorService';
import { SessionType, AITutorSession } from '../models/AITutorSession';
import { CoachingType } from '../models/LearningCoachSession';
import { ApiError } from '../middleware/errorHandler';

/**
 * Start AI tutor session
 */
export const startSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { sessionType } = req.body;

    const session = await EnhancedAITutorService.startSession(
      userId,
      sessionType || SessionType.GENERAL_QA
    );

    res.json({
      success: true,
      message: 'AI tutor session started',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Chat with AI tutor
 */
export const chat = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { message } = req.body;

    if (!message) {
      throw new ApiError(400, 'Message is required');
    }

    const response = await EnhancedAITutorService.chat(sessionId, message);

    res.json({
      success: true,
      data: response,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * End AI tutor session
 */
export const endSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { sessionId } = req.params;
    const { satisfaction, helpfulness } = req.body;

    await EnhancedAITutorService.endSession(sessionId, {
      satisfaction,
      helpfulness,
    });

    res.json({
      success: true,
      message: 'Session ended successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get active session
 */
export const getActiveSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const session = await AITutorSession.findOne({
      userId,
      isActive: true,
    }).sort({ startedAt: -1 });

    res.json({
      success: true,
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session history
 */
export const getSessionHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { limit = 20, skip = 0 } = req.query;

    const sessions = await AITutorSession.find({ userId })
      .sort({ startedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await AITutorSession.countDocuments({ userId });

    res.json({
      success: true,
      data: { sessions, total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Generate weekly coaching report
 */
export const getWeeklyReport = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const report = await EnhancedAITutorService.generateWeeklyReport(userId);

    res.json({
      success: true,
      data: { report },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create coaching session
 */
export const createCoachingSession = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { coachingType } = req.body;

    if (!coachingType) {
      throw new ApiError(400, 'Coaching type is required');
    }

    const session = await EnhancedAITutorService.createCoachingSession(
      userId,
      coachingType
    );

    res.json({
      success: true,
      message: 'Coaching session created',
      data: { session },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add learning habit
 */
export const addHabit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { habitName, description, frequency, targetDays, targetTime } = req.body;

    if (!habitName || !description || !frequency) {
      throw new ApiError(400, 'Missing required fields');
    }

    await EnhancedAITutorService.addLearningHabit(
      userId,
      habitName,
      description,
      frequency,
      targetDays || [],
      targetTime
    );

    res.json({
      success: true,
      message: 'Learning habit added',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get daily motivation
 */
export const getDailyMotivation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const motivation = await EnhancedAITutorService.sendDailyMotivation(userId);

    res.json({
      success: true,
      data: { motivation },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get coaching session history
 */
export const getCoachingSessions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { limit = 10, skip = 0 } = req.query;

    const LearningCoachSession = (
      await import('../models/LearningCoachSession')
    ).LearningCoachSession;

    const sessions = await LearningCoachSession.find({ userId })
      .sort({ conductedAt: -1 })
      .limit(Number(limit))
      .skip(Number(skip));

    const total = await LearningCoachSession.countDocuments({ userId });

    res.json({
      success: true,
      data: { sessions, total },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update habit completion
 */
export const completeHabit = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id;
    const { habitName } = req.body;

    if (!habitName) {
      throw new ApiError(400, 'Habit name is required');
    }

    const LearningCoachSession = (
      await import('../models/LearningCoachSession')
    ).LearningCoachSession;

    const session = await LearningCoachSession.findOne({ userId }).sort({
      createdAt: -1,
    });

    if (!session) {
      throw new ApiError(404, 'No coaching session found');
    }

    await session.updateHabitStreak(habitName);

    res.json({
      success: true,
      message: 'Habit completion recorded',
      data: {
        habitCompletionRate: session.habitCompletionRate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get session analytics
 */
export const getSessionAnalytics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id;

    const totalSessions = await AITutorSession.countDocuments({ userId });
    const activeSessions = await AITutorSession.countDocuments({
      userId,
      isActive: true,
    });

    const sessions = await AITutorSession.find({ userId });

    let totalMessages = 0;
    let totalSatisfaction = 0;
    let satisfactionCount = 0;

    sessions.forEach((session) => {
      totalMessages += session.metrics.totalMessages;
      if (session.metrics.userSatisfaction) {
        totalSatisfaction += session.metrics.userSatisfaction;
        satisfactionCount += 1;
      }
    });

    const avgSatisfaction =
      satisfactionCount > 0 ? totalSatisfaction / satisfactionCount : 0;

    const sessionsByType: Record<string, number> = {};
    sessions.forEach((session) => {
      sessionsByType[session.sessionType] =
        (sessionsByType[session.sessionType] || 0) + 1;
    });

    res.json({
      success: true,
      data: {
        totalSessions,
        activeSessions,
        totalMessages,
        averageSatisfaction: avgSatisfaction,
        sessionsByType,
      },
    });
  } catch (error) {
    next(error);
  }
};
