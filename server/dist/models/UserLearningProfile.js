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
exports.UserLearningProfile = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TEPSQuestion_1 = require("./TEPSQuestion");
const performanceHistorySchema = new mongoose_1.Schema({
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    questionId: {
        type: String,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    timeSpent: {
        type: Number,
        required: true,
    },
    difficulty: {
        type: Number,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });
const weakTopicSchema = new mongoose_1.Schema({
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    errorRate: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
    questionAttempts: {
        type: Number,
        required: true,
        default: 0,
    },
}, { _id: false });
const strongTopicSchema = new mongoose_1.Schema({
    section: {
        type: String,
        enum: Object.values(TEPSQuestion_1.TEPSSection),
        required: true,
    },
    topic: {
        type: String,
        required: true,
    },
    successRate: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
    },
    questionAttempts: {
        type: Number,
        required: true,
        default: 0,
    },
}, { _id: false });
const learningPatternsSchema = new mongoose_1.Schema({
    optimalStudyTime: {
        type: String,
        default: 'evening',
    },
    averageSessionDuration: {
        type: Number,
        default: 30,
    },
    preferredDifficulty: {
        type: Number,
        enum: Object.values(TEPSQuestion_1.DifficultyLevel).filter((v) => typeof v === 'number'),
        default: TEPSQuestion_1.DifficultyLevel.MEDIUM,
    },
    learningSpeed: {
        type: String,
        enum: ['slow', 'average', 'fast'],
        default: 'average',
    },
    consistencyScore: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
}, { _id: false });
const currentGoalSchema = new mongoose_1.Schema({
    targetScore: {
        type: Number,
        required: true,
        min: 0,
        max: 600,
    },
    targetDate: {
        type: Date,
        required: true,
    },
    recommendedDailyMinutes: {
        type: Number,
        required: true,
    },
    progressPercentage: {
        type: Number,
        min: 0,
        max: 100,
        default: 0,
    },
}, { _id: false });
const userLearningProfileSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true,
    },
    abilityEstimates: {
        listening: { type: Number, default: 0, min: -3, max: 3 },
        vocabulary: { type: Number, default: 0, min: -3, max: 3 },
        grammar: { type: Number, default: 0, min: -3, max: 3 },
        reading: { type: Number, default: 0, min: -3, max: 3 },
        overall: { type: Number, default: 0, min: -3, max: 3 },
    },
    performanceHistory: {
        type: [performanceHistorySchema],
        default: [],
    },
    weakTopics: {
        type: [weakTopicSchema],
        default: [],
    },
    strongTopics: {
        type: [strongTopicSchema],
        default: [],
    },
    learningPatterns: {
        type: learningPatternsSchema,
        default: () => ({}),
    },
    currentGoal: currentGoalSchema,
}, {
    timestamps: true,
});
// Limit performance history to 500 entries
userLearningProfileSchema.pre('save', function (next) {
    if (this.performanceHistory.length > 500) {
        this.performanceHistory = this.performanceHistory.slice(-500);
    }
    next();
});
exports.UserLearningProfile = mongoose_1.default.model('UserLearningProfile', userLearningProfileSchema);
//# sourceMappingURL=UserLearningProfile.js.map