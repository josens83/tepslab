import { Request, Response, NextFunction } from 'express';
import { TEPSExamService } from '../services/tepsExamService';
import { ExamType, ExamDifficulty } from '../models/TEPSExam';
import { TEPSSection } from '../models/TEPSQuestion';
import { ApiError } from '../middleware/errorHandler';

/**
 * Create official TEPS simulation exam
 */
export const createOfficialSimulation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { difficulty } = req.body;

    const attempt = await TEPSExamService.createOfficialSimulation(
      userId,
      difficulty || ExamDifficulty.ADAPTIVE
    );

    res.json({
      success: true,
      message: 'Official TEPS simulation created',
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create micro-learning session
 */
export const createMicroLearning = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { duration, section } = req.body;

    if (![5, 10, 15].includes(duration)) {
      throw new ApiError(400, 'Duration must be 5, 10, or 15 minutes');
    }

    const attempt = await TEPSExamService.createMicroLearningSession(
      userId,
      duration,
      section
    );

    res.json({
      success: true,
      message: `${duration}-minute micro-learning session created`,
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create section practice exam
 */
export const createSectionPractice = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { section, questionCount, difficulty } = req.body;

    if (!section) {
      throw new ApiError(400, 'Section is required');
    }

    if (!Object.values(TEPSSection).includes(section)) {
      throw new ApiError(400, 'Invalid section');
    }

    const attempt = await TEPSExamService.createSectionPractice(
      userId,
      section,
      questionCount || 30,
      difficulty || ExamDifficulty.ADAPTIVE
    );

    res.json({
      success: true,
      message: `${section} practice exam created`,
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Start exam
 */
export const startExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await TEPSExamService.startExam(attemptId);

    res.json({
      success: true,
      message: 'Exam started',
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exam questions
 */
export const getExamQuestions = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const examData = await TEPSExamService.getExamQuestions(attemptId);

    res.json({
      success: true,
      data: examData,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit answer
 */
export const submitAnswer = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { questionId, answer, timeSpent } = req.body;

    if (!questionId || !answer || timeSpent === undefined) {
      throw new ApiError(400, 'Missing required fields');
    }

    await TEPSExamService.submitAnswer(attemptId, questionId, answer, timeSpent);

    res.json({
      success: true,
      message: 'Answer submitted',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Pause exam
 */
export const pauseExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const TEPSExamAttempt = (await import('../models/TEPSExam')).TEPSExamAttempt;
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new ApiError(404, 'Exam attempt not found');
    }

    await attempt.pauseExam();

    res.json({
      success: true,
      message: 'Exam paused',
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Resume exam
 */
export const resumeExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const TEPSExamAttempt = (await import('../models/TEPSExam')).TEPSExamAttempt;
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new ApiError(404, 'Exam attempt not found');
    }

    await attempt.resumeExam();

    res.json({
      success: true,
      message: 'Exam resumed',
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Complete exam
 */
export const completeExam = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const attempt = await TEPSExamService.completeExam(attemptId);

    res.json({
      success: true,
      message: 'Exam completed',
      data: { attempt },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exam result
 */
export const getExamResult = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;

    const TEPSExamAttempt = (await import('../models/TEPSExam')).TEPSExamAttempt;
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new ApiError(404, 'Exam attempt not found');
    }

    if (!attempt.result) {
      throw new ApiError(400, 'Exam not completed yet');
    }

    res.json({
      success: true,
      data: { result: attempt.result },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get user exam history
 */
export const getExamHistory = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { examType, limit = 20, skip = 0 } = req.query;

    const history = await TEPSExamService.getUserExamHistory(
      userId,
      examType as ExamType,
      Number(limit),
      Number(skip)
    );

    res.json({
      success: true,
      data: history,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get exam statistics
 */
export const getExamStatistics = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const stats = await TEPSExamService.getExamStatistics(userId);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Report suspicious activity (tab switching, fullscreen exit)
 */
export const reportActivity = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { attemptId } = req.params;
    const { activityType } = req.body;

    const TEPSExamAttempt = (await import('../models/TEPSExam')).TEPSExamAttempt;
    const attempt = await TEPSExamAttempt.findById(attemptId);

    if (!attempt) {
      throw new ApiError(404, 'Exam attempt not found');
    }

    if (activityType === 'tab_switch') {
      attempt.tabSwitches += 1;
    } else if (activityType === 'fullscreen_exit') {
      attempt.fullscreenExits += 1;
    }

    // Mark as suspicious if too many violations
    if (attempt.tabSwitches >= 5 || attempt.fullscreenExits >= 3) {
      attempt.suspiciousActivity = true;
    }

    await attempt.save();

    res.json({
      success: true,
      message: 'Activity reported',
    });
  } catch (error) {
    next(error);
  }
};
