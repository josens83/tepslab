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
exports.TEPSQuestion = exports.DifficultyLevel = exports.TEPSSection = exports.TEPSQuestionType = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * TEPS Question Types
 */
var TEPSQuestionType;
(function (TEPSQuestionType) {
    // Part 1: Listening Comprehension
    TEPSQuestionType["LISTENING_SHORT_CONVERSATION"] = "listening_short_conversation";
    TEPSQuestionType["LISTENING_LONG_CONVERSATION"] = "listening_long_conversation";
    TEPSQuestionType["LISTENING_SHORT_TALK"] = "listening_short_talk";
    TEPSQuestionType["LISTENING_LONG_TALK"] = "listening_long_talk";
    // Part 2: Vocabulary
    TEPSQuestionType["VOCABULARY_DEFINITION"] = "vocabulary_definition";
    TEPSQuestionType["VOCABULARY_CONTEXT"] = "vocabulary_context";
    TEPSQuestionType["VOCABULARY_SYNONYM"] = "vocabulary_synonym";
    // Part 3: Grammar
    TEPSQuestionType["GRAMMAR_ERROR_IDENTIFICATION"] = "grammar_error_identification";
    TEPSQuestionType["GRAMMAR_BLANK_FILLING"] = "grammar_blank_filling";
    TEPSQuestionType["GRAMMAR_SENTENCE_COMPLETION"] = "grammar_sentence_completion";
    // Part 4: Reading Comprehension
    TEPSQuestionType["READING_MAIN_IDEA"] = "reading_main_idea";
    TEPSQuestionType["READING_DETAIL"] = "reading_detail";
    TEPSQuestionType["READING_INFERENCE"] = "reading_inference";
    TEPSQuestionType["READING_VOCABULARY_IN_CONTEXT"] = "reading_vocabulary_in_context";
    TEPSQuestionType["READING_ORGANIZATION"] = "reading_organization";
})(TEPSQuestionType || (exports.TEPSQuestionType = TEPSQuestionType = {}));
/**
 * TEPS Section Classification
 */
var TEPSSection;
(function (TEPSSection) {
    TEPSSection["LISTENING"] = "listening";
    TEPSSection["VOCABULARY"] = "vocabulary";
    TEPSSection["GRAMMAR"] = "grammar";
    TEPSSection["READING"] = "reading";
})(TEPSSection || (exports.TEPSSection = TEPSSection = {}));
/**
 * Difficulty Level (based on IRT)
 */
var DifficultyLevel;
(function (DifficultyLevel) {
    DifficultyLevel[DifficultyLevel["VERY_EASY"] = 1] = "VERY_EASY";
    DifficultyLevel[DifficultyLevel["EASY"] = 2] = "EASY";
    DifficultyLevel[DifficultyLevel["MEDIUM"] = 3] = "MEDIUM";
    DifficultyLevel[DifficultyLevel["HARD"] = 4] = "HARD";
    DifficultyLevel[DifficultyLevel["VERY_HARD"] = 5] = "VERY_HARD";
})(DifficultyLevel || (exports.DifficultyLevel = DifficultyLevel = {}));
const questionStatisticsSchema = new mongoose_1.Schema({
    difficulty: { type: Number, default: 0, min: -3, max: 3 },
    discrimination: { type: Number, default: 1, min: 0, max: 2 },
    guessing: { type: Number, default: 0.25, min: 0, max: 0.25 },
    timesUsed: { type: Number, default: 0 },
    timesCorrect: { type: Number, default: 0 },
    timesIncorrect: { type: Number, default: 0 },
    averageTimeSpent: { type: Number, default: 0 },
    performanceByLevel: [
        {
            level: String,
            correctRate: Number,
            sampleSize: Number,
        },
    ],
}, { _id: false });
const audioResourceSchema = new mongoose_1.Schema({
    url: { type: String, required: true },
    duration: { type: Number, required: true },
    transcript: { type: String, required: true },
    speakers: { type: Number, default: 1 },
    accentType: {
        type: String,
        enum: ['american', 'british', 'canadian', 'australian'],
        default: 'american',
    },
}, { _id: false });
const readingPassageSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    wordCount: { type: Number, required: true },
    readingLevel: { type: String, required: true },
    genre: {
        type: String,
        enum: ['academic', 'business', 'news', 'literature', 'science'],
        required: true,
    },
    topic: { type: String, required: true },
}, { _id: false });
const tepsQuestionSchema = new mongoose_1.Schema({
    questionType: {
        type: String,
        enum: Object.values(TEPSQuestionType),
        required: true,
        index: true,
    },
    section: {
        type: String,
        enum: Object.values(TEPSSection),
        required: true,
        index: true,
    },
    difficultyLevel: {
        type: Number,
        enum: Object.values(DifficultyLevel).filter((v) => typeof v === 'number'),
        required: true,
        index: true,
    },
    questionText: {
        type: String,
        required: true,
        trim: true,
    },
    options: {
        A: { type: String, required: true, trim: true },
        B: { type: String, required: true, trim: true },
        C: { type: String, required: true, trim: true },
        D: { type: String, required: true, trim: true },
    },
    correctAnswer: {
        type: String,
        enum: ['A', 'B', 'C', 'D'],
        required: true,
    },
    audioResource: audioResourceSchema,
    readingPassage: readingPassageSchema,
    imageUrl: String,
    explanation: {
        type: String,
        required: true,
        trim: true,
    },
    keyPoints: [String],
    relatedConcepts: [String],
    tips: [String],
    topic: {
        type: String,
        required: true,
        trim: true,
        index: true,
    },
    subtopic: {
        type: String,
        trim: true,
    },
    tags: {
        type: [String],
        index: true,
    },
    keywords: [String],
    isOfficialQuestion: {
        type: Boolean,
        default: false,
        index: true,
    },
    examYear: Number,
    examMonth: Number,
    officialQuestionNumber: Number,
    statistics: {
        type: questionStatisticsSchema,
        default: () => ({}),
    },
    prerequisiteKnowledge: [String],
    learningObjectives: [String],
    reviewStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected', 'needs_revision'],
        default: 'pending',
        index: true,
    },
    reviewedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    reviewedAt: Date,
    qualityScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
    isAIGenerated: {
        type: Boolean,
        default: false,
    },
    generationMethod: {
        type: String,
        enum: ['openai', 'pattern_based', 'manual'],
    },
    generatedAt: Date,
}, {
    timestamps: true,
});
// Indexes for efficient querying
tepsQuestionSchema.index({ section: 1, difficultyLevel: 1 });
tepsQuestionSchema.index({ topic: 1, questionType: 1 });
tepsQuestionSchema.index({ tags: 1, difficultyLevel: 1 });
tepsQuestionSchema.index({ 'statistics.difficulty': 1 });
tepsQuestionSchema.index({ reviewStatus: 1, qualityScore: -1 });
tepsQuestionSchema.index({ createdAt: -1 });
/**
 * Calculate difficulty using IRT 3-parameter model
 */
