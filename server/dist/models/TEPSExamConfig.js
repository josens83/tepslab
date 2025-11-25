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
exports.TEPSExamConfig = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const TEPSExam_1 = require("./TEPSExam");
const sectionConfigSchema = new mongoose_1.Schema({
    section: {
        type: String,
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
const tepsExamConfigSchema = new mongoose_1.Schema({
    // Basic Info
    name: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
        trim: true,
    },
    examType: {
        type: String,
        enum: Object.values(TEPSExam_1.ExamType),
        required: true,
        index: true,
    },
    difficulty: {
        type: String,
        enum: Object.values(TEPSExam_1.ExamDifficulty),
        required: true,
        index: true,
    },
    // Timing
    totalTimeLimit: {
        type: Number,
        required: true,
        min: 1,
    },
    timePerSection: {
        type: Boolean,
        default: false,
    },
    allowPause: {
        type: Boolean,
        default: false,
    },
    maxPauseDuration: Number,
    // Sections
    sections: {
        type: [sectionConfigSchema],
        required: true,
        validate: [
            (val) => val.length > 0,
            'At least one section is required',
        ],
    },
    // Rules
    allowReview: {
        type: Boolean,
        default: true,
    },
    shuffleQuestions: {
        type: Boolean,
        default: false,
    },
    shuffleOptions: {
        type: Boolean,
        default: false,
    },
    showTimer: {
        type: Boolean,
        default: true,
    },
    autoSubmit: {
        type: Boolean,
        default: true,
    },
    // Scoring
    showScoreImmediately: {
        type: Boolean,
        default: true,
    },
    showCorrectAnswers: {
        type: Boolean,
        default: true,
    },
    showExplanations: {
        type: Boolean,
        default: true,
    },
    // Official Exam Simulation
    isOfficialFormat: {
        type: Boolean,
        default: false,
    },
    examDate: Date,
    // Metadata
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    isPublic: {
        type: Boolean,
        default: true,
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    usageCount: {
        type: Number,
        default: 0,
        min: 0,
    },
    averageScore: {
        type: Number,
        default: 0,
        min: 0,
        max: 600,
    },
    averageCompletionTime: {
        type: Number,
        default: 0,
        min: 0,
    },
}, {
    timestamps: true,
});
// Indexes
tepsExamConfigSchema.index({ examType: 1, difficulty: 1, isActive: 1 });
tepsExamConfigSchema.index({ isPublic: 1, isActive: 1 });
tepsExamConfigSchema.index({ createdBy: 1 });
exports.TEPSExamConfig = mongoose_1.default.model('TEPSExamConfig', tepsExamConfigSchema);
//# sourceMappingURL=TEPSExamConfig.js.map