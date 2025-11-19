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
exports.Test = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const questionSchema = new mongoose_1.Schema({
    questionNumber: {
        type: Number,
        required: true,
    },
    questionType: {
        type: String,
        enum: ['grammar', 'vocabulary', 'listening', 'reading'],
        required: true,
    },
    questionText: {
        type: String,
        required: true,
    },
    options: {
        type: [String],
        required: true,
        validate: {
            validator: (v) => v.length === 4,
            message: 'Options must have exactly 4 choices',
        },
    },
    correctAnswer: {
        type: Number,
        required: true,
        min: 0,
        max: 3,
    },
    explanation: String,
    difficulty: {
        type: String,
        enum: ['easy', 'medium', 'hard'],
        default: 'medium',
    },
    audioUrl: String,
    imageUrl: String,
});
const testSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    testType: {
        type: String,
        enum: ['diagnostic', 'practice', 'mock'],
        default: 'diagnostic',
    },
    targetScore: {
        type: Number,
        required: true,
    },
    duration: {
        type: Number,
        required: true,
        default: 30, // 30 minutes default
    },
    questions: [questionSchema],
    totalQuestions: {
        type: Number,
        required: true,
    },
    passingScore: {
        type: Number,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: true,
    },
}, {
    timestamps: true,
});
// Indexes
testSchema.index({ testType: 1, isActive: 1 });
testSchema.index({ targetScore: 1 });
exports.Test = mongoose_1.default.model('Test', testSchema);
//# sourceMappingURL=Test.js.map