tepsQuestionSchema.methods.calculateDifficulty = function () {
    const stats = this.statistics;
    if (stats.timesUsed < 10) {
        // Not enough data, use initial difficulty
        return this.difficultyLevel;
    }
    const correctRate = stats.timesCorrect / stats.timesUsed;
    // IRT difficulty parameter (b)
    // Higher b means more difficult (fewer people get it right)
    // b ranges from -3 (very easy) to +3 (very hard)
    const difficulty = -Math.log((correctRate - stats.guessing) / (1 - correctRate));
    return Math.max(-3, Math.min(3, difficulty));
};
/**
 * Update question statistics after each use
 */
tepsQuestionSchema.methods.updateStatistics = async function (isCorrect, timeSpent, userLevel) {
    const stats = this.statistics;
    stats.timesUsed += 1;
    if (isCorrect) {
        stats.timesCorrect += 1;
    }
    else {
        stats.timesIncorrect += 1;
    }
    // Update average time spent (running average)
    stats.averageTimeSpent =
        (stats.averageTimeSpent * (stats.timesUsed - 1) + timeSpent) / stats.timesUsed;
    // Update performance by level
    const levelRange = this.getUserLevelRange(userLevel);
    const levelStat = stats.performanceByLevel.find((p) => p.level === levelRange);
    if (levelStat) {
        levelStat.correctRate =
            (levelStat.correctRate * levelStat.sampleSize + (isCorrect ? 1 : 0)) /
                (levelStat.sampleSize + 1);
        levelStat.sampleSize += 1;
    }
    else {
        stats.performanceByLevel.push({
            level: levelRange,
            correctRate: isCorrect ? 1 : 0,
            sampleSize: 1,
        });
    }
    // Recalculate IRT difficulty parameter
    stats.difficulty = this.calculateDifficulty();
    // Update discrimination parameter based on variance
    if (stats.performanceByLevel.length >= 3) {
        const rates = stats.performanceByLevel.map((p) => p.correctRate);
        const variance = this.calculateVariance(rates);
        stats.discrimination = Math.min(2, variance * 2);
    }
    await this.save();
};
/**
 * Get similar questions based on topic, type, and difficulty
 */
tepsQuestionSchema.methods.getSimilarQuestions = async function (limit = 5) {
    const TEPSQuestion = mongoose_1.default.model('TEPSQuestion');
    return await TEPSQuestion.find({
        _id: { $ne: this._id },
        section: this.section,
        questionType: this.questionType,
        difficultyLevel: {
            $gte: Math.max(1, this.difficultyLevel - 1),
            $lte: Math.min(5, this.difficultyLevel + 1),
        },
        reviewStatus: 'approved',
    })
        .limit(limit)
        .exec();
};
/**
 * Helper: Get user level range
 */
tepsQuestionSchema.methods.getUserLevelRange = function (score) {
    if (score <= 200)
        return '0-200';
    if (score <= 300)
        return '201-300';
    if (score <= 400)
        return '301-400';
    if (score <= 500)
        return '401-500';
    if (score <= 600)
        return '501-600';
    return '601+';
};
/**
 * Helper: Calculate variance
 */
tepsQuestionSchema.methods.calculateVariance = function (values) {
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val) => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length;
};
exports.TEPSQuestion = mongoose_1.default.model('TEPSQuestion', tepsQuestionSchema);
//# sourceMappingURL=TEPSQuestion.js.map