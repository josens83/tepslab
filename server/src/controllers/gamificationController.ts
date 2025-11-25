import { Request, Response, NextFunction } from 'express';
import { GamificationService } from '../services/gamificationService';
import { ChallengeType, LeaderboardType, LeaderboardMetric } from '../models/Gamification';
import mongoose from 'mongoose';

// Level & XP Controllers

export const getUserLevel = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const userLevel = await GamificationService.getUserLevel(userId);

    res.json({
      success: true,
      data: userLevel
    });
  } catch (error) {
    next(error);
  }
};

export const getUserStats = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const stats = await GamificationService.getUserGamificationStats(userId);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// Achievement Controllers

export const getAchievements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const includeHidden = req.query.includeHidden === 'true';
    const achievements = await GamificationService.getAchievements(includeHidden);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

export const getUserAchievements = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const achievements = await GamificationService.getUserAchievements(userId);

    res.json({
      success: true,
      data: achievements
    });
  } catch (error) {
    next(error);
  }
};

export const markAchievementViewed = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const { achievementCode } = req.params;

    const achievement = await GamificationService.markAchievementAsViewed(
      userId,
      achievementCode
    );

    res.json({
      success: true,
      data: achievement
    });
  } catch (error) {
    next(error);
  }
};

// Challenge Controllers

export const getActiveChallenges = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = req.query.type as ChallengeType | undefined;
    const challenges = await GamificationService.getActiveChallenges(type);

    res.json({
      success: true,
      data: challenges
    });
  } catch (error) {
    next(error);
  }
};

export const getUserChallengeProgress = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const challengeId = req.params.challengeId
      ? new mongoose.Types.ObjectId(req.params.challengeId)
      : undefined;

    const progress = await GamificationService.getUserChallengeProgress(
      userId,
      challengeId
    );

    res.json({
      success: true,
      data: progress
    });
  } catch (error) {
    next(error);
  }
};

export const claimChallengeRewards = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const challengeId = new mongoose.Types.ObjectId(req.params.id);

    const result = await GamificationService.claimChallengeRewards(userId, challengeId);

    res.json({
      success: true,
      message: 'Rewards claimed successfully',
      data: result
    });
  } catch (error) {
    next(error);
  }
};

// Leaderboard Controllers

export const getLeaderboard = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const type = req.query.type as LeaderboardType || LeaderboardType.GLOBAL;
    const metric = req.query.metric as LeaderboardMetric || LeaderboardMetric.XP;
    const limit = Number(req.query.limit) || 100;

    let period: string | undefined;
    if (type === LeaderboardType.WEEKLY) {
      period = GamificationService.getCurrentPeriod('weekly');
    } else if (type === LeaderboardType.MONTHLY) {
      period = GamificationService.getCurrentPeriod('monthly');
    }

    const leaderboard = await GamificationService.getLeaderboard(type, metric, period, limit);

    res.json({
      success: true,
      data: {
        type,
        metric,
        period,
        entries: leaderboard
      }
    });
  } catch (error) {
    next(error);
  }
};

export const getUserLeaderboardPosition = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const userId = new mongoose.Types.ObjectId(req.user!.userId);
    const type = req.query.type as LeaderboardType || LeaderboardType.GLOBAL;
    const metric = req.query.metric as LeaderboardMetric || LeaderboardMetric.XP;

    let period: string | undefined;
    if (type === LeaderboardType.WEEKLY) {
      period = GamificationService.getCurrentPeriod('weekly');
    } else if (type === LeaderboardType.MONTHLY) {
      period = GamificationService.getCurrentPeriod('monthly');
    }

    const position = await GamificationService.getUserLeaderboardPosition(
      userId,
      type,
      metric,
      period
    );

    res.json({
      success: true,
      data: position
    });
  } catch (error) {
    next(error);
  }
};

// Admin Controllers

export const createAchievement = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const achievement = await GamificationService.createAchievement(req.body);

    res.status(201).json({
      success: true,
      message: 'Achievement created successfully',
      data: achievement
    });
  } catch (error) {
    next(error);
  }
};

export const createChallenge = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const challenge = await GamificationService.createChallenge(req.body);

    res.status(201).json({
      success: true,
      message: 'Challenge created successfully',
      data: challenge
    });
  } catch (error) {
    next(error);
  }
};
