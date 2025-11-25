import mongoose, { Schema, Document } from 'mongoose';

/**
 * Achievement Types
 */
export enum AchievementType {
  SCORE = 'score', // Score milestones
  STREAK = 'streak', // Study streak
  QUESTIONS = 'questions', // Questions answered
  STUDY_TIME = 'study_time', // Total study hours
  ACCURACY = 'accuracy', // Accuracy percentage
  COURSE_COMPLETE = 'course_complete', // Complete courses
  TEST_PASSED = 'test_passed', // Pass tests
  SOCIAL = 'social', // Social interactions
  SPECIAL = 'special' // Special achievements
}

export enum AchievementRarity {
  COMMON = 'common',
  UNCOMMON = 'uncommon',
  RARE = 'rare',
  EPIC = 'epic',
  LEGENDARY = 'legendary'
}

/**
 * Achievement Definition Interface
 */
export interface IAchievementDefinition extends Document {
  code: string; // Unique code (e.g., "SCORE_500", "STREAK_30")
  name: string;
  description: string;
  icon: string;
  type: AchievementType;
  rarity: AchievementRarity;

  // Requirements
  requirements: {
    metric: string; // 'score', 'streak', 'questions', etc.
    value: number; // Target value
    comparison: 'gte' | 'lte' | 'eq'; // Greater/Less/Equal
  }[];

  // Rewards
  rewards: {
    xp: number;
    coins?: number;
    badge?: string;
  };

  // Metadata
  isHidden: boolean; // Hidden until unlocked
  isActive: boolean;
  order: number; // Display order
  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Achievement Interface
 */
export interface IUserAchievement extends Document {
  userId: mongoose.Types.ObjectId;
  achievementCode: string;

  // Progress
  progress: number; // 0-100
  currentValue: number;
  targetValue: number;

  // Status
  isUnlocked: boolean;
  unlockedAt?: Date;

  // Notifications
  isViewed: boolean;
  viewedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Level & XP Interface
 */
export interface IUserLevel extends Document {
  userId: mongoose.Types.ObjectId;

  // Level & XP
  level: number;
  currentXP: number;
  totalXP: number;
  xpToNextLevel: number;

  // Coins/Currency
  coins: number;

  // Statistics
  stats: {
    achievementsUnlocked: number;
    challengesCompleted: number;
    currentStreak: number;
    longestStreak: number;
  };

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Challenge Interface
 */
export enum ChallengeType {
  DAILY = 'daily',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  SPECIAL = 'special'
}

export enum ChallengeStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  COMPLETED = 'completed'
}

export interface IChallenge extends Document {
  title: string;
  description: string;
  type: ChallengeType;
  status: ChallengeStatus;

  // Requirements
  requirements: {
    type: string; // 'questions', 'study_time', 'accuracy', etc.
    target: number;
  }[];

  // Rewards
  rewards: {
    xp: number;
    coins: number;
    badges?: string[];
  };

  // Timing
  startDate: Date;
  endDate: Date;

  // Participation
  participants: mongoose.Types.ObjectId[];
  completions: {
    userId: mongoose.Types.ObjectId;
    completedAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

/**
 * User Challenge Progress Interface
 */
export interface IUserChallengeProgress extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;

  // Progress per requirement
  progress: {
    type: string;
    current: number;
    target: number;
    percentage: number;
  }[];

  // Status
  isCompleted: boolean;
  completedAt?: Date;
  rewardsClaimed: boolean;
  claimedAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}

/**
 * Leaderboard Entry Interface
 */
export enum LeaderboardType {
  GLOBAL = 'global',
  WEEKLY = 'weekly',
  MONTHLY = 'monthly',
  FRIENDS = 'friends'
}

export enum LeaderboardMetric {
  SCORE = 'score',
  XP = 'xp',
  STREAK = 'streak',
  QUESTIONS = 'questions',
  STUDY_TIME = 'study_time'
}

export interface ILeaderboardEntry extends Document {
  userId: mongoose.Types.ObjectId;
  type: LeaderboardType;
  metric: LeaderboardMetric;

  // Score/Value
  value: number;
  rank: number;

  // Period (for weekly/monthly)
  period?: string; // 'YYYY-WW' or 'YYYY-MM'

  // Metadata
  updatedAt: Date;
  createdAt: Date;
}

/**
 * Achievement Definition Schema
 */
const achievementDefinitionSchema = new Schema<IAchievementDefinition>(
  {
    code: {
      type: String,
      required: true,
      unique: true,
      uppercase: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    icon: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(AchievementType),
      required: true
    },
    rarity: {
      type: String,
      enum: Object.values(AchievementRarity),
      default: AchievementRarity.COMMON
    },
    requirements: [{
      metric: String,
      value: Number,
      comparison: {
        type: String,
        enum: ['gte', 'lte', 'eq'],
        default: 'gte'
      }
    }],
    rewards: {
      xp: {
        type: Number,
        required: true,
        min: 0
      },
      coins: {
        type: Number,
        min: 0
      },
      badge: String
    },
    isHidden: {
      type: Boolean,
      default: false
    },
    isActive: {
      type: Boolean,
      default: true
    },
    order: {
      type: Number,
      default: 0
    }
  },
  {
    timestamps: true
  }
);

/**
 * User Achievement Schema
 */
const userAchievementSchema = new Schema<IUserAchievement>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    achievementCode: {
      type: String,
      required: true,
      uppercase: true
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    currentValue: {
      type: Number,
      default: 0
    },
    targetValue: {
      type: Number,
      required: true
    },
    isUnlocked: {
      type: Boolean,
      default: false
    },
    unlockedAt: Date,
    isViewed: {
      type: Boolean,
      default: false
    },
    viewedAt: Date
  },
  {
    timestamps: true
  }
);

/**
 * User Level Schema
 */
const userLevelSchema = new Schema<IUserLevel>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    level: {
      type: Number,
      default: 1,
      min: 1
    },
    currentXP: {
      type: Number,
      default: 0,
      min: 0
    },
    totalXP: {
      type: Number,
      default: 0,
      min: 0
    },
    xpToNextLevel: {
      type: Number,
      default: 100
    },
    coins: {
      type: Number,
      default: 0,
      min: 0
    },
    stats: {
      achievementsUnlocked: {
        type: Number,
        default: 0,
        min: 0
      },
      challengesCompleted: {
        type: Number,
        default: 0,
        min: 0
      },
      currentStreak: {
        type: Number,
        default: 0,
        min: 0
      },
      longestStreak: {
        type: Number,
        default: 0,
        min: 0
      }
    }
  },
  {
    timestamps: true
  }
);

