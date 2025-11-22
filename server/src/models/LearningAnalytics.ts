import mongoose, { Document, Schema } from 'mongoose';
import { TEPSSection } from './TEPSQuestion';

/**
 * Score Trend Data Point
 */
export interface ScoreTrendPoint {
  date: Date;
  score: number;
  examId?: mongoose.Types.ObjectId;
  examType: string;
}

/**
 * Section Performance
 */
export interface SectionPerformance {
  section: TEPSSection;
  averageScore: number;
  averageAccuracy: number;
  questionsAttempted: number;
  timeSpent: number; // in minutes
  improvement: number; // percentage change from baseline
  rank: number; // 1-4 ranking among sections
}

/**
 * Study Time Distribution
 */
export interface StudyTimeDistribution {
  dayOfWeek: string;
  hours: number;
  productivity: number; // 0-100 score based on accuracy during that time
}

/**
 * Learning Velocity
 */
export interface LearningVelocity {
  period: string; // 'week', 'month'
  questionsPerDay: number;
  accuracyTrend: number; // positive = improving, negative = declining
  scoreVelocity: number; // points per week
  estimatedDaysToGoal: number;
}

/**
 * Peer Comparison
 */
export interface PeerComparison {
  userScore: number;
  averageScore: number;
  percentile: number; // 0-100
  topPerformers: {
    scoreRange: string;
    percentage: number;
  }[];
  similarLearners: number; // count of users with similar scores
}

/**
 * Goal Progress
 */
export interface GoalProgress {
  goalId: mongoose.Types.ObjectId;
  targetScore: number;
  currentScore: number;
  progressPercentage: number;
  onTrack: boolean;
  estimatedCompletionDate: Date;
  daysRemaining: number;
  requiredDailyProgress: number;
}

/**
 * Prediction Model
 */
export interface ScorePrediction {
  predictedScore: number;
  confidenceInterval: {
    lower: number;
    upper: number;
  };
  probability: number; // probability of reaching goal
  basedOn: string; // 'current_trend', 'ml_model', 'statistical'
  factors: {
    factor: string;
    impact: number; // -100 to +100
  }[];
  recommendations: string[];
}

/**
 * Learning Analytics Document
 * Comprehensive analytics and predictions for user learning
 */
export interface ILearningAnalytics extends Document {
  userId: mongoose.Types.ObjectId;

  // Score Trends
  scoreTrends: ScoreTrendPoint[];
  currentScore: number;
  highestScore: number;
  lowestScore: number;
  scoreChange30Days: number;
  scoreChange90Days: number;

  // Section Performance
  sectionPerformance: SectionPerformance[];
  strongestSection: TEPSSection;
  weakestSection: TEPSSection;

  // Study Patterns
  totalStudyTime: number; // in minutes
  totalQuestionsAttempted: number;
  averageAccuracy: number;
  studyTimeDistribution: StudyTimeDistribution[];
  mostProductiveTime: string;

  // Learning Velocity
  learningVelocity: LearningVelocity;

  // Peer Comparison
  peerComparison: PeerComparison;

  // Goals & Predictions
  goals: GoalProgress[];
  scorePrediction?: ScorePrediction;

  // Milestones
  milestones: {
    type: 'score' | 'streak' | 'questions' | 'time';
    description: string;
    achievedAt: Date;
    value: number;
  }[];

  // Last Updated
  lastCalculatedAt: Date;

  createdAt: Date;
  updatedAt: Date;

  // Methods
  calculateScoreTrend(): void;
  predictScore(targetDays: number): ScorePrediction;
  compareWithPeers(): Promise<PeerComparison>;
  updateGoalProgress(): Promise<void>;
}

const scoreTrendPointSchema = new Schema<ScoreTrendPoint>(
  {
    date: { type: Date, required: true },
    score: { type: Number, required: true, min: 0, max: 600 },
    examId: { type: Schema.Types.ObjectId, ref: 'TEPSExamAttempt' },
    examType: { type: String, required: true },
  },
  { _id: false }
);

const sectionPerformanceSchema = new Schema<SectionPerformance>(
  {
    section: {
      type: String,
      enum: Object.values(TEPSSection),
      required: true,
    },
    averageScore: { type: Number, required: true },
    averageAccuracy: { type: Number, required: true },
    questionsAttempted: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    improvement: { type: Number, required: true },
    rank: { type: Number, min: 1, max: 4 },
  },
  { _id: false }
);

const studyTimeDistributionSchema = new Schema<StudyTimeDistribution>(
  {
    dayOfWeek: { type: String, required: true },
    hours: { type: Number, required: true },
    productivity: { type: Number, min: 0, max: 100 },
  },
  { _id: false }
);

const learningVelocitySchema = new Schema<LearningVelocity>(
  {
    period: { type: String, required: true },
    questionsPerDay: { type: Number, required: true },
    accuracyTrend: { type: Number, required: true },
    scoreVelocity: { type: Number, required: true },
    estimatedDaysToGoal: { type: Number, required: true },
  },
  { _id: false }
);

