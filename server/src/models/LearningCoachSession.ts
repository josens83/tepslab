import mongoose, { Document, Schema } from 'mongoose';

/**
 * Coaching Session Type
 */
export enum CoachingType {
  WEEKLY_CHECKIN = 'weekly_checkin',
  MONTHLY_REVIEW = 'monthly_review',
  GOAL_PLANNING = 'goal_planning',
  HABIT_BUILDING = 'habit_building',
  MOTIVATION_BOOST = 'motivation_boost',
  STRATEGY_OPTIMIZATION = 'strategy_optimization',
}

/**
 * Learning Habit
 */
export interface LearningHabit {
  habitName: string;
  description: string;
  frequency: 'daily' | 'weekly' | 'monthly';
  targetDays: string[]; // ['monday', 'wednesday', 'friday']
  targetTime?: string; // '19:00'
  reminderEnabled: boolean;
  streakCount: number;
  lastCompletedAt?: Date;
  createdAt: Date;
}

/**
 * Motivation Boost
 */
export interface MotivationBoost {
  type: 'achievement' | 'encouragement' | 'tip' | 'quote';
  message: string;
  deliveredAt: Date;
  userReaction?: 'liked' | 'saved' | 'dismissed';
}

/**
 * Action Item
 */
export interface ActionItem {
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: Date;
  completed: boolean;
  completedAt?: Date;
}

/**
 * Coaching Insight
 */
export interface CoachingInsight {
  category: 'strength' | 'weakness' | 'opportunity' | 'recommendation';
  title: string;
  description: string;
  evidence: string[]; // Supporting data points
  actionable: boolean;
  relatedGoals?: string[];
}

/**
 * Learning Coach Session Document
 */
export interface ILearningCoachSession extends Document {
  userId: mongoose.Types.ObjectId;
  coachingType: CoachingType;

  // Session Content
  insights: CoachingInsight[];
  recommendations: string[];
  actionItems: ActionItem[];

  // Habit Tracking
  habits: LearningHabit[];
  habitCompletionRate: number; // 0-100

  // Motivation
  motivationBoosts: MotivationBoost[];

  // Performance Summary
  performanceSummary?: {
    period: string; // 'last_week', 'last_month'
    studyDays: number;
    totalStudyTime: number; // in minutes
    questionsAttempted: number;
    accuracy: number; // percentage
    scoreChange: number; // change from previous period
    topImprovement: string;
    needsAttention: string;
  };

  // Session Info
  scheduledAt?: Date;
  conductedAt: Date;
  nextSessionAt?: Date;
  userFeedback?: {
    rating: number; // 1-5
    comment?: string;
    implementedActions: number;
  };

  createdAt: Date;
  updatedAt: Date;

  // Methods
  addActionItem(description: string, priority: string, dueDate?: Date): Promise<void>;
  completeActionItem(index: number): Promise<void>;
  updateHabitStreak(habitName: string): Promise<void>;
}

const learningHabitSchema = new Schema<LearningHabit>(
  {
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
  },
  { _id: false }
);

const motivationBoostSchema = new Schema<MotivationBoost>(
  {
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
  },
  { _id: false }
);

const actionItemSchema = new Schema<ActionItem>(
  {
    description: { type: String, required: true },
    priority: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    dueDate: Date,
    completed: { type: Boolean, default: false },
    completedAt: Date,
  },
  { _id: false }
);

const coachingInsightSchema = new Schema<CoachingInsight>(
  {
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
  },
  { _id: false }
);

const learningCoachSessionSchema = new Schema<ILearningCoachSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
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
  },
  {
    timestamps: true,
  }
);

// Indexes
learningCoachSessionSchema.index({ userId: 1, coachingType: 1 });
learningCoachSessionSchema.index({ userId: 1, conductedAt: -1 });
learningCoachSessionSchema.index({ nextSessionAt: 1 });

/**
 * Add action item
 */
learningCoachSessionSchema.methods.addActionItem = async function (
  description: string,
  priority: string = 'medium',
  dueDate?: Date
): Promise<void> {
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
learningCoachSessionSchema.methods.completeActionItem = async function (
  index: number
): Promise<void> {
  if (index >= 0 && index < this.actionItems.length) {
    this.actionItems[index].completed = true;
    this.actionItems[index].completedAt = new Date();
    await this.save();
  }
};

/**
 * Update habit streak
 */
learningCoachSessionSchema.methods.updateHabitStreak = async function (
  habitName: string
): Promise<void> {
  const habit = this.habits.find((h: LearningHabit) => h.habitName === habitName);

  if (habit) {
    const now = new Date();
    const lastCompleted = habit.lastCompletedAt;

    if (lastCompleted) {
      const daysSince = Math.floor(
        (now.getTime() - lastCompleted.getTime()) / (1000 * 60 * 60 * 24)
      );

      if (daysSince === 1) {
        // Consecutive day
        habit.streakCount += 1;
      } else if (daysSince > 1) {
        // Streak broken
        habit.streakCount = 1;
      }
      // If same day (daysSince === 0), don't update
    } else {
      // First completion
      habit.streakCount = 1;
    }

    habit.lastCompletedAt = now;

    // Recalculate completion rate
    const totalHabits = this.habits.length;
    const activeHabits = this.habits.filter(
      (h: LearningHabit) => h.streakCount > 0
    ).length;
    this.habitCompletionRate = (activeHabits / totalHabits) * 100;

    await this.save();
  }
};

export const LearningCoachSession = mongoose.model<ILearningCoachSession>(
  'LearningCoachSession',
  learningCoachSessionSchema
);
