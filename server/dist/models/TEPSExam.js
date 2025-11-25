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
exports.TEPSExamAttempt = exports.ExamStatus = exports.ExamDifficulty = exports.ExamType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TEPSQuestion_1 = require("./TEPSQuestion");
/**
 * Exam Type
 */
var ExamType;
(function (ExamType) {
    ExamType["OFFICIAL_SIMULATION"] = "official_simulation";
    ExamType["SECTION_PRACTICE"] = "section_practice";
    ExamType["MICRO_LEARNING"] = "micro_learning";
    ExamType["ADAPTIVE_TEST"] = "adaptive_test";
    ExamType["MOCK_TEST"] = "mock_test";
})(ExamType || (exports.ExamType = ExamType = {}));
/**
 * Exam Difficulty
 */
var ExamDifficulty;
(function (ExamDifficulty) {
    ExamDifficulty["BEGINNER"] = "beginner";
    ExamDifficulty["INTERMEDIATE"] = "intermediate";
    ExamDifficulty["ADVANCED"] = "advanced";
    ExamDifficulty["EXPERT"] = "expert";
    ExamDifficulty["ADAPTIVE"] = "adaptive";
})(ExamDifficulty || (exports.ExamDifficulty = ExamDifficulty = {}));
/**
 * Exam Status
 */
var ExamStatus;
(function (ExamStatus) {
    ExamStatus["NOT_STARTED"] = "not_started";
    ExamStatus["IN_PROGRESS"] = "in_progress";
    ExamStatus["PAUSED"] = "paused";
    ExamStatus["COMPLETED"] = "completed";
    ExamStatus["ABANDONED"] = "abandoned";
    ExamStatus["EXPIRED"] = "expired";
})(ExamStatus || (exports.ExamStatus = ExamStatus = {}));
const sectionConfigSchema = new mongoose_1.Schema({
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    questionCount: {
        type: Number,
        required: true,
        min: 1,
    },
    timeLimit: {
        type: Number,
        required: true,
        min: 1,
    },
    questions: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'TEPSQuestion',
        },
    ],
}, { _id: false });
const userAnswerSchema = new mongoose_1.Schema({
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TEPSQuestion',
        required: true,
    },
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    selectedAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true,
    },
    timeSpent: {
        type: Number,
        required: true,
        min: 0,
    },
    isCorrect: Boolean,
    markedForReview: {
        type: Boolean,
        default: false,
    },
    answeredAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const sectionResultSchema = new mongoose_1.Schema({
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    correctAnswers: {
        type: Number,
        required: true,
        min: 0,
    },
    totalQuestions: {
        type: Number,
        required: true,
        min: 1,
    },
    accuracy: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    timeSpent: {
        type: Number,
        required: true,
        min: 0,
    },
    score: {
        type: Number,
        required: true,
        min: 0,
    },
    percentile: Number,
}, { _id: false });
const examResultSchema = new mongoose_1.Schema({
    totalScore: {
        type: Number,
        required: true,
        min: 0,
        max: 600,
    },
    percentile: {
        type: Number,
        required: true,
        min: 0,
        max: 100,
    },
    estimatedLevel: {
        type: String,
        required: true,
    },
    sectionResults: [sectionResultSchema],
    totalTimeSpent: {
        type: Number,
        required: true,
        min: 0,
    },
    averageTimePerQuestion: {
        type: Number,
        required: true,
        min: 0,
    },
    strengths: [String],
    weaknesses: [String],
    recommendations: [String],
    finalAbility: {
        type: Number,
        required: true,
        min: -3,
        max: 3,
    },
    abilityChange: {
        type: Number,
        required: true,
    },
    measurementError: {
        type: Number,
        required: true,
        min: 0,
    },
    comparedToAverage: {
        type: Number,
        required: true,
    },
    scoreDistribution: [
        {
            range: String,
            percentage: Number,
        },
    ],
}, { _id: false });
const proctoringSchema = new mongoose_1.Schema({
    webcamEnabled: { type: Boolean, default: false },
    faceDetected: { type: Boolean, default: false },
    multipleFacesDetected: { type: Boolean, default: false },
    recordingUrl: String,
}, { _id: false });
const tepsExamAttemptSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    examConfigId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'TEPSExamConfig',
        required: true,
    },
    examType: {
        type: String,
        enum: Object.values(ExamType),
        required: true,
        index: true,
    },
    difficulty: {
        type: String,
        enum: Object.values(ExamDifficulty),
        required: true,
    },
    status: {
        type: String,
        enum: Object.values(ExamStatus),
        default: ExamStatus.NOT_STARTED,
        index: true,
    },
    startedAt: Date,
    completedAt: Date,
    pausedAt: Date,
    totalPausedTime: {
        type: Number,
        default: 0,
        min: 0,
    },
    expiresAt: Date,
    answers: {
        type: [userAnswerSchema],
        default: [],
    },
    currentQuestionIndex: {
        type: Number,
        default: 0,
        min: 0,
    },
    currentSection: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
    },
    result: examResultSchema,
    ipAddress: String,
    userAgent: String,
    deviceType: {
        type: String,
        enum: ['desktop', 'tablet', 'mobile'],
        default: 'desktop',
    },
    tabSwitches: {
        type: Number,
        default: 0,
        min: 0,
    },
    fullscreenExits: {
        type: Number,
        default: 0,
        min: 0,
    },
    suspiciousActivity: {
        type: Boolean,
        default: false,
    },
    proctoring: proctoringSchema,
}, {
    timestamps: true,
});
// Indexes
tepsExamAttemptSchema.index({ userId: 1, status: 1 });
tepsExamAttemptSchema.index({ userId: 1, examType: 1 });
tepsExamAttemptSchema.index({ completedAt: -1 });
tepsExamAttemptSchema.index({ 'result.totalScore': -1 });
/**
 * Submit an answer
 */