const peerComparisonSchema = new Schema<PeerComparison>(
  {
    userScore: { type: Number, required: true },
    averageScore: { type: Number, required: true },
    percentile: { type: Number, min: 0, max: 100 },
    topPerformers: [
      {
        scoreRange: String,
        percentage: Number,
      },
    ],
    similarLearners: { type: Number, default: 0 },
  },
  { _id: false }
);

const goalProgressSchema = new Schema<GoalProgress>(
  {
    goalId: { type: Schema.Types.ObjectId, required: true },
    targetScore: { type: Number, required: true },
    currentScore: { type: Number, required: true },
    progressPercentage: { type: Number, min: 0, max: 100 },
    onTrack: { type: Boolean, required: true },
    estimatedCompletionDate: { type: Date, required: true },
    daysRemaining: { type: Number, required: true },
    requiredDailyProgress: { type: Number, required: true },
  },
  { _id: false }
);

const scorePredictionSchema = new Schema<ScorePrediction>(
  {
    predictedScore: { type: Number, required: true },
    confidenceInterval: {
      lower: Number,
      upper: Number,
    },
    probability: { type: Number, min: 0, max: 1 },
    basedOn: { type: String, required: true },
    factors: [
      {
        factor: String,
        impact: Number,
      },
    ],
    recommendations: [String],
  },
  { _id: false }
);

const learningAnalyticsSchema = new Schema<ILearningAnalytics>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    scoreTrends: {
      type: [scoreTrendPointSchema],
      default: [],
    },
    currentScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 600,
    },
    highestScore: {
      type: Number,
      default: 0,
      min: 0,
      max: 600,
    },
    lowestScore: {
      type: Number,
      default: 600,
      min: 0,
      max: 600,
    },
    scoreChange30Days: {
      type: Number,
      default: 0,
    },
    scoreChange90Days: {
      type: Number,
      default: 0,
    },
    sectionPerformance: {
      type: [sectionPerformanceSchema],
      default: [],
    },
    strongestSection: {
      type: String,
      enum: [...Object.values(TEPSSection), ''],
    },
    weakestSection: {
      type: String,
      enum: [...Object.values(TEPSSection), ''],
    },
    totalStudyTime: {
      type: Number,
      default: 0,
    },
    totalQuestionsAttempted: {
      type: Number,
      default: 0,
    },
    averageAccuracy: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    studyTimeDistribution: {
      type: [studyTimeDistributionSchema],
      default: [],
    },
    mostProductiveTime: {
      type: String,
      default: '',
    },
    learningVelocity: learningVelocitySchema,
    peerComparison: peerComparisonSchema,
    goals: {
      type: [goalProgressSchema],
      default: [],
    },
    scorePrediction: scorePredictionSchema,
    milestones: [
      {
        type: {
          type: String,
          enum: ['score', 'streak', 'questions', 'time'],
        },
        description: String,
        achievedAt: Date,
        value: Number,
      },
    ],
    lastCalculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes
learningAnalyticsSchema.index({ lastCalculatedAt: -1 });
learningAnalyticsSchema.index({ 'scoreTrends.date': -1 });

/**
 * Calculate score trend (moving average)
 */
learningAnalyticsSchema.methods.calculateScoreTrend = function (): void {
  if (this.scoreTrends.length === 0) return;

  // Sort by date
  this.scoreTrends.sort((a, b) => a.date.getTime() - b.date.getTime());

  // Update current, highest, lowest
  const latestScore = this.scoreTrends[this.scoreTrends.length - 1].score;
  this.currentScore = latestScore;
  this.highestScore = Math.max(...this.scoreTrends.map((t) => t.score));
  this.lowestScore = Math.min(...this.scoreTrends.map((t) => t.score));

  // Calculate 30-day change
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const scoresLast30Days = this.scoreTrends.filter(
    (t) => t.date >= thirtyDaysAgo
  );
  if (scoresLast30Days.length > 1) {
    this.scoreChange30Days =
      scoresLast30Days[scoresLast30Days.length - 1].score -
      scoresLast30Days[0].score;
  }

  // Calculate 90-day change
  const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  const scoresLast90Days = this.scoreTrends.filter(
    (t) => t.date >= ninetyDaysAgo
  );
  if (scoresLast90Days.length > 1) {
    this.scoreChange90Days =
      scoresLast90Days[scoresLast90Days.length - 1].score -
      scoresLast90Days[0].score;
  }
};

/**
 * Predict score using linear regression
 */
