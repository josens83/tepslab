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
exports.TestResult = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const answerDetailSchema = new mongoose_1.Schema({
    questionId: {
        type: mongoose_1.Schema.Types.ObjectId,
        required: true,
    },
    questionNumber: {
        type: Number,
        required: true,
    },
    selectedAnswer: {
        type: Number,
        required: true,
    },
    correctAnswer: {
        type: Number,
        required: true,
    },
    isCorrect: {
        type: Boolean,
        required: true,
    },
    timeSpent: Number,
});
const scoreBreakdownSchema = new mongoose_1.Schema({
    grammar: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    vocabulary: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    listening: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
    reading: {
        correct: { type: Number, default: 0 },
        total: { type: Number, default: 0 },
    },
});
const testResultSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    testId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Test',
        required: true,
    },
    answers: [answerDetailSchema],
    score: {
        type: Number,
        required: true,
    },
    totalQuestions: {
        type: Number,
        required: true,
    },
    correctAnswers: {
        type: Number,
        required: true,
    },
    percentage: {
        type: Number,
        required: true,
    },
    scoreBreakdown: scoreBreakdownSchema,
    estimatedScore: {
        type: Number,
        required: true,
    },
    timeSpent: {
        type: Number,
        required: true,
    },
    isPassed: {
        type: Boolean,
        required: true,
    },
    completedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});
// Indexes
testResultSchema.index({ userId: 1, testId: 1 });
testResultSchema.index({ userId: 1, completedAt: -1 });
testResultSchema.index({ testId: 1, score: -1 });
exports.TestResult = mongoose_1.default.model('TestResult', testResultSchema);
//# sourceMappingURL=TestResult.js.map