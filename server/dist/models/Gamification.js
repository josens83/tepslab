"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.LeaderboardEntry = exports.UserChallengeProgress = exports.Challenge = exports.UserLevel = exports.UserAchievement = exports.AchievementDefinition = exports.LeaderboardMetric = exports.LeaderboardType = exports.ChallengeStatus = exports.ChallengeType = exports.AchievementRarity = exports.AchievementType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Achievement Types
 */
var AchievementType;
(function (AchievementType) {
    AchievementType["SCORE"] = "score";
    AchievementType["STREAK"] = "streak";
    AchievementType["QUESTIONS"] = "questions";
    AchievementType["STUDY_TIME"] = "study_time";
    AchievementType["ACCURACY"] = "accuracy";
    AchievementType["COURSE_COMPLETE"] = "course_complete";
    AchievementType["TEST_PASSED"] = "test_passed";
    AchievementType["SOCIAL"] = "social";
    AchievementType["SPECIAL"] = "special"; // Special achievements
})(AchievementType || (exports.AchievementType = AchievementType = {}));
var AchievementRarity;
(function (AchievementRarity) {
    AchievementRarity["COMMON"] = "common";
    AchievementRarity["UNCOMMON"] = "uncommon";
    AchievementRarity["RARE"] = "rare";
    AchievementRarity["EPIC"] = "epic";
    AchievementRarity["LEGENDARY"] = "legendary";
})(AchievementRarity || (exports.AchievementRarity = AchievementRarity = {}));
/**
 * Challenge Interface
 */
var ChallengeType;
(function (ChallengeType) {
    ChallengeType["DAILY"] = "daily";
    ChallengeType["WEEKLY"] = "weekly";
    ChallengeType["MONTHLY"] = "monthly";
    ChallengeType["SPECIAL"] = "special";
})(ChallengeType || (exports.ChallengeType = ChallengeType = {}));
var ChallengeStatus;
(function (ChallengeStatus) {
    ChallengeStatus["ACTIVE"] = "active";
    ChallengeStatus["EXPIRED"] = "expired";
    ChallengeStatus["COMPLETED"] = "completed";
})(ChallengeStatus || (exports.ChallengeStatus = ChallengeStatus = {}));
/**
 * Leaderboard Entry Interface
 */
var LeaderboardType;
(function (LeaderboardType) {
    LeaderboardType["GLOBAL"] = "global";
    LeaderboardType["WEEKLY"] = "weekly";
    LeaderboardType["MONTHLY"] = "monthly";
    LeaderboardType["FRIENDS"] = "friends";
})(LeaderboardType || (exports.LeaderboardType = LeaderboardType = {}));
var LeaderboardMetric;
(function (LeaderboardMetric) {
    LeaderboardMetric["SCORE"] = "score";
    LeaderboardMetric["XP"] = "xp";
    LeaderboardMetric["STREAK"] = "streak";
    LeaderboardMetric["QUESTIONS"] = "questions";
    LeaderboardMetric["STUDY_TIME"] = "study_time";
})(LeaderboardMetric || (exports.LeaderboardMetric = LeaderboardMetric = {}));
/**
 * Achievement Definition Schema
 */
const achievementDefinitionSchema = new mongoose_1.Schema({
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
}, {
    timestamps: true
});
/**
 * User Achievement Schema
 */
const userAchievementSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
/**
 * User Level Schema
 */
const userLevelSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
/**
 * Challenge Schema
 */
const challengeSchema = new mongoose_1.Schema({
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
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    completions: [{
            userId: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User'
            },
            completedAt: Date
        }]
}, {
    timestamps: true
});
/**
 * User Challenge Progress Schema
 */
const userChallengeProgressSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    challengeId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
/**
 * Leaderboard Entry Schema
 */
const leaderboardEntrySchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
}, {
    timestamps: true
});
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
userLevelSchema.methods.addXP = function (xp) {
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
userLevelSchema.methods.addCoins = function (coins) {
    this.coins += coins;
};
/**
 * Gamification Models
 */
exports.AchievementDefinition = mongoose_1.default.model('AchievementDefinition', achievementDefinitionSchema);
exports.UserAchievement = mongoose_1.default.model('UserAchievement', userAchievementSchema);
exports.UserLevel = mongoose_1.default.model('UserLevel', userLevelSchema);
exports.Challenge = mongoose_1.default.model('Challenge', challengeSchema);
exports.UserChallengeProgress = mongoose_1.default.model('UserChallengeProgress', userChallengeProgressSchema);
exports.LeaderboardEntry = mongoose_1.default.model('LeaderboardEntry', leaderboardEntrySchema);
//# sourceMappingURL=Gamification.js.map