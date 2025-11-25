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
exports.LearningAnalytics = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TEPSQuestion_1 = require("./TEPSQuestion");
const scoreTrendPointSchema = new mongoose_1.Schema({
    date: { type: Date, required: true },
    score: { type: Number, required: true, min: 0, max: 600 },
    examId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'TEPSExamAttempt' },
    examType: { type: String, required: true },
}, { _id: false });
const sectionPerformanceSchema = new mongoose_1.Schema({
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    averageScore: { type: Number, required: true },
    averageAccuracy: { type: Number, required: true },
    questionsAttempted: { type: Number, required: true },
    timeSpent: { type: Number, required: true },
    improvement: { type: Number, required: true },
    rank: { type: Number, min: 1, max: 4 },
}, { _id: false });
const studyTimeDistributionSchema = new mongoose_1.Schema({
    dayOfWeek: { type: String, required: true },
    hours: { type: Number, required: true },
    productivity: { type: Number, min: 0, max: 100 },
}, { _id: false });
const learningVelocitySchema = new mongoose_1.Schema({
    period: { type: String, required: true },
    questionsPerDay: { type: Number, required: true },
    accuracyTrend: { type: Number, required: true },
    scoreVelocity: { type: Number, required: true },
    estimatedDaysToGoal: { type: Number, required: true },
}, { _id: false });
const peerComparisonSchema = new mongoose_1.Schema({
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
}, { _id: false });
const goalProgressSchema = new mongoose_1.Schema({
    goalId: { type: mongoose_1.Schema.Types.ObjectId, required: true },
    targetScore: { type: Number, required: true },
    currentScore: { type: Number, required: true },
    progressPercentage: { type: Number, min: 0, max: 100 },
    onTrack: { type: Boolean, required: true },
    estimatedCompletionDate: { type: Date, required: true },
    daysRemaining: { type: Number, required: true },
    requiredDailyProgress: { type: Number, required: true },
}, { _id: false });
const scorePredictionSchema = new mongoose_1.Schema({
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
}, { _id: false });
const learningAnalyticsSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
        enum: [...Object.values(TEPSQuestion_1.TEPSSection), ''],
    },
    weakestSection: {
        type: String,
        enum: [...Object.values(TEPSQuestion_1.TEPSSection), ''],
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
}, {
    timestamps: true,
});
// Indexes
learningAnalyticsSchema.index({ lastCalculatedAt: -1 });
learningAnalyticsSchema.index({ 'scoreTrends.date': -1 });
/**
 * Calculate score trend (moving average)
 */
learningAnalyticsSchema.methods.calculateScoreTrend = function () {
    if (this.scoreTrends.length === 0)
        return;
    // Sort by date
    this.scoreTrends.sort((a, b) => a.date.getTime() - b.date.getTime());
    // Update current, highest, lowest
    const latestScore = this.scoreTrends[this.scoreTrends.length - 1].score;
    this.currentScore = latestScore;
    this.highestScore = Math.max(...this.scoreTrends.map((t) => t.score));
    this.lowestScore = Math.min(...this.scoreTrends.map((t) => t.score));
    // Calculate 30-day change
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const scoresLast30Days = this.scoreTrends.filter((t) => t.date >= thirtyDaysAgo);
    if (scoresLast30Days.length > 1) {
        this.scoreChange30Days =
            scoresLast30Days[scoresLast30Days.length - 1].score -
                scoresLast30Days[0].score;
    }
    // Calculate 90-day change
    const ninetyDaysAgo = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
    const scoresLast90Days = this.scoreTrends.filter((t) => t.date >= ninetyDaysAgo);
    if (scoresLast90Days.length > 1) {
        this.scoreChange90Days =
            scoresLast90Days[scoresLast90Days.length - 1].score -
                scoresLast90Days[0].score;
    }
};
/**
 * Predict score using linear regression
 */
learningAnalyticsSchema.methods.predictScore = function (targetDays = 30) {
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
    const meanY = recentScores.reduce((sum, t) => sum + t.score, 0) / n;
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
    const predictedScore = Math.round(intercept + slope * (n - 1 + targetDays));
    const clampedScore = Math.max(0, Math.min(600, predictedScore));
    // Calculate confidence interval (±1 std dev)
    const residuals = recentScores.map((t, i) => t.score - (intercept + slope * i));
    const variance = residuals.reduce((sum, r) => sum + r * r, 0) / n;
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
learningAnalyticsSchema.methods.compareWithPeers = async function () {
    const LearningAnalytics = mongoose_1.default.model('LearningAnalytics');
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
    const averageScore = allScores.reduce((sum, s) => sum + s, 0) / allScores.length;
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
    const similarLearners = allScores.filter((s) => Math.abs(s - this.currentScore) <= 20).length;
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
learningAnalyticsSchema.methods.updateGoalProgress = async function () {
    this.goals.forEach((goal) => {
        goal.currentScore = this.currentScore;
        goal.progressPercentage =
            (goal.currentScore / goal.targetScore) * 100;
        // Calculate days remaining
        const now = new Date();
        const daysRemaining = Math.ceil((goal.estimatedCompletionDate.getTime() - now.getTime()) /
            (1000 * 60 * 60 * 24));
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
exports.LearningAnalytics = mongoose_1.default.model('LearningAnalytics', learningAnalyticsSchema);
//# sourceMappingURL=LearningAnalytics.js.map