learningAnalyticsSchema.methods.predictScore = function (
  targetDays: number = 30
): ScorePrediction {
  if (this.scoreTrends.length < 3) {
    return {
      predictedScore: this.currentScore,
      confidenceInterval: { lower: this.currentScore - 50, upper: this.currentScore + 50 },
      probability: 0.5,
      basedOn: 'insufficient_data',
      factors: [],
      recommendations: ['계속 학습하여 더 정확한 예측을 받으세요'],
    };
  }

  // Simple linear regression on recent scores
  const recentScores = this.scoreTrends.slice(-10);
  const n = recentScores.length;

  // Calculate means
  const meanX = (n - 1) / 2; // Days index
  const meanY =
    recentScores.reduce((sum, t) => sum + t.score, 0) / n;

  // Calculate slope
  let numerator = 0;
  let denominator = 0;
  recentScores.forEach((t, i) => {
    numerator += (i - meanX) * (t.score - meanY);
    denominator += Math.pow(i - meanX, 2);
  });

  const slope = denominator !== 0 ? numerator / denominator : 0;
  const intercept = meanY - slope * meanX;

  // Predict score
  const predictedScore = Math.round(
    intercept + slope * (n - 1 + targetDays)
  );
  const clampedScore = Math.max(0, Math.min(600, predictedScore));

  // Calculate confidence interval (±1 std dev)
  const residuals = recentScores.map((t, i) => t.score - (intercept + slope * i));
  const variance =
    residuals.reduce((sum, r) => sum + r * r, 0) / n;
  const stdDev = Math.sqrt(variance);

  const factors = [
    {
      factor: '최근 학습 일관성',
      impact: this.learningVelocity?.questionsPerDay > 20 ? 30 : -20,
    },
    {
      factor: '정답률 추세',
      impact: this.learningVelocity?.accuracyTrend > 0 ? 25 : -25,
    },
    {
      factor: '점수 변화 속도',
      impact: slope > 0 ? 35 : -30,
    },
  ];

  const recommendations = [];
  if (slope <= 0) {
    recommendations.push('학습 방법을 개선하여 점수 상승세를 만드세요');
  }
  if (this.learningVelocity?.questionsPerDay < 20) {
    recommendations.push('하루 최소 20문제 이상 풀이를 권장합니다');
  }
  if (this.averageAccuracy < 70) {
    recommendations.push('기본 개념 복습으로 정답률을 높이세요');
  }

  return {
    predictedScore: clampedScore,
    confidenceInterval: {
      lower: Math.max(0, clampedScore - stdDev),
      upper: Math.min(600, clampedScore + stdDev),
    },
    probability: slope > 0 ? 0.7 : 0.4,
    basedOn: 'statistical',
    factors,
    recommendations,
  };
};

/**
 * Compare with peers
 */
learningAnalyticsSchema.methods.compareWithPeers = async function (): Promise<PeerComparison> {
  const LearningAnalytics = mongoose.model<ILearningAnalytics>('LearningAnalytics');

  // Get all users' current scores
  const allAnalytics = await LearningAnalytics.find({}).select('currentScore');
  const allScores = allAnalytics.map((a) => a.currentScore).filter((s) => s > 0);

  if (allScores.length === 0) {
    return {
      userScore: this.currentScore,
      averageScore: this.currentScore,
      percentile: 50,
      topPerformers: [],
      similarLearners: 0,
    };
  }

  // Calculate average
  const averageScore =
    allScores.reduce((sum, s) => sum + s, 0) / allScores.length;

  // Calculate percentile
  const scoresBelowUser = allScores.filter((s) => s < this.currentScore).length;
  const percentile = (scoresBelowUser / allScores.length) * 100;

  // Score distribution
  const ranges = [
    '0-200',
    '201-300',
    '301-400',
    '401-500',
    '501-600',
  ];
  const topPerformers = ranges.map((range) => {
    const [min, max] = range.split('-').map(Number);
    const count = allScores.filter((s) => s >= min && s <= max).length;
    return {
      scoreRange: range,
      percentage: (count / allScores.length) * 100,
    };
  });

  // Similar learners (within ±20 points)
  const similarLearners = allScores.filter(
    (s) => Math.abs(s - this.currentScore) <= 20
  ).length;

  return {
    userScore: this.currentScore,
    averageScore: Math.round(averageScore),
    percentile: Math.round(percentile),
    topPerformers,
    similarLearners,
  };
};

/**
 * Update goal progress
 */
learningAnalyticsSchema.methods.updateGoalProgress = async function (): Promise<void> {
  this.goals.forEach((goal: GoalProgress) => {
    goal.currentScore = this.currentScore;
    goal.progressPercentage =
      (goal.currentScore / goal.targetScore) * 100;

    // Calculate days remaining
    const now = new Date();
    const daysRemaining = Math.ceil(
      (goal.estimatedCompletionDate.getTime() - now.getTime()) /
        (1000 * 60 * 60 * 24)
    );
    goal.daysRemaining = Math.max(0, daysRemaining);

    // Calculate required daily progress
    const scoreGap = goal.targetScore - goal.currentScore;
    goal.requiredDailyProgress =
      daysRemaining > 0 ? scoreGap / daysRemaining : 0;

    // Check if on track
    const expectedProgress = this.learningVelocity?.scoreVelocity * daysRemaining;
    goal.onTrack = expectedProgress >= scoreGap;
  });

  await this.save();
};

export const LearningAnalytics = mongoose.model<ILearningAnalytics>(
  'LearningAnalytics',
  learningAnalyticsSchema
);
