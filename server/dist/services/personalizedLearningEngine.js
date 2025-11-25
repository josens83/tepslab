"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PersonalizedLearningEngine = void 0;
const TEPSQuestion_1 = require("../models/TEPSQuestion");
const tepsQuestionBankService_1 = require("./tepsQuestionBankService");
/**
 * Personalized Learning Engine
 * Uses IRT and AI to create adaptive learning paths
 */
class PersonalizedLearningEngine {
    /**
     * Initialize user learning profile
     */
    static async initializeProfile(userId) {
        const profile = {
            userId,
            abilityEstimates: {
                listening: 0,
                vocabulary: 0,
                grammar: 0,
                reading: 0,
                overall: 0,
            },
            performanceHistory: [],
            weakTopics: [],
            strongTopics: [],
            learningPatterns: {
                optimalStudyTime: 'evening',
                averageSessionDuration: 30,
                preferredDifficulty: TEPSQuestion_1.DifficultyLevel.MEDIUM,
                learningSpeed: 'average',
                consistencyScore: 0,
            },
            lastUpdated: new Date(),
        };
        return profile;
    }
    /**
     * Update user profile based on question response
     * Uses IRT to estimate ability
     */
    static async updateProfileWithResponse(profile, response) {
        const { question, isCorrect, timeSpent } = response;
        const section = question.section;
        // Add to performance history
        profile.performanceHistory.push({
            section,
            questionId: question._id.toString(),
            isCorrect,
            timeSpent,
            difficulty: question.statistics.difficulty,
            timestamp: response.timestamp,
        });
        // Limit history to last 500 responses
        if (profile.performanceHistory.length > 500) {
            profile.performanceHistory = profile.performanceHistory.slice(-500);
        }
        // Update ability estimate using IRT
        profile.abilityEstimates[section] = this.estimateAbilityIRT(profile.abilityEstimates[section], question, isCorrect);
        // Update overall ability
        profile.abilityEstimates.overall =
            (profile.abilityEstimates.listening +
                profile.abilityEstimates.vocabulary +
                profile.abilityEstimates.grammar +
                profile.abilityEstimates.reading) /
                4;
        // Update topic performance
        await this.updateTopicPerformance(profile, question, isCorrect);
        // Update learning patterns
        await this.updateLearningPatterns(profile);
        profile.lastUpdated = new Date();
        return profile;
    }
    /**
     * Estimate ability using IRT (Bayesian update)
     */
    static estimateAbilityIRT(currentAbility, question, isCorrect) {
        const b = question.statistics.difficulty; // difficulty
        const a = question.statistics.discrimination; // discrimination
        const c = question.statistics.guessing; // guessing
        // Calculate probability of correct answer given current ability
        const exponent = -a * (currentAbility - b);
        const expectedP = c + (1 - c) / (1 + Math.exp(exponent));
        // Calculate information (Fisher information)
        const q = 1 - expectedP;
        const pPrime = a * (1 - c) * Math.exp(exponent) / Math.pow(1 + Math.exp(exponent), 2);
        const information = (a * a * pPrime * pPrime) / (expectedP * q);
        // Update ability using maximum likelihood estimation
        const actualP = isCorrect ? 1 : 0;
        const residual = actualP - expectedP;
        // Learning rate based on information (more information = faster update)
        const learningRate = Math.min(0.5, 1 / Math.sqrt(information + 1));
        const newAbility = currentAbility + learningRate * residual * (1 / a);
        // Bound ability to reasonable range
        return Math.max(-3, Math.min(3, newAbility));
    }
    /**
     * Update topic-level performance tracking
     */
    static async updateTopicPerformance(profile, question, isCorrect) {
        const { section, topic } = question;
        // Update weak topics
        const weakTopicIndex = profile.weakTopics.findIndex((wt) => wt.section === section && wt.topic === topic);
        if (weakTopicIndex !== -1) {
            const wt = profile.weakTopics[weakTopicIndex];
            wt.errorRate =
                (wt.errorRate * wt.questionAttempts + (isCorrect ? 0 : 1)) /
                    (wt.questionAttempts + 1);
            wt.questionAttempts += 1;
            // Remove from weak topics if error rate is now low
            if (wt.errorRate < 0.3 && wt.questionAttempts >= 10) {
                profile.weakTopics.splice(weakTopicIndex, 1);
            }
        }
        else if (!isCorrect) {
            // Add to weak topics if incorrect
            profile.weakTopics.push({
                section,
                topic,
                errorRate: 1.0,
                questionAttempts: 1,
            });
        }
        // Update strong topics
        const strongTopicIndex = profile.strongTopics.findIndex((st) => st.section === section && st.topic === topic);
        if (strongTopicIndex !== -1) {
            const st = profile.strongTopics[strongTopicIndex];
            st.successRate =
                (st.successRate * st.questionAttempts + (isCorrect ? 1 : 0)) /
                    (st.questionAttempts + 1);
            st.questionAttempts += 1;
            // Remove from strong topics if success rate drops
            if (st.successRate < 0.7 && st.questionAttempts >= 10) {
                profile.strongTopics.splice(strongTopicIndex, 1);
            }
        }
        else if (isCorrect) {
            // Add to strong topics if correct
            profile.strongTopics.push({
                section,
                topic,
                successRate: 1.0,
                questionAttempts: 1,
            });
        }
        // Sort and limit
        profile.weakTopics.sort((a, b) => b.errorRate - a.errorRate);
        profile.weakTopics = profile.weakTopics.slice(0, 20);
        profile.strongTopics.sort((a, b) => b.successRate - a.successRate);
        profile.strongTopics = profile.strongTopics.slice(0, 20);
    }
    /**
     * Update learning patterns
     */
    static async updateLearningPatterns(profile) {
        const recentHistory = profile.performanceHistory.slice(-100);
        if (recentHistory.length < 10)
            return;
        // Calculate optimal study time
        const timeDistribution = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        const performanceByTime = { morning: 0, afternoon: 0, evening: 0, night: 0 };
        recentHistory.forEach((h) => {
            const hour = h.timestamp.getHours();
            let timeOfDay;
            if (hour >= 6 && hour < 12)
                timeOfDay = 'morning';
            else if (hour >= 12 && hour < 17)
                timeOfDay = 'afternoon';
            else if (hour >= 17 && hour < 22)
                timeOfDay = 'evening';
            else
                timeOfDay = 'night';
            timeDistribution[timeOfDay]++;
            performanceByTime[timeOfDay] += h.isCorrect ? 1 : 0;
        });
        // Find best performance time
        let bestTime = 'evening';
        let bestRate = 0;
        Object.keys(performanceByTime).forEach((time) => {
            const count = timeDistribution[time];
            if (count >= 5) {
                const rate = performanceByTime[time] / count;
                if (rate > bestRate) {
                    bestRate = rate;
                    bestTime = time;
                }
            }
        });
        profile.learningPatterns.optimalStudyTime = bestTime;
        // Calculate average session duration (group by date)
        const sessionsByDate = new Map();
        recentHistory.forEach((h) => {
            const dateKey = h.timestamp.toISOString().split('T')[0];
            if (!sessionsByDate.has(dateKey)) {
                sessionsByDate.set(dateKey, []);
            }
            sessionsByDate.get(dateKey).push(h.timeSpent);
        });
        const sessionDurations = Array.from(sessionsByDate.values()).map((times) => times.reduce((sum, t) => sum + t, 0));
        const avgDuration = sessionDurations.reduce((sum, d) => sum + d, 0) / sessionDurations.length / 60;
        profile.learningPatterns.averageSessionDuration = Math.round(avgDuration);
        // Determine learning speed (based on rate of ability improvement)
        const earlyAbility = this.calculateAverageAbility(recentHistory.slice(0, 30));
        const lateAbility = this.calculateAverageAbility(recentHistory.slice(-30));
        const improvement = lateAbility - earlyAbility;
        if (improvement > 0.5)
            profile.learningPatterns.learningSpeed = 'fast';
        else if (improvement > 0.2)
            profile.learningPatterns.learningSpeed = 'average';
        else
            profile.learningPatterns.learningSpeed = 'slow';
        // Calculate consistency score (based on regular study)
        const studyDates = new Set(recentHistory.map((h) => h.timestamp.toISOString().split('T')[0]));
        const daysCovered = studyDates.size;
        const totalDays = Math.ceil((recentHistory[recentHistory.length - 1].timestamp.getTime() -
            recentHistory[0].timestamp.getTime()) /
            (1000 * 60 * 60 * 24));
        profile.learningPatterns.consistencyScore = Math.round((daysCovered / totalDays) * 100);
    }
    /**
     * Calculate average ability from performance history
     */
    static calculateAverageAbility(history) {
        if (history.length === 0)
            return 0;
        let ability = 0;
        history.forEach((h) => {
            // Simple estimation based on difficulty and correctness
            if (h.isCorrect) {
                ability += h.difficulty;
            }
            else {
                ability += h.difficulty - 1;
            }
        });
        return ability / history.length;
    }
    /**
     * Generate personalized study plan
     */
    static async generateStudyPlan(profile, goalScore, targetWeeks = 12) {
        const currentScore = this.abilityToScore(profile.abilityEstimates.overall);
        const scoreGap = goalScore - currentScore;
        // Calculate weekly score increase needed
        const weeklyIncrease = scoreGap / targetWeeks;
        // Generate weekly plans
        const weeklyPlan = [];
        for (let week = 1; week <= targetWeeks; week++) {
            const focusSections = this.determineFocusSections(profile, week);
            const dailySessions = this.generateDailySessions(profile, focusSections, weeklyIncrease);
            weeklyPlan.push({
                week,
                focus: focusSections,
                dailySessions,
                expectedProgress: weeklyIncrease,
            });
        }
        // Generate milestones
        const milestones = [];
        for (let week = 4; week <= targetWeeks; week += 4) {
            milestones.push({
                week,
                targetScore: currentScore + weeklyIncrease * week,
                description: `Reach ${Math.round(currentScore + weeklyIncrease * week)} points`,
            });
        }
        // Generate recommendations
        const recommendations = await this.generateRecommendations(profile);
        return {
            userId: profile.userId,
            goalScore,
            currentEstimatedScore: currentScore,
            weeksToGoal: targetWeeks,
            weeklyPlan,
            milestones,
            recommendations,
        };
    }
    /**
     * Determine focus sections for a given week
     */
    static determineFocusSections(profile, week) {
        // Rotate focus sections while prioritizing weak areas
        const sectionAbilities = [
            { section: TEPSQuestion_1.TEPSSection.LISTENING, ability: profile.abilityEstimates.listening },
            { section: TEPSQuestion_1.TEPSSection.VOCABULARY, ability: profile.abilityEstimates.vocabulary },
            { section: TEPSQuestion_1.TEPSSection.GRAMMAR, ability: profile.abilityEstimates.grammar },
            { section: TEPSQuestion_1.TEPSSection.READING, ability: profile.abilityEstimates.reading },
        ];
        // Sort by ability (weakest first)
        sectionAbilities.sort((a, b) => a.ability - b.ability);
        // Alternate between focusing on weak and strong sections
        if (week % 3 === 0) {
            // Every 3rd week: comprehensive review (all sections)
            return [
                TEPSQuestion_1.TEPSSection.LISTENING,
                TEPSQuestion_1.TEPSSection.VOCABULARY,
                TEPSQuestion_1.TEPSSection.GRAMMAR,
                TEPSQuestion_1.TEPSSection.READING,
            ];
        }
        else if (week % 2 === 0) {
            // Even weeks: focus on 2 weakest sections
            return [sectionAbilities[0].section, sectionAbilities[1].section];
        }
        else {
            // Odd weeks: focus on 2 strongest sections (maintain strength)
            return [sectionAbilities[2].section, sectionAbilities[3].section];
        }
    }
    /**
     * Generate daily study sessions
     */
    static generateDailySessions(profile, focusSections, weeklyIncrease) {
        const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
        const sessions = [];
        days.forEach((day, index) => {
            // Sunday is lighter
            const questionCount = day === 'Sunday' ? 20 : 40;
            const estimatedMinutes = day === 'Sunday' ? 30 : 60;
            // Distribute sections across the week
            const daySections = focusSections.filter((_, i) => (i + index) % 2 === 0);
            // Select topics from weak areas
            const topics = profile.weakTopics
                .filter((wt) => daySections.includes(wt.section))
                .slice(0, 3)
                .map((wt) => wt.topic);
            sessions.push({
                day,
                sections: daySections,
                topics,
                questionCount,
                estimatedMinutes,
            });
        });
        return sessions;
    }
    /**
     * Generate personalized recommendations
     */
    static async generateRecommendations(profile) {
        const recommendations = [];
        // Recommendation 1: Focus on weakest topic
        if (profile.weakTopics.length > 0) {
            const weakest = profile.weakTopics[0];
            const questions = await tepsQuestionBankService_1.TEPSQuestionBankService.searchQuestions({
                section: weakest.section,
                topic: weakest.topic,
                difficultyLevel: [TEPSQuestion_1.DifficultyLevel.EASY, TEPSQuestion_1.DifficultyLevel.MEDIUM],
            }, 10);
            recommendations.push({
                priority: 'high',
                type: 'focus_weak_area',
                section: weakest.section,
                topic: weakest.topic,
                message: `Focus on ${weakest.topic} in ${weakest.section}. Your error rate is ${Math.round(weakest.errorRate * 100)}%.`,
                suggestedQuestions: questions.questions,
                estimatedTimeMinutes: 20,
            });
        }
        // Recommendation 2: Increase difficulty in strong areas
        if (profile.strongTopics.length > 0) {
            const strongest = profile.strongTopics[0];
            const questions = await tepsQuestionBankService_1.TEPSQuestionBankService.searchQuestions({
                section: strongest.section,
                topic: strongest.topic,
                difficultyLevel: [TEPSQuestion_1.DifficultyLevel.HARD, TEPSQuestion_1.DifficultyLevel.VERY_HARD],
            }, 10);
            recommendations.push({
                priority: 'medium',
                type: 'increase_difficulty',
                section: strongest.section,
                topic: strongest.topic,
                message: `Challenge yourself with harder ${strongest.topic} questions. You have ${Math.round(strongest.successRate * 100)}% success rate.`,
                suggestedQuestions: questions.questions,
                estimatedTimeMinutes: 25,
            });
        }
        // Recommendation 3: Review based on time since last practice
        const recentSections = new Set(profile.performanceHistory.slice(-50).map((h) => h.section));
        const allSections = Object.values(TEPSQuestion_1.TEPSSection);
        const neglectedSections = allSections.filter((s) => !recentSections.has(s));
        if (neglectedSections.length > 0) {
            const section = neglectedSections[0];
            const questions = await tepsQuestionBankService_1.TEPSQuestionBankService.searchQuestions({ section, difficultyLevel: TEPSQuestion_1.DifficultyLevel.MEDIUM }, 10);
            recommendations.push({
                priority: 'low',
                type: 'review',
                section,
                topic: 'General Review',
                message: `It's been a while since you practiced ${section}. Let's review to maintain your skills.`,
                suggestedQuestions: questions.questions,
                estimatedTimeMinutes: 15,
            });
        }
        return recommendations;
    }
    /**
     * Convert ability (theta) to TEPS score
     */
    static abilityToScore(ability) {
        // TEPS score ranges from 0 to 600
        // Map ability (-3 to +3) to score
        // Assuming mean = 300, SD = 100
        const score = 300 + ability * 100;
        return Math.max(0, Math.min(600, Math.round(score)));
    }
    /**
     * Convert TEPS score to ability (theta)
     */
    static scoreToAbility(score) {
        // Reverse of abilityToScore
        return (score - 300) / 100;
    }
    /**
     * Get next question for user (adaptive selection)
     */
    static async getNextQuestion(profile) {
        // Get recently answered questions to avoid repetition
        const recentQuestions = profile.performanceHistory
            .slice(-50)
            .map((h) => h.questionId);
        // Determine current focus section (rotate or focus on weak)
        let targetSection;
        if (profile.weakTopics.length > 0) {
            targetSection = profile.weakTopics[0].section;
        }
        else {
            // Rotate through sections
            const sections = Object.values(TEPSQuestion_1.TEPSSection);
            const lastSection = profile.performanceHistory[profile.performanceHistory.length - 1]?.section;
            const lastIndex = sections.indexOf(lastSection);
            targetSection = sections[(lastIndex + 1) % sections.length] || TEPSQuestion_1.TEPSSection.LISTENING;
        }
        const criteria = {
            userId: profile.userId,
            targetScore: profile.currentGoal?.targetScore || 450,
            currentAbility: profile.abilityEstimates[targetSection],
            weakTopics: profile.weakTopics
                .filter((wt) => wt.section === targetSection)
                .map((wt) => wt.topic),
            recentQuestions,
            preferredDifficulty: profile.learningPatterns.preferredDifficulty,
        };
        const questions = await tepsQuestionBankService_1.TEPSQuestionBankService.selectAdaptiveQuestions(criteria, 1);
        return questions[0] || null;
    }
}
exports.PersonalizedLearningEngine = PersonalizedLearningEngine;
//# sourceMappingURL=personalizedLearningEngine.js.map