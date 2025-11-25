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
exports.Course = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const lessonSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    videoUrl: {
        type: String,
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
    },
    order: {
        type: Number,
        required: true,
    },
    isFree: {
        type: Boolean,
        default: false,
    },
    materials: [String],
});
const courseSchema = new mongoose_1.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    description: {
        type: String,
        required: true,
    },
    instructor: {
        type: String,
        required: true,
    },
    thumbnailUrl: {
        type: String,
    },
    targetScore: {
        type: Number,
        required: true,
        enum: [327, 387, 450, 550, 600],
    },
    level: {
        type: String,
        enum: ['beginner', 'intermediate', 'advanced'],
        required: true,
    },
    category: {
        type: String,
        enum: ['grammar', 'vocabulary', 'listening', 'reading', 'comprehensive'],
        required: true,
    },
    price: {
        type: Number,
        required: true,
        min: 0,
    },
    discountPrice: {
        type: Number,
        min: 0,
    },
    duration: {
        type: Number,
        required: true,
        min: 0,
    },
    lessonsCount: {
        type: Number,
        default: 0,
    },
    lessons: [lessonSchema],
    features: [String],
    curriculum: [String],
    requirements: [String],
    isPublished: {
        type: Boolean,
        default: false,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    enrolledCount: {
        type: Number,
        default: 0,
    },
    rating: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
    },
    reviewsCount: {
        type: Number,
        default: 0,
    },
}, {
    timestamps: true,
});
// Indexes for faster queries
courseSchema.index({ targetScore: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ category: 1 });
courseSchema.index({ isPublished: 1 });
courseSchema.index({ isFeatured: 1 });
courseSchema.index({ price: 1 });
courseSchema.index({ title: 'text', description: 'text' }); // Text search
courseSchema.index({ rating: -1 }); // For sorting by rating
courseSchema.index({ enrolledCount: -1 }); // For popular courses
courseSchema.index({ createdAt: -1 }); // For latest courses
// Composite indexes for common queries
courseSchema.index({ isPublished: 1, isFeatured: 1 });
courseSchema.index({ isPublished: 1, targetScore: 1 });
courseSchema.index({ isPublished: 1, category: 1, level: 1 });
// Update lessonsCount before saving
courseSchema.pre('save', function (next) {
    this.lessonsCount = this.lessons.length;
    next();
});
exports.Course = mongoose_1.default.model('Course', courseSchema);
//# sourceMappingURL=Course.js.map