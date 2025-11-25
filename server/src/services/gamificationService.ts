import {
  AchievementDefinition,
  UserAchievement,
  UserLevel,
  Challenge,
  UserChallengeProgress,
  LeaderboardEntry,
  IAchievementDefinition,
  IUserAchievement,
  IUserLevel,
  IChallenge,
  IUserChallengeProgress,
  ILeaderboardEntry,
  AchievementType,
  ChallengeType,
  ChallengeStatus,
  LeaderboardType,
  LeaderboardMetric
} from '../models/Gamification';
import mongoose from 'mongoose';

/**
 * Gamification Service
 */
export class GamificationService {
  /**
   * Initialize user level (called on user registration)
   */
  static async initializeUserLevel(userId: mongoose.Types.ObjectId): Promise<IUserLevel> {
    const existing = await UserLevel.findOne({ userId });
    if (existing) return existing;

    const userLevel = new UserLevel({
      userId,
      level: 1,
      currentXP: 0,
      totalXP: 0,
      xpToNextLevel: 100,
      coins: 0,
      stats: {
        achievementsUnlocked: 0,
        challengesCompleted: 0,
        currentStreak: 0,
        longestStreak: 0
      }
    });

    await userLevel.save();
    return userLevel;
  }

  /**
   * Get user level and stats
   */
  static async getUserLevel(userId: mongoose.Types.ObjectId): Promise<IUserLevel> {
    let userLevel = await UserLevel.findOne({ userId });

    if (!userLevel) {
      userLevel = await this.initializeUserLevel(userId);
    }

    return userLevel;
  }

  /**
   * Add XP to user (with level up handling)
   */
  static async addXP(
    userId: mongoose.Types.ObjectId,
    xp: number,
    reason: string
  ): Promise<{ userLevel: IUserLevel; leveledUp: boolean; newLevel?: number }> {
    const userLevel = await this.getUserLevel(userId);
    const oldLevel = userLevel.level;

    userLevel.addXP(xp);
    await userLevel.save();

    const leveledUp = userLevel.level > oldLevel;

    return {
      userLevel,
      leveledUp,
      newLevel: leveledUp ? userLevel.level : undefined
    };
  }

  /**
   * Add coins to user
   */
  static async addCoins(
    userId: mongoose.Types.ObjectId,
    coins: number
  ): Promise<IUserLevel> {
    const userLevel = await this.getUserLevel(userId);
    userLevel.addCoins(coins);
    await userLevel.save();
    return userLevel;
  }

  /**
   * Spend coins
   */
  static async spendCoins(
    userId: mongoose.Types.ObjectId,
    coins: number
  ): Promise<IUserLevel> {
    const userLevel = await this.getUserLevel(userId);

    if (userLevel.coins < coins) {
      throw new Error('Insufficient coins');
    }

    userLevel.coins -= coins;
    await userLevel.save();
    return userLevel;
  }

  // Achievement Management

  /**
   * Create achievement definition (admin)
   */
  static async createAchievement(
    achievementData: Partial<IAchievementDefinition>
  ): Promise<IAchievementDefinition> {
    const achievement = new AchievementDefinition(achievementData);
    await achievement.save();
    return achievement;
  }

  /**
   * Get all achievements
   */
  static async getAchievements(includeHidden: boolean = false): Promise<IAchievementDefinition[]> {
    const query: any = { isActive: true };
    if (!includeHidden) {
      query.isHidden = false;
    }

    return AchievementDefinition.find(query).sort({ order: 1, rarity: 1 });
  }

  /**
   * Get user's achievement progress
   */
  static async getUserAchievements(
    userId: mongoose.Types.ObjectId
  ): Promise<IUserAchievement[]> {
    return UserAchievement.find({ userId }).sort({ unlockedAt: -1, createdAt: -1 });
  }

  /**
   * Check and unlock achievements for user
   */
  static async checkAchievements(
    userId: mongoose.Types.ObjectId,
    userStats: {
      score?: number;
      streak?: number;
      questions?: number;
      studyTime?: number;
      accuracy?: number;
      [key: string]: number | undefined;
    }
  ): Promise<{ newlyUnlocked: IUserAchievement[]; updated: IUserAchievement[] }> {
    const achievements = await AchievementDefinition.find({ isActive: true });
    const newlyUnlocked: IUserAchievement[] = [];
    const updated: IUserAchievement[] = [];

    for (const achievement of achievements) {
      // Check if user meets requirements
      let meetsRequirements = true;
      let currentValue = 0;

      for (const req of achievement.requirements) {
        const userValue = userStats[req.metric] || 0;
        currentValue = userValue;

        switch (req.comparison) {
          case 'gte':
            if (userValue < req.value) meetsRequirements = false;
            break;
          case 'lte':
            if (userValue > req.value) meetsRequirements = false;
            break;
          case 'eq':
            if (userValue !== req.value) meetsRequirements = false;
            break;
        }

        if (!meetsRequirements) break;
      }

      // Get or create user achievement
      let userAchievement = await UserAchievement.findOne({
        userId,
        achievementCode: achievement.code
      });

      const targetValue = achievement.requirements[0]?.value || 1;

      if (!userAchievement) {
        userAchievement = new UserAchievement({
          userId,
          achievementCode: achievement.code,
          progress: 0,
          currentValue: 0,
          targetValue,
          isUnlocked: false
        });
      }

      // Update progress
      userAchievement.currentValue = currentValue;
      userAchievement.progress = Math.min(100, (currentValue / targetValue) * 100);

      // Unlock if requirements met and not already unlocked
      if (meetsRequirements && !userAchievement.isUnlocked) {
        userAchievement.isUnlocked = true;
        userAchievement.unlockedAt = new Date();

        // Award rewards
        await this.addXP(userId, achievement.rewards.xp, `Achievement: ${achievement.name}`);
        if (achievement.rewards.coins) {
          await this.addCoins(userId, achievement.rewards.coins);
        }

        // Update stats
        const userLevel = await this.getUserLevel(userId);
        userLevel.stats.achievementsUnlocked += 1;
        await userLevel.save();

        newlyUnlocked.push(userAchievement);
      } else {
        updated.push(userAchievement);
      }

      await userAchievement.save();
    }

    return { newlyUnlocked, updated };
  }

