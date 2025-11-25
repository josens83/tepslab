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
exports.CouponUsage = exports.Coupon = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const couponSchema = new mongoose_1.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        index: true,
    },
    name: {
        type: String,
        required: true,
    },
    description: {
        type: String,
    },
    discountType: {
        type: String,
        enum: ['percentage', 'fixed_amount'],
        required: true,
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0,
    },
    minPurchaseAmount: {
        type: Number,
        default: 0,
    },
    maxDiscountAmount: {
        type: Number,
    },
    usageLimit: {
        type: Number,
    },
    usageCount: {
        type: Number,
        default: 0,
    },
    perUserLimit: {
        type: Number,
        default: 1,
    },
    validFrom: {
        type: Date,
        required: true,
        default: Date.now,
    },
    validUntil: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'expired'],
        default: 'active',
        index: true,
    },
    applicableTiers: {
        type: [String],
        default: [],
    },
    applicableCourses: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Course',
        default: [],
    },
    createdBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    metadata: {
        type: mongoose_1.Schema.Types.Mixed,
    },
}, {
    timestamps: true,
});
// Indexes for efficient queries
couponSchema.index({ code: 1, status: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ status: 1, validUntil: 1 });
// Method to check if coupon is valid
couponSchema.methods.isValid = function () {
    const now = new Date();
    return (this.status === 'active' &&
        now >= this.validFrom &&
        now <= this.validUntil &&
        (!this.usageLimit || this.usageCount < this.usageLimit));
};
// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function (originalAmount) {
    if (!this.isValid()) {
        return 0;
    }
    if (this.minPurchaseAmount && originalAmount < this.minPurchaseAmount) {
        return 0;
    }
    let discount = 0;
    if (this.discountType === 'percentage') {
        discount = (originalAmount * this.discountValue) / 100;
        // Apply maximum discount limit if set
        if (this.maxDiscountAmount && discount > this.maxDiscountAmount) {
            discount = this.maxDiscountAmount;
        }
    }
    else {
        // Fixed amount
        discount = Math.min(this.discountValue, originalAmount);
    }
    return Math.round(discount);
};
exports.Coupon = mongoose_1.default.model('Coupon', couponSchema);
const couponUsageSchema = new mongoose_1.Schema({
    couponId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Coupon',
        required: true,
        index: true,
    },
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        index: true,
    },
    orderId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Payment',
    },
    originalAmount: {
        type: Number,
        required: true,
    },
    discountAmount: {
        type: Number,
        required: true,
    },
    finalAmount: {
        type: Number,
        required: true,
    },
    usedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: false,
});
// Compound index for checking per-user usage
couponUsageSchema.index({ couponId: 1, userId: 1 });
exports.CouponUsage = mongoose_1.default.model('CouponUsage', couponUsageSchema);
//# sourceMappingURL=Coupon.js.map