"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.LearningAnalyticsService = void 0;
const LearningAnalytics_1 = require("../models/LearningAnalytics");
const UserLearningProfile_1 = require("../models/UserLearningProfile");
const TEPSExam_1 = require("../models/TEPSExam");
const TEPSQuestion_1 = require("../models/TEPSQuestion");
const mongoose_1 = __importDefault(require("mongoose"));
/**
 * Learning Analytics Service
 * Comprehensive analytics calculation and dashboard generation
 */
class LearningAnalyticsService {
    /**
     * Get or create analytics for user
     */
    static async getOrCreateAnalytics(userId) {
        let analytics = await LearningAnalytics_1.LearningAnalytics.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!analytics) {
            analytics = await LearningAnalytics_1.LearningAnalytics.create({
                userId: new mongoose_1.default.Types.ObjectId(userId),
            });
        }
        return analytics;
    }
    /**
     * Update analytics based on latest data
     */
    static async updateAnalytics(userId) {
        const analytics = await this.getOrCreateAnalytics(userId);
        // Get user profile
        const profile = await UserLearningProfile_1.UserLearningProfile.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        // Get recent exam attempts
        const exams = await TEPSExam_1.TEPSExamAttempt.find({
            userId: new mongoose_1.default.Types.ObjectId(userId),
            status: 'completed',
        })
            .sort({ completedAt: -1 })
            .limit(50);
        // Update score trends
        analytics.scoreTrends = exams
            .filter((exam) => exam.result?.totalScore)
            .map((exam) => ({
            date: exam.completedAt,
            score: exam.result.totalScore,
            examId: exam._id,
            examType: exam.examType,
        }))
            .reverse();
        analytics.calculateScoreTrend();
        // Update section performance
        if (profile) {
            const sectionPerformance = Object.values(TEPSQuestion_1.TEPSSection).map((section) => {
                const sectionHistory = profile.performanceHistory.filter((p) => p.section === section);
                const questionsAttempted = sectionHistory.length;
                const correctAnswers = sectionHistory.filter((p) => p.isCorrect).length;
                const accuracy = questionsAttempted > 0 ? (correctAnswers / questionsAttempted) * 100 : 0;
                const timeSpent = sectionHistory.reduce((sum, p) => sum + p.timeSpent, 0) / 60;
                // Calculate improvement (last 20 vs previous 20)
                const recent = sectionHistory.slice(-20);
                const previous = sectionHistory.slice(-40, -20);
                const recentAccuracy = recent.length > 0
                    ? (recent.filter((p) => p.isCorrect).length / recent.length) * 100
                    : 0;
                const previousAccuracy = previous.length > 0
                    ? (previous.filter((p) => p.isCorrect).length / previous.length) * 100
                    : 0;
                const improvement = recentAccuracy - previousAccuracy;
                return {
                    section,
                    averageScore: (accuracy / 100) * 150,
                    averageAccuracy: accuracy,
                    questionsAttempted,
                    timeSpent,
                    improvement,
                    rank: 0,
                };
            });
            sectionPerformance.sort((a, b) => b.averageScore - a.averageScore);
            sectionPerformance.forEach((sp, index) => {
                sp.rank = index + 1;
            });
            analytics.sectionPerformance = sectionPerformance;
            analytics.strongestSection = sectionPerformance[0]?.section || TEPSQuestion_1.TEPSSection.LISTENING;
            analytics.weakestSection =
                sectionPerformance[sectionPerformance.length - 1]?.section || TEPSQuestion_1.TEPSSection.READING;
            analytics.totalQuestionsAttempted = profile.performanceHistory.length;
            const correctCount = profile.performanceHistory.filter((p) => p.isCorrect).length;
            analytics.averageAccuracy = analytics.totalQuestionsAttempted > 0
                ? (correctCount / analytics.totalQuestionsAttempted) * 100
                : 0;
            // Calculate study time distribution
            const weekdayStats = {
                Monday: { hours: 0, correct: 0, total: 0 },
                Tuesday: { hours: 0, correct: 0, total: 0 },
                Wednesday: { hours: 0, correct: 0, total: 0 },
                Thursday: { hours: 0, correct: 0, total: 0 },
                Friday: { hours: 0, correct: 0, total: 0 },
                Saturday: { hours: 0, correct: 0, total: 0 },
                Sunday: { hours: 0, correct: 0, total: 0 },
            };
            profile.performanceHistory.forEach((p) => {
                const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'long' }).format(p.timestamp);
                if (weekdayStats[dayName]) {
                    weekdayStats[dayName].hours += p.timeSpent / 3600;
                    weekdayStats[dayName].total += 1;
                    if (p.isCorrect)
                        weekdayStats[dayName].correct += 1;
                }
            });
            analytics.studyTimeDistribution = Object.entries(weekdayStats).map(([day, stats]) => ({
                dayOfWeek: day,
                hours: stats.hours,
                productivity: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
            }));
            const sortedByProductivity = [...analytics.studyTimeDistribution].sort((a, b) => b.productivity - a.productivity);
            analytics.mostProductiveTime = sortedByProductivity[0]?.dayOfWeek || 'Monday';
            // Calculate learning velocity
            const last7Days = profile.performanceHistory.filter((p) => p.timestamp >= new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            const questionsPerDay = last7Days.length / 7;
            const last14Days = profile.performanceHistory.filter((p) => p.timestamp >= new Date(Date.now() - 14 * 24 * 60 * 60 * 1000));
            const firstWeek = last14Days.filter((p) => p.timestamp < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
            const firstWeekAccuracy = firstWeek.length > 0
                ? (firstWeek.filter((p) => p.isCorrect).length / firstWeek.length) * 100
                : 0;
            const lastWeekAccuracy = last7Days.length > 0
                ? (last7Days.filter((p) => p.isCorrect).length / last7Days.length) * 100
                : 0;
            const accuracyTrend = lastWeekAccuracy - firstWeekAccuracy;
            const scoreVelocity = analytics.scoreChange30Days / 4;
            analytics.learningVelocity = {
                period: 'week',
                questionsPerDay,
                accuracyTrend,
                scoreVelocity,
                estimatedDaysToGoal: 0,
            };
        }
        analytics.totalStudyTime = exams.reduce((sum, exam) => {
            return sum + (exam.result?.totalTimeSpent || 0) / 60;
        }, 0);
        analytics.peerComparison = await analytics.compareWithPeers();
        analytics.lastCalculatedAt = new Date();
        await analytics.save();
        return analytics;
    }
    /**
     * Generate comprehensive dashboard data
     */
    static async generateDashboard(userId) {
        const analytics = await this.updateAnalytics(userId);
        const profile = await UserLearningProfile_1.UserLearningProfile.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        let studyStreak = 0;
        if (profile && profile.performanceHistory.length > 0) {
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            let currentDate = new Date(today);
            let foundGap = false;
            while (!foundGap && studyStreak < 365) {
                const dayStart = new Date(currentDate);
                const dayEnd = new Date(currentDate);
                dayEnd.setHours(23, 59, 59, 999);
                const hasActivity = profile.performanceHistory.some((p) => p.timestamp >= dayStart && p.timestamp <= dayEnd);
                if (hasActivity) {
                    studyStreak++;
                    currentDate.setDate(currentDate.getDate() - 1);
                }
                else {
                    foundGap = true;
                }
            }
        }
        const overview = {
            currentScore: analytics.currentScore,
            scoreChange30Days: analytics.scoreChange30Days,
            totalStudyTime: Math.round(analytics.totalStudyTime),
            totalQuestions: analytics.totalQuestionsAttempted,
            averageAccuracy: Math.round(analytics.averageAccuracy * 10) / 10,
            studyStreak,
        };
        const last30Days = analytics.scoreTrends.filter((t) => t.date >= new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
        const dates = last30Days.map((t) => t.date.toISOString().split('T')[0]);
        const scores = last30Days.map((t) => t.score);
        const prediction = analytics.predictScore(30);
        const predictionDates = [];
        const predictionScores = [];
        if (last30Days.length > 0) {
            const lastDate = last30Days[last30Days.length - 1].date;
            for (let i = 1; i <= 30; i += 7) {
                const futureDate = new Date(lastDate);
                futureDate.setDate(futureDate.getDate() + i);
                predictionDates.push(futureDate.toISOString().split('T')[0]);
                const progress = i / 30;
                const predictedValue = analytics.currentScore +
                    (prediction.predictedScore - analytics.currentScore) * progress;
                predictionScores.push(Math.round(predictedValue));
            }
        }
        const sectionPerformance = analytics.sectionPerformance.map((sp) => ({
            section: sp.section,
            score: Math.round(sp.averageScore),
            accuracy: Math.round(sp.averageAccuracy * 10) / 10,
            rank: sp.rank,
        }));
        const peerComparison = {
            userScore: analytics.peerComparison.userScore,
            averageScore: analytics.peerComparison.averageScore,
            percentile: Math.round(analytics.peerComparison.percentile),
            distribution: analytics.peerComparison.topPerformers.map((tp) => ({
                range: tp.scoreRange,
                percentage: Math.round(tp.percentage * 10) / 10,
            })),
        };
        await analytics.updateGoalProgress();
        const goals = analytics.goals.map((g) => ({
            targetScore: g.targetScore,
            currentScore: g.currentScore,
            progress: Math.round(g.progressPercentage),
            daysRemaining: g.daysRemaining,
            onTrack: g.onTrack,
        }));
        const studyPatterns = {
            weekdayDistribution: analytics.studyTimeDistribution.map((std) => ({
                day: std.dayOfWeek,
                hours: Math.round(std.hours * 10) / 10,
                productivity: Math.round(std.productivity),
            })),
            mostProductiveTime: analytics.mostProductiveTime,
            learningVelocity: {
                questionsPerDay: Math.round(analytics.learningVelocity.questionsPerDay * 10) / 10,
                scorePerWeek: Math.round(analytics.learningVelocity.scoreVelocity * 10) / 10,
                daysToGoal: analytics.learningVelocity.estimatedDaysToGoal,
            },
        };
        const predictions = {
            predictedScore: prediction.predictedScore,
            confidenceRange: prediction.confidenceInterval,
            probability: Math.round(prediction.probability * 100) / 100,
            recommendations: prediction.recommendations,
        };
        const milestones = analytics.milestones
            .slice(-10)
            .map((m) => ({
            type: m.type,
            description: m.description,
            date: m.achievedAt.toISOString().split('T')[0],
            value: m.value,
        }))
            .reverse();
        const nullArray = Array(predictionDates.length).fill(null);
        const nullArray2 = Array(dates.length).fill(null);
        return {
            overview,
            scoreTrends: {
                dates: [...dates, ...predictionDates],
                scores: [...scores, ...nullArray],
                prediction: [...nullArray2, ...predictionScores],
            },
            sectionPerformance,
            peerComparison,
            goals,
            studyPatterns,
            predictions,
            milestones,
        };
    }
    /**
     * Add goal
     */
    static async addGoal(userId, targetScore, targetDate) {
        const analytics = await this.getOrCreateAnalytics(userId);
        const goalId = new mongoose_1.default.Types.ObjectId();
        const daysRemaining = Math.ceil((targetDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
        const scoreGap = targetScore - analytics.currentScore;
        const requiredDailyProgress = daysRemaining > 0 ? scoreGap / daysRemaining : 0;
        analytics.goals.push({
            goalId,
            targetScore,
            currentScore: analytics.currentScore,
            progressPercentage: (analytics.currentScore / targetScore) * 100,
            onTrack: true,
            estimatedCompletionDate: targetDate,
            daysRemaining,
            requiredDailyProgress,
        });
        await analytics.save();
    }
    /**
     * Check and add milestones
     */
    static async checkMilestones(userId) {
        const analytics = await this.getOrCreateAnalytics(userId);
        const profile = await UserLearningProfile_1.UserLearningProfile.findOne({
            userId: new mongoose_1.default.Types.ObjectId(userId),
        });
        if (!profile)
            return;
        const existingMilestoneTypes = new Set(analytics.milestones.map((m) => m.type + m.value));
        const scoreMilestones = [300, 400, 500, 600];
        scoreMilestones.forEach((score) => {
            if (analytics.currentScore >= score &&
                !existingMilestoneTypes.has(`score${score}`)) {
                analytics.milestones.push({
                    type: 'score',
                    description: `${score}점 달성!`,
                    achievedAt: new Date(),
                    value: score,
                });
            }
        });
        const streakMilestones = [7, 30, 100, 365];
        if (profile.learningPatterns.consistencyScore >= 80) {
            const currentStreak = Math.floor(profile.learningPatterns.consistencyScore / 2);
            streakMilestones.forEach((days) => {
                if (currentStreak >= days && !existingMilestoneTypes.has(`streak${days}`)) {
                    analytics.milestones.push({
                        type: 'streak',
                        description: `${days}일 연속 학습!`,
                        achievedAt: new Date(),
                        value: days,
                    });
                }
            });
        }
        const questionMilestones = [100, 500, 1000, 5000, 10000];
        questionMilestones.forEach((count) => {
            if (analytics.totalQuestionsAttempted >= count &&
                !existingMilestoneTypes.has(`questions${count}`)) {
                analytics.milestones.push({
                    type: 'questions',
                    description: `${count}문제 풀이 완료!`,
                    achievedAt: new Date(),
                    value: count,
                });
            }
        });
        const timeMilestones = [10, 50, 100, 500, 1000];
        const totalHours = analytics.totalStudyTime / 60;
        timeMilestones.forEach((hours) => {
            if (totalHours >= hours && !existingMilestoneTypes.has(`time${hours}`)) {
                analytics.milestones.push({
                    type: 'time',
                    description: `${hours}시간 학습 달성!`,
                    achievedAt: new Date(),
                    value: hours,
                });
            }
        });
        await analytics.save();
    }
    /**
     * Get performance insights
     */
    static async getInsights(userId) {
        const analytics = await this.getOrCreateAnalytics(userId);
        const strengths = [];
        const weaknesses = [];
        const opportunities = [];
        const recommendations = [];
        analytics.sectionPerformance.forEach((sp) => {
            if (sp.averageAccuracy >= 80) {
                strengths.push(`${sp.section} 영역에서 ${sp.averageAccuracy.toFixed(1)}%의 높은 정답률`);
            }
            else if (sp.averageAccuracy < 60) {
                weaknesses.push(`${sp.section} 영역의 정답률이 ${sp.averageAccuracy.toFixed(1)}%로 낮음`);
                recommendations.push(`${sp.section} 영역 집중 학습 필요`);
            }
        });
        if (analytics.scoreChange30Days > 50) {
            strengths.push(`최근 30일간 ${analytics.scoreChange30Days}점 상승`);
        }
        else if (analytics.scoreChange30Days < 0) {
            weaknesses.push(`최근 30일간 점수 하락 추세`);
            recommendations.push('학습 방법을 재검토하고 개선이 필요합니다');
        }
        if (analytics.learningVelocity.questionsPerDay >= 30) {
            strengths.push(`하루 평균 ${analytics.learningVelocity.questionsPerDay.toFixed(0)}문제 풀이로 우수한 학습량`);
        }
        else if (analytics.learningVelocity.questionsPerDay < 10) {
            weaknesses.push('하루 평균 학습량이 부족합니다');
            recommendations.push('하루 최소 20-30문제 풀이를 목표로 하세요');
        }
        if (analytics.peerComparison.percentile >= 75) {
            strengths.push(`상위 ${100 - analytics.peerComparison.percentile}% 성적`);
        }
        else if (analytics.peerComparison.percentile < 25) {
            opportunities.push('많은 개선 여지가 있습니다');
            recommendations.push('기초부터 체계적으로 학습하세요');
        }
        if (analytics.sectionPerformance.length > 0) {
            const weakest = analytics.sectionPerformance[analytics.sectionPerformance.length - 1];
            opportunities.push(`${weakest.section} 영역 개선으로 전체 점수 향상 가능`);
        }
        return { strengths, weaknesses, opportunities, recommendations };
    }
}
exports.LearningAnalyticsService = LearningAnalyticsService;
//# sourceMappingURL=learningAnalyticsService.js.map