  /**
   * Mark achievement as viewed
   */
  static async markAchievementAsViewed(
    userId: mongoose.Types.ObjectId,
    achievementCode: string
  ): Promise<IUserAchievement | null> {
    const userAchievement = await UserAchievement.findOne({ userId, achievementCode });

    if (userAchievement && !userAchievement.isViewed) {
      userAchievement.isViewed = true;
      userAchievement.viewedAt = new Date();
      await userAchievement.save();
    }

    return userAchievement;
  }

  // Challenge Management

  /**
   * Create challenge (admin)
   */
  static async createChallenge(challengeData: Partial<IChallenge>): Promise<IChallenge> {
    const challenge = new Challenge(challengeData);
    await challenge.save();
    return challenge;
  }

  /**
   * Get active challenges
   */
  static async getActiveChallenges(type?: ChallengeType): Promise<IChallenge[]> {
    const now = new Date();
    const query: any = {
      status: ChallengeStatus.ACTIVE,
      startDate: { $lte: now },
      endDate: { $gte: now }
    };

    if (type) {
      query.type = type;
    }

    return Challenge.find(query).sort({ endDate: 1 });
  }

  /**
   * Get user's challenge progress
   */
  static async getUserChallengeProgress(
    userId: mongoose.Types.ObjectId,
    challengeId?: mongoose.Types.ObjectId
  ): Promise<IUserChallengeProgress[]> {
    const query: any = { userId };
    if (challengeId) {
      query.challengeId = challengeId;
    }

    return UserChallengeProgress.find(query)
      .populate('challengeId')
      .sort({ createdAt: -1 });
  }

  /**
   * Update challenge progress
   */
  static async updateChallengeProgress(
    userId: mongoose.Types.ObjectId,
    challengeId: mongoose.Types.ObjectId,
    progressData: { [key: string]: number }
  ): Promise<IUserChallengeProgress> {
    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    let userProgress = await UserChallengeProgress.findOne({ userId, challengeId });

    if (!userProgress) {
      userProgress = new UserChallengeProgress({
        userId,
        challengeId,
        progress: challenge.requirements.map(req => ({
          type: req.type,
          current: 0,
          target: req.target,
          percentage: 0
        })),
        isCompleted: false,
        rewardsClaimed: false
      });
    }

    // Update progress for each requirement
    for (const req of challenge.requirements) {
      const progressItem = userProgress.progress.find(p => p.type === req.type);
      if (progressItem && progressData[req.type] !== undefined) {
        progressItem.current = progressData[req.type];
        progressItem.percentage = Math.min(100, (progressItem.current / progressItem.target) * 100);
      }
    }

    // Check if completed
    const allCompleted = userProgress.progress.every(p => p.percentage >= 100);

    if (allCompleted && !userProgress.isCompleted) {
      userProgress.isCompleted = true;
      userProgress.completedAt = new Date();

      // Add to challenge completions
      if (!challenge.completions) challenge.completions = [];
      challenge.completions.push({
        userId,
        completedAt: new Date()
      });
      await challenge.save();
    }

    await userProgress.save();
    return userProgress;
  }

  /**
   * Claim challenge rewards
   */
  static async claimChallengeRewards(
    userId: mongoose.Types.ObjectId,
    challengeId: mongoose.Types.ObjectId
  ): Promise<{ userLevel: IUserLevel; rewards: any }> {
    const userProgress = await UserChallengeProgress.findOne({ userId, challengeId });

    if (!userProgress) {
      throw new Error('Challenge progress not found');
    }

    if (!userProgress.isCompleted) {
      throw new Error('Challenge not completed yet');
    }

    if (userProgress.rewardsClaimed) {
      throw new Error('Rewards already claimed');
    }

    const challenge = await Challenge.findById(challengeId);
    if (!challenge) {
      throw new Error('Challenge not found');
    }

    // Award rewards
    const { userLevel } = await this.addXP(userId, challenge.rewards.xp, `Challenge: ${challenge.title}`);
    await this.addCoins(userId, challenge.rewards.coins);

    // Update stats
    userLevel.stats.challengesCompleted += 1;
    await userLevel.save();

    // Mark as claimed
    userProgress.rewardsClaimed = true;
    userProgress.claimedAt = new Date();
    await userProgress.save();

    return {
      userLevel,
      rewards: challenge.rewards
    };
  }

