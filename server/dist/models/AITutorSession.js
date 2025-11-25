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
exports.AITutorSession = exports.SessionType = exports.MessageRole = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Message Role
 */
var MessageRole;
(function (MessageRole) {
    MessageRole["USER"] = "user";
    MessageRole["ASSISTANT"] = "assistant";
    MessageRole["SYSTEM"] = "system";
})(MessageRole || (exports.MessageRole = MessageRole = {}));
/**
 * Session Type
 */
var SessionType;
(function (SessionType) {
    SessionType["GENERAL_QA"] = "general_qa";
    SessionType["PROBLEM_EXPLANATION"] = "problem_explanation";
    SessionType["STUDY_COACHING"] = "study_coaching";
    SessionType["MOTIVATION"] = "motivation";
    SessionType["GOAL_SETTING"] = "goal_setting";
    SessionType["PROGRESS_REVIEW"] = "progress_review";
})(SessionType || (exports.SessionType = SessionType = {}));
const chatMessageSchema = new mongoose_1.Schema({
    role: {
        type: String,
        enum: Object.values(MessageRole),
        required: true,
    },
    content: {
        type: String,
        required: true,
    },
    timestamp: {
        type: Date,
        default: Date.now,
    },
    metadata: {
        questionId: String,
        section: String,
        relatedTopics: [String],
        sentimentScore: Number,
    },
}, { _id: false });
const sessionMetricsSchema = new mongoose_1.Schema({
    totalMessages: { type: Number, default: 0 },
    userMessages: { type: Number, default: 0 },
    assistantMessages: { type: Number, default: 0 },
    averageResponseTime: { type: Number, default: 0 },
    userSatisfaction: { type: Number, min: 1, max: 5 },
    helpfulness: { type: Number, min: 1, max: 5 },
    resolved: { type: Boolean, default: false },
}, { _id: false });
const aiTutorSessionSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    sessionType: {
        type: String,
        enum: Object.values(SessionType),
        required: true,
        index: true,
    },
    messages: {
        type: [chatMessageSchema],
        default: [],
    },
    context: {
        currentGoal: String,
        recentActivity: String,
        weakAreas: [String],
        strongAreas: [String],
        mood: {
            type: String,
            enum: ['frustrated', 'motivated', 'neutral', 'confused'],
        },
    },
    startedAt: {
        type: Date,
        default: Date.now,
    },
    endedAt: Date,
    isActive: {
        type: Boolean,
        default: true,
        index: true,
    },
    metrics: {
        type: sessionMetricsSchema,
        default: () => ({}),
    },
    relatedQuestions: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'TEPSQuestion',
        },
    ],
    relatedExams: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'TEPSExamAttempt',
        },
    ],
}, {
    timestamps: true,
});
// Indexes
aiTutorSessionSchema.index({ userId: 1, isActive: 1 });
aiTutorSessionSchema.index({ userId: 1, sessionType: 1 });
aiTutorSessionSchema.index({ startedAt: -1 });
/**
 * Add message to session
 */
aiTutorSessionSchema.methods.addMessage = async function (role, content, metadata) {
    const message = {
        role,
        content,
        timestamp: new Date(),
        metadata,
    };
    this.messages.push(message);
    // Update metrics
    this.metrics.totalMessages += 1;
    if (role === MessageRole.USER) {
        this.metrics.userMessages += 1;
    }
    else if (role === MessageRole.ASSISTANT) {
        this.metrics.assistantMessages += 1;
    }
    await this.save();
};
/**
 * End session
 */
aiTutorSessionSchema.methods.endSession = async function () {
    this.isActive = false;
    this.endedAt = new Date();
    // Calculate average response time
    let totalResponseTime = 0;
    let responseCount = 0;
    for (let i = 1; i < this.messages.length; i++) {
        if (this.messages[i].role === MessageRole.ASSISTANT &&
            this.messages[i - 1].role === MessageRole.USER) {
            const responseTime = (this.messages[i].timestamp.getTime() -
                this.messages[i - 1].timestamp.getTime()) /
                1000;
            totalResponseTime += responseTime;
            responseCount += 1;
        }
    }
    if (responseCount > 0) {
        this.metrics.averageResponseTime = totalResponseTime / responseCount;
    }
    await this.save();
};
/**
 * Calculate overall sentiment of conversation
 */
aiTutorSessionSchema.methods.calculateSentiment = function () {
    const sentiments = this.messages
        .filter((m) => m.metadata?.sentimentScore !== undefined)
        .map((m) => m.metadata.sentimentScore);
    if (sentiments.length === 0)
        return 'neutral';
    const avgSentiment = sentiments.reduce((sum, s) => sum + s, 0) / sentiments.length;
    if (avgSentiment > 0.3)
        return 'positive';
    if (avgSentiment < -0.3)
        return 'negative';
    return 'neutral';
};
exports.AITutorSession = mongoose_1.default.model('AITutorSession', aiTutorSessionSchema);
//# sourceMappingURL=AITutorSession.js.map