/**
 * Challenge Schema
 */
const challengeSchema = new Schema<IChallenge>(
  {
    title: {
      type: String,
      required: true
    },
    description: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: Object.values(ChallengeType),
      required: true
    },
    status: {
      type: String,
      enum: Object.values(ChallengeStatus),
      default: ChallengeStatus.ACTIVE
    },
    requirements: [{
      type: {
        type: String,
        required: true
      },
      target: {
        type: Number,
        required: true,
        min: 1
      }
    }],
    rewards: {
      xp: {
        type: Number,
        required: true,
        min: 0
      },
      coins: {
        type: Number,
        required: true,
        min: 0
      },
      badges: [String]
    },
    startDate: {
      type: Date,
      required: true
    },
    endDate: {
      type: Date,
      required: true
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User'
    }],
    completions: [{
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      completedAt: Date
    }]
  },
  {
    timestamps: true
  }
);

/**
 * User Challenge Progress Schema
 */
const userChallengeProgressSchema = new Schema<IUserChallengeProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'Challenge',
      required: true
    },
    progress: [{
      type: String,
      current: {
        type: Number,
        default: 0
      },
      target: {
        type: Number,
        required: true
      },
      percentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }],
    isCompleted: {
      type: Boolean,
      default: false
    },
    completedAt: Date,
    rewardsClaimed: {
      type: Boolean,
      default: false
    },
    claimedAt: Date
  },
  {
    timestamps: true
  }
);

/**
 * Leaderboard Entry Schema
 */
const leaderboardEntrySchema = new Schema<ILeaderboardEntry>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    type: {
      type: String,
      enum: Object.values(LeaderboardType),
      required: true
    },
    metric: {
      type: String,
      enum: Object.values(LeaderboardMetric),
      required: true
    },
    value: {
      type: Number,
      required: true,
      min: 0
    },
    rank: {
      type: Number,
      required: true,
      min: 1
    },
    period: String
  },
  {
    timestamps: true
  }
);

// Indexes
achievementDefinitionSchema.index({ type: 1, rarity: 1 });
achievementDefinitionSchema.index({ isActive: 1, order: 1 });

userAchievementSchema.index({ userId: 1, achievementCode: 1 }, { unique: true });
userAchievementSchema.index({ userId: 1, isUnlocked: 1 });

userLevelSchema.index({ userId: 1 });
userLevelSchema.index({ level: -1, totalXP: -1 });

challengeSchema.index({ type: 1, status: 1 });
challengeSchema.index({ startDate: 1, endDate: 1 });

userChallengeProgressSchema.index({ userId: 1, challengeId: 1 }, { unique: true });
userChallengeProgressSchema.index({ userId: 1, isCompleted: 1 });

leaderboardEntrySchema.index({ type: 1, metric: 1, period: 1, rank: 1 });
leaderboardEntrySchema.index({ userId: 1, type: 1, metric: 1 });
leaderboardEntrySchema.index({ type: 1, metric: 1, value: -1 });

// Methods
userLevelSchema.methods.addXP = function(xp: number) {
  this.currentXP += xp;
  this.totalXP += xp;

  // Level up logic
  while (this.currentXP >= this.xpToNextLevel) {
    this.currentXP -= this.xpToNextLevel;
    this.level += 1;
    // Formula: XP needed = 100 * (level ^ 1.5)
    this.xpToNextLevel = Math.floor(100 * Math.pow(this.level, 1.5));
  }
};

userLevelSchema.methods.addCoins = function(coins: number) {
  this.coins += coins;
};

/**
 * Gamification Models
 */
export const AchievementDefinition = mongoose.model<IAchievementDefinition>(
  'AchievementDefinition',
  achievementDefinitionSchema
);
export const UserAchievement = mongoose.model<IUserAchievement>(
  'UserAchievement',
  userAchievementSchema
);
export const UserLevel = mongoose.model<IUserLevel>(
  'UserLevel',
  userLevelSchema
);
export const Challenge = mongoose.model<IChallenge>(
  'Challenge',
  challengeSchema
);
export const UserChallengeProgress = mongoose.model<IUserChallengeProgress>(
  'UserChallengeProgress',
  userChallengeProgressSchema
);
export const LeaderboardEntry = mongoose.model<ILeaderboardEntry>(
  'LeaderboardEntry',
  leaderboardEntrySchema
);