  // Leaderboard Management

  /**
   * Update leaderboard entry for user
   */
  static async updateLeaderboard(
    userId: mongoose.Types.ObjectId,
    type: LeaderboardType,
    metric: LeaderboardMetric,
    value: number,
    period?: string
  ): Promise<void> {
    const query: any = { userId, type, metric };
    if (period) {
      query.period = period;
    }

    let entry = await LeaderboardEntry.findOne(query);

    if (!entry) {
      entry = new LeaderboardEntry({
        userId,
        type,
        metric,
        value,
        rank: 0,
        period
      });
    } else {
      entry.value = value;
    }

    await entry.save();

    // Recalculate ranks for this leaderboard
    await this.recalculateRanks(type, metric, period);
  }

  /**
   * Recalculate leaderboard ranks
   */
  static async recalculateRanks(
    type: LeaderboardType,
    metric: LeaderboardMetric,
    period?: string
  ): Promise<void> {
    const query: any = { type, metric };
    if (period) {
      query.period = period;
    }

    const entries = await LeaderboardEntry.find(query)
      .sort({ value: -1 })
      .populate('userId', 'name avatar');

    let rank = 1;
    for (const entry of entries) {
      entry.rank = rank++;
      await entry.save();
    }
  }

  /**
   * Get leaderboard
   */
  static async getLeaderboard(
    type: LeaderboardType,
    metric: LeaderboardMetric,
    period?: string,
    limit: number = 100
  ): Promise<ILeaderboardEntry[]> {
    const query: any = { type, metric };
    if (period) {
      query.period = period;
    }

    return LeaderboardEntry.find(query)
      .sort({ rank: 1 })
      .limit(limit)
      .populate('userId', 'name avatar');
  }

  /**
   * Get user's leaderboard position
   */
  static async getUserLeaderboardPosition(
    userId: mongoose.Types.ObjectId,
    type: LeaderboardType,
    metric: LeaderboardMetric,
    period?: string
  ): Promise<ILeaderboardEntry | null> {
    const query: any = { userId, type, metric };
    if (period) {
      query.period = period;
    }

    return LeaderboardEntry.findOne(query);
  }

  /**
   * Get current period strings
   */
  static getCurrentPeriod(type: 'weekly' | 'monthly'): string {
    const now = new Date();
    if (type === 'weekly') {
      // Format: YYYY-WW (ISO week)
      const week = this.getISOWeek(now);
      return `${now.getFullYear()}-W${week.toString().padStart(2, '0')}`;
    } else {
      // Format: YYYY-MM
      return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
    }
  }

  /**
   * Get ISO week number
   */
  static getISOWeek(date: Date): number {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  }

  /**
   * Comprehensive user stats for gamification
   */
  static async getUserGamificationStats(userId: mongoose.Types.ObjectId): Promise<any> {
    const [userLevel, achievements, activeChallenges, challengeProgress, leaderboardPositions] = await Promise.all([
      this.getUserLevel(userId),
      this.getUserAchievements(userId),
      this.getActiveChallenges(),
      this.getUserChallengeProgress(userId),
      Promise.all([
        this.getUserLeaderboardPosition(userId, LeaderboardType.GLOBAL, LeaderboardMetric.XP),
        this.getUserLeaderboardPosition(userId, LeaderboardType.WEEKLY, LeaderboardMetric.XP, this.getCurrentPeriod('weekly')),
        this.getUserLeaderboardPosition(userId, LeaderboardType.GLOBAL, LeaderboardMetric.SCORE),
      ])
    ]);

    const unlockedAchievements = achievements.filter(a => a.isUnlocked);
    const inProgressAchievements = achievements.filter(a => !a.isUnlocked && a.progress > 0);
    const newAchievements = unlockedAchievements.filter(a => !a.isViewed);

    return {
      level: {
        ...userLevel.toObject(),
        progressToNextLevel: (userLevel.currentXP / userLevel.xpToNextLevel) * 100
      },
      achievements: {
        total: achievements.length,
        unlocked: unlockedAchievements.length,
        inProgress: inProgressAchievements.length,
        new: newAchievements.length,
        list: achievements
      },
      challenges: {
        active: activeChallenges.length,
        inProgress: challengeProgress.filter(p => !p.isCompleted).length,
        completed: challengeProgress.filter(p => p.isCompleted).length,
        list: challengeProgress
      },
      leaderboard: {
        globalXP: leaderboardPositions[0],
        weeklyXP: leaderboardPositions[1],
        globalScore: leaderboardPositions[2]
      }
    };
  }
}
