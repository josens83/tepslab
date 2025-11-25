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
exports.PartnerRequest = exports.LearningPartnership = exports.PartnershipStatus = void 0;
const mongoose_1 = __importStar(require("mongoose"));
/**
 * Partnership Status
 */
var PartnershipStatus;
(function (PartnershipStatus) {
    PartnershipStatus["PENDING"] = "pending";
    PartnershipStatus["ACTIVE"] = "active";
    PartnershipStatus["COMPLETED"] = "completed";
    PartnershipStatus["CANCELLED"] = "cancelled";
})(PartnershipStatus || (exports.PartnershipStatus = PartnershipStatus = {}));
/**
 * Learning Partnership Schema
 */
const learningPartnershipSchema = new mongoose_1.Schema({
    partner1: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    partner2: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    status: {
        type: String,
        enum: Object.values(PartnershipStatus),
        default: PartnershipStatus.PENDING
    },
    requestedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    requestedAt: {
        type: Date,
        default: Date.now
    },
    acceptedAt: Date,
    completedAt: Date,
    cancelledAt: Date,
    cancelledBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User'
    },
    matchScore: {
        type: Number,
        required: true,
        min: 0,
        max: 100
    },
    sharedGoals: [{
            type: String,
            maxlength: 200
        }],
    targetCompletionDate: Date,
    studySessions: [{
            scheduledAt: {
                type: Date,
                required: true
            },
            completedAt: Date,
            duration: {
                type: Number,
                required: true,
                min: 15
            },
            notes: {
                type: String,
                maxlength: 1000
            },
            attendees: [{
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'User'
                }]
        }],
    progressTracking: {
        partner1Progress: {
            initialScore: {
                type: Number,
                default: 0
            },
            currentScore: {
                type: Number,
                default: 0
            },
            questionsCompleted: {
                type: Number,
                default: 0
            },
            studyHours: {
                type: Number,
                default: 0
            }
        },
        partner2Progress: {
            initialScore: {
                type: Number,
                default: 0
            },
            currentScore: {
                type: Number,
                default: 0
            },
            questionsCompleted: {
                type: Number,
                default: 0
            },
            studyHours: {
                type: Number,
                default: 0
            }
        }
    },
    conversationId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    feedback: [{
            providedBy: {
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
                required: true
            },
            rating: {
                type: Number,
                required: true,
                min: 1,
                max: 5
            },
            comment: {
                type: String,
                maxlength: 500
            },
            createdAt: {
                type: Date,
                default: Date.now
            }
        }]
}, {
    timestamps: true
});
/**
 * Partner Request Schema
 */
const partnerRequestSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    criteria: {
        targetScore: {
            type: Number,
            required: true,
            min: 200,
            max: 990
        },
        currentScoreRange: {
            min: {
                type: Number,
                required: true
            },
            max: {
                type: Number,
                required: true
            }
        },
        targetSections: [{
                type: String,
                enum: ['grammar', 'vocabulary', 'listening', 'reading']
            }],
        preferredStudyTimes: [{
                type: String,
                enum: ['morning', 'afternoon', 'evening', 'night']
            }],
        studyFrequency: {
            type: String,
            enum: ['daily', 'several-times-week', 'weekly'],
            required: true
        },
        learningStyle: {
            type: String,
            enum: ['visual', 'auditory', 'kinesthetic', 'mixed']
        },
        goals: [{
                type: String,
                maxlength: 200
            }]
    },
    introduction: {
        type: String,
        required: true,
        minlength: 20,
        maxlength: 500
    },
    availability: {
        days: [{
                type: String,
                enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
            }],
        timeSlots: [{
                type: String,
                enum: ['morning', 'afternoon', 'evening', 'night']
            }]
    },
    preferences: {
        groupSize: {
            type: Number,
            default: 1,
            min: 1,
            max: 5
        },
        minAge: {
            type: Number,
            min: 13,
            max: 100
        },
        maxAge: {
            type: Number,
            min: 13,
            max: 100
        },
        sameGender: Boolean
    },
    isActive: {
        type: Boolean,
        default: true
    },
    matchedWith: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User'
        }],
    expiresAt: {
        type: Date,
        required: true,
        default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
}, {
    timestamps: true
});
// Indexes for LearningPartnership
learningPartnershipSchema.index({ partner1: 1, partner2: 1 });
learningPartnershipSchema.index({ status: 1 });
learningPartnershipSchema.index({ requestedBy: 1, createdAt: -1 });
// Indexes for PartnerRequest
partnerRequestSchema.index({ userId: 1, isActive: 1 });
partnerRequestSchema.index({ 'criteria.targetScore': 1 });
partnerRequestSchema.index({ 'criteria.currentScoreRange.min': 1, 'criteria.currentScoreRange.max': 1 });
partnerRequestSchema.index({ isActive: 1, expiresAt: 1 });
// Method: Accept partnership
learningPartnershipSchema.methods.accept = function () {
    this.status = PartnershipStatus.ACTIVE;
    this.acceptedAt = new Date();
};
// Method: Cancel partnership
learningPartnershipSchema.methods.cancel = function (userId) {
    this.status = PartnershipStatus.CANCELLED;
    this.cancelledAt = new Date();
    this.cancelledBy = userId;
};
// Method: Complete partnership
learningPartnershipSchema.methods.complete = function () {
    this.status = PartnershipStatus.COMPLETED;
    this.completedAt = new Date();
};
// Method: Add study session
learningPartnershipSchema.methods.addStudySession = function (session) {
    this.studySessions.push({
        ...session,
        attendees: []
    });
};
// Method: Add feedback
learningPartnershipSchema.methods.addFeedback = function (providedBy, rating, comment) {
    this.feedback = this.feedback || [];
    this.feedback.push({
        providedBy,
        rating,
        comment,
        createdAt: new Date()
    });
};
// Method: Get partner for user
learningPartnershipSchema.methods.getPartnerFor = function (userId) {
    if (this.partner1.toString() === userId.toString()) {
        return this.partner2;
    }
    else if (this.partner2.toString() === userId.toString()) {
        return this.partner1;
    }
    return null;
};
// Method: Update progress for partner
learningPartnershipSchema.methods.updateProgress = function (userId, progress) {
    const isPartner1 = this.partner1.toString() === userId.toString();
    const partnerProgress = isPartner1
        ? this.progressTracking.partner1Progress
        : this.progressTracking.partner2Progress;
    if (progress.currentScore !== undefined) {
        partnerProgress.currentScore = progress.currentScore;
    }
    if (progress.questionsCompleted !== undefined) {
        partnerProgress.questionsCompleted = progress.questionsCompleted;
    }
    if (progress.studyHours !== undefined) {
        partnerProgress.studyHours = progress.studyHours;
    }
};
/**
 * Partnership Models
 */
exports.LearningPartnership = mongoose_1.default.model('LearningPartnership', learningPartnershipSchema);
exports.PartnerRequest = mongoose_1.default.model('PartnerRequest', partnerRequestSchema);
//# sourceMappingURL=LearningPartnership.js.map