tepsExamAttemptSchema.methods.submitAnswer = async function (questionId, answer, timeSpent) {
    const TEPSQuestion = mongoose_1.default.model('TEPSQuestion');
    const question = await TEPSQuestion.findById(questionId);
    if (!question) {
        throw new Error('Question not found');
    }
    const isCorrect = answer === question.correctAnswer;
    const userAnswer = {
        questionId: new mongoose_1.default.Types.ObjectId(questionId),
        section: question.section,
        selectedAnswer: answer,
        timeSpent,
        isCorrect,
        markedForReview: false,
        answeredAt: new Date(),
    };
    // Check if answer already exists for this question
    const existingIndex = this.answers.findIndex((a) => a.questionId.toString() === questionId);
    if (existingIndex !== -1) {
        // Update existing answer
        this.answers[existingIndex] = userAnswer;
    }
    else {
        // Add new answer
        this.answers.push(userAnswer);
    }
    await this.save();
};
/**
 * Pause exam
 */
tepsExamAttemptSchema.methods.pauseExam = async function () {
    if (this.status !== ExamStatus.IN_PROGRESS) {
        throw new Error('Can only pause an in-progress exam');
    }
    this.status = ExamStatus.PAUSED;
    this.pausedAt = new Date();
    await this.save();
};
/**
 * Resume exam
 */
tepsExamAttemptSchema.methods.resumeExam = async function () {
    if (this.status !== ExamStatus.PAUSED) {
        throw new Error('Can only resume a paused exam');
    }
    if (this.pausedAt) {
        const pausedDuration = (Date.now() - this.pausedAt.getTime()) / 1000;
        this.totalPausedTime += pausedDuration;
    }
    this.status = ExamStatus.IN_PROGRESS;
    this.pausedAt = undefined;
    await this.save();
};
/**
 * Complete exam
 */
tepsExamAttemptSchema.methods.completeExam = async function () {
    this.status = ExamStatus.COMPLETED;
    this.completedAt = new Date();
    // Calculate result
    this.result = await this.calculateResult();
    await this.save();
};
/**
 * Calculate exam result
 */
tepsExamAttemptSchema.methods.calculateResult = async function () {
    const TEPSExamConfig = mongoose_1.default.model('TEPSExamConfig');
    const config = await TEPSExamConfig.findById(this.examConfigId);
    if (!config) {
        throw new Error('Exam config not found');
    }
    // Calculate section results
    const sectionResults = [];
    for (const sectionConfig of config.sections) {
        const sectionAnswers = this.answers.filter((a) => a.section === sectionConfig.section);
        const correctAnswers = sectionAnswers.filter((a) => a.isCorrect).length;
        const totalQuestions = sectionConfig.questionCount;
        const accuracy = (correctAnswers / totalQuestions) * 100;
        const timeSpent = sectionAnswers.reduce((sum, a) => sum + a.timeSpent, 0);
        // Calculate section score (0-150 for each section in TEPS)
        const sectionScore = Math.round((correctAnswers / totalQuestions) * 150);
        sectionResults.push({
            section: sectionConfig.section,
            correctAnswers,
            totalQuestions,
            accuracy,
            timeSpent,
            score: sectionScore,
        });
    }
    // Calculate total score (sum of all sections)
    const totalScore = sectionResults.reduce((sum, sr) => sum + sr.score, 0);
    // Calculate total time spent
    const totalTimeSpent = this.answers.reduce((sum, a) => sum + a.timeSpent, 0);
    const averageTimePerQuestion = totalTimeSpent / this.answers.length;
    // Calculate ability (IRT theta)
    const finalAbility = (totalScore - 300) / 100;
    // Estimate CEFR level
    let estimatedLevel = '';
    if (totalScore < 200)
        estimatedLevel = 'A1-A2 (Elementary)';
    else if (totalScore < 300)
        estimatedLevel = 'A2-B1 (Pre-Intermediate)';
    else if (totalScore < 400)
        estimatedLevel = 'B1-B2 (Intermediate)';
    else if (totalScore < 500)
        estimatedLevel = 'B2-C1 (Upper Intermediate)';
    else
        estimatedLevel = 'C1-C2 (Advanced)';
    // Identify strengths and weaknesses
    const strengths = [];
    const weaknesses = [];
    sectionResults.forEach((sr) => {
        if (sr.accuracy >= 80) {
            strengths.push(`Strong performance in ${sr.section} (${sr.accuracy.toFixed(1)}%)`);
        }
        else if (sr.accuracy < 60) {
            weaknesses.push(`Needs improvement in ${sr.section} (${sr.accuracy.toFixed(1)}%)`);
        }
    });
    // Generate recommendations
    const recommendations = [];
    if (weaknesses.length > 0) {
        recommendations.push('Focus on weak areas with targeted practice');
        recommendations.push('Review explanations for incorrect answers');
    }
    if (totalScore < 400) {
        recommendations.push('Increase daily study time to 60+ minutes');
    }
    recommendations.push('Take regular mock exams to track progress');
    return {
        totalScore,
        percentile: 50, // TODO: Calculate from all test takers
        estimatedLevel,
        sectionResults,
        totalTimeSpent,
        averageTimePerQuestion,
        strengths,
        weaknesses,
        recommendations,
        finalAbility,
        abilityChange: 0, // TODO: Calculate from user profile
        measurementError: 0.3, // TODO: Calculate from IRT
        comparedToAverage: totalScore - 300,
        scoreDistribution: [], // TODO: Calculate from all test takers
    };
};
exports.TEPSExamAttempt = mongoose_1.default.model('TEPSExamAttempt', tepsExamAttemptSchema);
//# sourceMappingURL=TEPSExam.js.map