import { Request, Response, NextFunction } from 'express';
import { LearningAnalyticsService } from '../services/learningAnalyticsService';
import { ApiError } from '../middleware/errorHandler';

/**
 * Get dashboard data
 */
export const getDashboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const dashboard = await LearningAnalyticsService.generateDashboard(userId);

    res.json({
      success: true,
      data: dashboard,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get analytics summary
 */
export const getAnalyticsSummary = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const analytics = await LearningAnalyticsService.getOrCreateAnalytics(userId);
    await LearningAnalyticsService.updateAnalytics(userId);

    res.json({
      success: true,
      data: {
        currentScore: analytics.currentScore,
        scoreChange30Days: analytics.scoreChange30Days,
        scoreChange90Days: analytics.scoreChange90Days,
        totalQuestionsAttempted: analytics.totalQuestionsAttempted,
        averageAccuracy: Math.round(analytics.averageAccuracy * 10) / 10,
        strongestSection: analytics.strongestSection,
        weakestSection: analytics.weakestSection,
        lastCalculated: analytics.lastCalculatedAt,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get score prediction
 */
export const getScorePrediction = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { targetDays = 30 } = req.query;

    const analytics = await LearningAnalyticsService.getOrCreateAnalytics(userId);
    const prediction = analytics.predictScore(Number(targetDays));

    res.json({
      success: true,
      data: { prediction },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get peer comparison
 */
export const getPeerComparison = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const analytics = await LearningAnalyticsService.getOrCreateAnalytics(userId);
    const peerComparison = await analytics.compareWithPeers();

    res.json({
      success: true,
      data: { peerComparison },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add learning goal
 */
export const addGoal = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { targetScore, targetDate } = req.body;

    if (!targetScore || !targetDate) {
      throw new ApiError(400, 'Target score and date are required');
    }

    await LearningAnalyticsService.addGoal(
      userId,
      targetScore,
      new Date(targetDate)
    );

    res.json({
      success: true,
      message: 'Goal added successfully',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get insights
 */
export const getInsights = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const insights = await LearningAnalyticsService.getInsights(userId);

    res.json({
      success: true,
      data: insights,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Check milestones
 */
export const checkMilestones = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    await LearningAnalyticsService.checkMilestones(userId);

    const analytics = await LearningAnalyticsService.getOrCreateAnalytics(userId);

    res.json({
      success: true,
      data: {
        milestones: analytics.milestones.slice(-10).reverse(),
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get section performance details
 */
export const getSectionPerformance = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const analytics = await LearningAnalyticsService.updateAnalytics(userId);

    res.json({
      success: true,
      data: {
        sectionPerformance: analytics.sectionPerformance,
        strongestSection: analytics.strongestSection,
        weakestSection: analytics.weakestSection,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get study patterns
 */
export const getStudyPatterns = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();

    const analytics = await LearningAnalyticsService.updateAnalytics(userId);

    res.json({
      success: true,
      data: {
        studyTimeDistribution: analytics.studyTimeDistribution,
        mostProductiveTime: analytics.mostProductiveTime,
        learningVelocity: analytics.learningVelocity,
        totalStudyTime: analytics.totalStudyTime,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get score trends
 */
export const getScoreTrends = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = (req as any).user._id.toString();
    const { days = 90 } = req.query;

    const analytics = await LearningAnalyticsService.updateAnalytics(userId);

    const cutoffDate = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    const filteredTrends = analytics.scoreTrends.filter((t) => t.date >= cutoffDate);

    res.json({
      success: true,
      data: {
        trends: filteredTrends,
        currentScore: analytics.currentScore,
        highestScore: analytics.highestScore,
        lowestScore: analytics.lowestScore,
      },
    });
  } catch (error) {
    next(error);
  }
};
