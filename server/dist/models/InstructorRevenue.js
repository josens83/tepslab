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
exports.RevenueShareConfig = exports.PayoutRequest = exports.InstructorRevenue = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const instructorRevenueSchema = new mongoose_1.Schema({
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    courseId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Course',
        required: true,
        index: true,
    },
    enrollmentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Enrollment',
        required: true,
    },
    paymentId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Payment',
        required: true,
    },
    totalAmount: {
        type: Number,
        required: true,
    },
    platformFee: {
        type: Number,
        required: true,
    },
    instructorShare: {
        type: Number,
        required: true,
    },
    sharePercentage: {
        type: Number,
        required: true,
        default: 70, // Default 70% to instructor, 30% to platform
    },
    currency: {
        type: String,
        default: 'KRW',
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'paid', 'refunded'],
        default: 'pending',
        index: true,
    },
    paidAt: {
        type: Date,
    },
    payoutMethod: {
        type: String,
    },
    payoutDetails: {
        type: mongoose_1.Schema.Types.Mixed,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
instructorRevenueSchema.index({ instructorId: 1, status: 1 });
instructorRevenueSchema.index({ status: 1, createdAt: -1 });
instructorRevenueSchema.index({ instructorId: 1, createdAt: -1 });
exports.InstructorRevenue = mongoose_1.default.model('InstructorRevenue', instructorRevenueSchema);
const payoutRequestSchema = new mongoose_1.Schema({
    instructorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    currency: {
        type: String,
        default: 'KRW',
    },
    payoutMethod: {
        type: String,
        enum: ['bank_transfer', 'paypal', 'stripe'],
        required: true,
    },
    payoutDetails: {
        bankName: String,
        accountNumber: String,
        accountHolder: String,
        paypalEmail: String,
        stripeAccountId: String,
    },
    status: {
        type: String,
        enum: ['pending', 'processing', 'completed', 'rejected'],
        default: 'pending',
        index: true,
    },
    revenueIds: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'InstructorRevenue',
        },
    ],
    processedBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    processedAt: {
        type: Date,
    },
    rejectionReason: {
        type: String,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// Indexes
payoutRequestSchema.index({ instructorId: 1, status: 1 });
payoutRequestSchema.index({ status: 1, createdAt: -1 });
exports.PayoutRequest = mongoose_1.default.model('PayoutRequest', payoutRequestSchema);
// Revenue sharing configuration
exports.RevenueShareConfig = {
    default: {
        instructorShare: 70, // 70%
        platformShare: 30, // 30%
    },
    premium: {
        instructorShare: 80, // 80% for premium instructors
        platformShare: 20, // 20%
    },
    enterprise: {
        instructorShare: 85, // 85% for enterprise instructors
        platformShare: 15, // 15%
    },
    minimumPayout: 50000, // Minimum 50,000 KRW for payout
    payoutSchedule: 'monthly', // monthly, biweekly, weekly
    holdingPeriod: 14, // Days to hold revenue before available for payout
};
//# sourceMappingURL=InstructorRevenue.js.map