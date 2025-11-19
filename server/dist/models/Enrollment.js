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
exports.Enrollment = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const progressSchema = new mongoose_1.Schema({
    lessonId: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    completedAt: {
        type: Date,
    },
    lastWatchedAt: {
        type: Date,
        default: Date.now,
    },
    watchDuration: {
        type: Number,
        default: 0,
    },
});
const enrollmentSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
    },
    enrolledAt: {
        type: Date,
        default: Date.now,
    },
    expiresAt: {
        type: Date,
    },
    status: {
        type: String,
        enum: ['active', 'completed', 'expired', 'cancelled'],
        default: 'active',
    },
    progress: [progressSchema],
    completionPercentage: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    lastAccessedAt: {
        type: Date,
        default: Date.now,
    },
    paymentId: {
        type: String,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
enrollmentSchema.index({ userId: 1, courseId: 1 }, { unique: true });
enrollmentSchema.index({ userId: 1, status: 1 });
enrollmentSchema.index({ courseId: 1 });
enrollmentSchema.index({ expiresAt: 1 });
// Calculate completion percentage before saving
enrollmentSchema.pre('save', function (next) {
    if (this.progress.length > 0) {
        const completedLessons = this.progress.filter((p) => p.completed).length;
        this.completionPercentage = Math.round((completedLessons / this.progress.length) * 100);
        // Auto-update status to completed if all lessons are done
        if (this.completionPercentage === 100) {
            this.status = 'completed';
        }
    }
    next();
});
exports.Enrollment = mongoose_1.default.model('Enrollment', enrollmentSchema);
//# sourceMappingURL=Enrollment.js.map