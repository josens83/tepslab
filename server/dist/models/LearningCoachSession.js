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
exports.LearningCoachSession = exports.CoachingType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Coaching Session Type
 */
var CoachingType;
(function (CoachingType) {
    CoachingType["WEEKLY_CHECKIN"] = "weekly_checkin";
    CoachingType["MONTHLY_REVIEW"] = "monthly_review";
    CoachingType["GOAL_PLANNING"] = "goal_planning";
    CoachingType["HABIT_BUILDING"] = "habit_building";
    CoachingType["MOTIVATION_BOOST"] = "motivation_boost";
    CoachingType["STRATEGY_OPTIMIZATION"] = "strategy_optimization";
})(CoachingType || (exports.CoachingType = CoachingType = {}));
const learningHabitSchema = new mongoose_1.Schema({
    habitName: { type: String, required: true },
    description: { type: String, required: true },
    frequency: {
        type: String,
        enum: ['daily', 'weekly', 'monthly'],
        required: true,
    },
    targetDays: [String],
    targetTime: String,
    reminderEnabled: { type: Boolean, default: true },
    streakCount: { type: Number, default: 0 },
    lastCompletedAt: Date,
    createdAt: { type: Date, default: Date.now },
}, { _id: false });
const motivationBoostSchema = new mongoose_1.Schema({
    type: {
        type: String,
        enum: ['achievement', 'encouragement', 'tip', 'quote'],
        required: true,
    },
    message: { type: String, required: true },
    deliveredAt: { type: Date, default: Date.now },
    userReaction: {
        type: String,
        enum: ['liked', 'saved', 'dismissed'],
    },
}, { _id: false });
const actionItemSchema = new mongoose_1.Schema({
    description: { type: String, required: true },
    priority: {
        type: String,
        enum: ['high', 'medium', 'low'],
        default: 'medium',
    },
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
}, { _id: false });
const coachingInsightSchema = new mongoose_1.Schema({
    category: {
        type: String,
        enum: ['strength', 'weakness', 'opportunity', 'recommendation'],
        required: true,
    },
    title: { type: String, required: true },
    description: { type: String, required: true },
    evidence: [String],
    actionable: { type: Boolean, default: true },
    relatedGoals: [String],
}, { _id: false });
const learningCoachSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    coachingType: {
        type: String,
        enum: Object.values(CoachingType),
        required: true,
        index: true,
    },
    insights: {
        type: [coachingInsightSchema],
        default: [],
    },
    recommendations: {
        type: [String],
        default: [],
    },
    actionItems: {
        type: [actionItemSchema],
        default: [],
    },
    habits: {
        type: [learningHabitSchema],
        default: [],
    },
    habitCompletionRate: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    motivationBoosts: {
        type: [motivationBoostSchema],
        default: [],
    },
    performanceSummary: {
        period: String,
        studyDays: Number,
        totalStudyTime: Number,
        questionsAttempted: Number,
        accuracy: Number,
        scoreChange: Number,
        topImprovement: String,
        needsAttention: String,
    },
    scheduledAt: Date,
    conductedAt: {
        type: Date,
        default: Date.now,
    },
    nextSessionAt: Date,
    userFeedback: {
        rating: { type: Number, min: 1, max: 5 },
        comment: String,
        implementedActions: { type: Number, default: 0 },
    },
}, {
    timestamps: true,
});
// Indexes
learningCoachSessionSchema.index({ userId: 1, coachingType: 1 });
learningCoachSessionSchema.index({ userId: 1, conductedAt: -1 });
learningCoachSessionSchema.index({ nextSessionAt: 1 });
/**
 * Add action item
 */
learningCoachSessionSchema.methods.addActionItem = async function (description, priority = 'medium', dueDate) {
    this.actionItems.push({
        description,
        priority,
        dueDate,
        completed: false,
    });
    await this.save();
};
/**
 * Complete action item
 */
learningCoachSessionSchema.methods.completeActionItem = async function (index) {
    if (index >= 0 && index < this.actionItems.length) {
        this.actionItems[index].completed = true;
        this.actionItems[index].completedAt = new Date();
        await this.save();
    }
};
/**
 * Update habit streak
 */
learningCoachSessionSchema.methods.updateHabitStreak = async function (habitName) {
    const habit = this.habits.find((h) => h.habitName === habitName);
    if (habit) {
        const now = new Date();
        const lastCompleted = habit.lastCompletedAt;
        if (lastCompleted) {
            const daysSince = Math.floor((now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSince === 1) {
                // Consecutive day
                habit.streakCount += 1;
            }
            else if (daysSince > 1) {
                // Streak broken
                habit.streakCount = 1;
            }
            // If same day (daysSince === 0), don't update
        }
        else {
            // First completion
            habit.streakCount = 1;
        }
        habit.lastCompletedAt = now;
        // Recalculate completion rate
        const totalHabits = this.habits.length;
        const activeHabits = this.habits.filter((h) => h.streakCount > 0).length;
        this.habitCompletionRate = (activeHabits / totalHabits) * 100;
        await this.save();
    }
};
exports.LearningCoachSession = mongoose_1.default.model('LearningCoachSession', learningCoachSessionSchema);
//# sourceMappingURL=LearningCoachSession.js.map